import { randomUUID } from 'node:crypto';

import { Router } from 'express';

import { requireAuth, requireRole } from '../auth-middleware.js';
import { pool } from '../database.js';
import { HttpError, requirePositiveInteger, requireText } from '../http-error.js';

export const proposalRouter = Router();

const PROPOSAL_STATUSES = new Set([
  'draft',
  'submitted',
  'under_evaluation',
  'revision_required',
  'approved',
  'rejected',
]);

const DECISIONS = new Set(['approved', 'revision_required', 'rejected']);

proposalRouter.use(requireAuth);

function makeReferenceNumber() {
  return `ATH-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

async function attachProposalActivity(proposals) {
  if (proposals.length === 0) {
    return proposals;
  }

  const ids = proposals.map((proposal) => proposal.id);
  const placeholders = ids.map(() => '?').join(', ');
  const [[history], [reviews]] = await Promise.all([
    pool.execute(
      `SELECT
         h.id,
         h.proposal_id AS proposalId,
         h.from_status AS fromStatus,
         h.to_status AS toStatus,
         h.note,
         h.created_at AS createdAt,
         CONCAT(u.first_name, ' ', u.last_name) AS changedBy
       FROM proposal_status_history h
       LEFT JOIN users u ON u.id = h.changed_by
       WHERE h.proposal_id IN (${placeholders})
       ORDER BY h.created_at ASC`,
      ids,
    ),
    pool.execute(
      `SELECT
         r.id,
         r.proposal_id AS proposalId,
         r.decision,
         r.comments,
         r.decided_at AS decidedAt,
         CONCAT(u.first_name, ' ', u.last_name) AS reviewerName
       FROM proposal_reviews r
       INNER JOIN users u ON u.id = r.reviewer_id
       WHERE r.proposal_id IN (${placeholders})
       ORDER BY r.decided_at ASC`,
      ids,
    ),
  ]);

  return proposals.map((proposal) => ({
    ...proposal,
    history: history.filter((item) => item.proposalId === proposal.id),
    reviews: reviews.filter((item) => item.proposalId === proposal.id),
  }));
}

proposalRouter.get('/', async (request, response) => {
  const conditions = [];
  const values = [];

  if (request.user.role === 'faculty') {
    conditions.push('p.faculty_id = ?');
    values.push(request.user.id);
  } else if (request.query.facultyId !== undefined) {
    conditions.push('p.faculty_id = ?');
    values.push(requirePositiveInteger(request.query.facultyId, 'facultyId'));
  }

  if (request.query.status !== undefined && request.query.status !== 'all') {
    if (!PROPOSAL_STATUSES.has(request.query.status)) {
      throw new HttpError(400, 'status is invalid.', 'VALIDATION_ERROR');
    }

    conditions.push('p.status = ?');
    values.push(request.query.status);
  }

  if (typeof request.query.q === 'string' && request.query.q.trim()) {
    conditions.push('(p.title LIKE ? OR p.reference_no LIKE ? OR CONCAT(u.first_name, " ", u.last_name) LIKE ?)');
    const search = `%${request.query.q.trim()}%`;
    values.push(search, search, search);
  }

  const requestedLimit = Number(request.query.limit ?? 50);
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [proposals] = await pool.execute(
    `SELECT
       p.id,
       p.reference_no AS referenceNo,
       p.title,
       p.abstract_text AS abstractText,
       p.keywords,
       p.study_type AS studyType,
       p.department,
       p.status,
       p.current_revision AS currentRevision,
       p.submitted_at AS submittedAt,
       p.decided_at AS decidedAt,
       p.created_at AS createdAt,
       p.updated_at AS updatedAt,
       u.id AS facultyId,
       CONCAT(u.first_name, ' ', u.last_name) AS facultyName,
       u.email AS facultyEmail
     FROM proposals p
     INNER JOIN users u ON u.id = p.faculty_id
     ${whereClause}
     ORDER BY p.updated_at DESC
     LIMIT ${limit}`,
    values,
  );

  response.json({ proposals: await attachProposalActivity(proposals) });
});

proposalRouter.get('/:proposalId', async (request, response) => {
  const proposalId = requirePositiveInteger(request.params.proposalId, 'proposalId');
  const conditions = ['p.id = ?'];
  const values = [proposalId];

  if (request.user.role === 'faculty') {
    conditions.push('p.faculty_id = ?');
    values.push(request.user.id);
  }

  const [proposals] = await pool.execute(
    `SELECT
       p.id,
       p.reference_no AS referenceNo,
       p.title,
       p.abstract_text AS abstractText,
       p.keywords,
       p.study_type AS studyType,
       p.department,
       p.status,
       p.current_revision AS currentRevision,
       p.submitted_at AS submittedAt,
       p.decided_at AS decidedAt,
       p.created_at AS createdAt,
       p.updated_at AS updatedAt,
       u.id AS facultyId,
       CONCAT(u.first_name, ' ', u.last_name) AS facultyName,
       u.email AS facultyEmail
     FROM proposals p
     INNER JOIN users u ON u.id = p.faculty_id
     WHERE ${conditions.join(' AND ')}`,
    values,
  );

  if (proposals.length === 0) {
    throw new HttpError(404, 'Proposal not found.', 'PROPOSAL_NOT_FOUND');
  }

  const [[documents], enriched] = await Promise.all([
    pool.execute(
      `SELECT id, document_type AS documentType, file_name AS fileName, mime_type AS mimeType,
              file_size AS fileSize, uploaded_at AS uploadedAt
       FROM proposal_documents
       WHERE proposal_id = ?
       ORDER BY uploaded_at DESC`,
      [proposalId],
    ),
    attachProposalActivity(proposals),
  ]);

  response.json({
    proposal: enriched[0],
    documents,
    reviews: enriched[0].reviews,
    history: enriched[0].history,
  });
});

proposalRouter.post('/', requireRole('faculty'), async (request, response) => {
  const facultyId = request.user.id;
  const title = requireText(request.body.title, 'title', 255);
  const abstractText = requireText(request.body.abstractText, 'abstractText', 10000);
  const studyType = requireText(request.body.studyType ?? 'Institutional Research', 'studyType', 100);
  const department = requireText(request.body.department, 'department', 150);
  const keywords = Array.isArray(request.body.keywords)
    ? request.body.keywords.filter((keyword) => typeof keyword === 'string').slice(0, 20)
    : [];

  const referenceNo = makeReferenceNumber();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      `INSERT INTO proposals
         (reference_no, faculty_id, title, abstract_text, keywords, study_type, department,
          status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())`,
      [referenceNo, facultyId, title, abstractText, JSON.stringify(keywords), studyType, department],
    );

    await connection.execute(
      `INSERT INTO proposal_status_history
         (proposal_id, from_status, to_status, changed_by, note)
       VALUES (?, NULL, 'submitted', ?, 'Proposal submitted by faculty.')`,
      [result.insertId, facultyId],
    );

    await connection.execute(
      `INSERT INTO notifications (user_id, type, title, message, href, proposal_id)
       SELECT id, 'submission', 'Proposal ready for screening', ?, '/research-head', ?
       FROM users
       WHERE role IN ('research_head', 'admin') AND is_active = TRUE`,
      [`${referenceNo} is waiting for institutional evaluation.`, result.insertId],
    );

    await connection.commit();
    response.status(201).json({
      proposal: { id: result.insertId, referenceNo, status: 'submitted' },
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

proposalRouter.patch(
  '/:proposalId/decision',
  requireRole('research_head', 'admin'),
  async (request, response) => {
    const proposalId = requirePositiveInteger(request.params.proposalId, 'proposalId');
    const reviewerId = request.user.id;
    const decision = request.body.decision;
    const comments = requireText(request.body.comments, 'comments', 5000);

    if (!DECISIONS.has(decision)) {
      throw new HttpError(
        400,
        'decision must be approved, revision_required, or rejected.',
        'VALIDATION_ERROR',
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      const [proposals] = await connection.execute(
        `SELECT id, reference_no AS referenceNo, faculty_id AS facultyId, status
         FROM proposals WHERE id = ? FOR UPDATE`,
        [proposalId],
      );

      if (proposals.length === 0) {
        throw new HttpError(404, 'Proposal not found.', 'PROPOSAL_NOT_FOUND');
      }

      const proposal = proposals[0];

      if (proposal.status === 'approved' || proposal.status === 'rejected') {
        throw new HttpError(409, 'This proposal already has a final decision.', 'DECISION_ALREADY_RECORDED');
      }

      await connection.execute(
        `INSERT INTO proposal_reviews (proposal_id, reviewer_id, decision, comments)
         VALUES (?, ?, ?, ?)`,
        [proposalId, reviewerId, decision, comments],
      );

      await connection.execute(
        `UPDATE proposals
         SET status = ?, decided_at = IF(? IN ('approved', 'rejected'), NOW(), NULL)
         WHERE id = ?`,
        [decision, decision, proposalId],
      );

      await connection.execute(
        `INSERT INTO proposal_status_history
           (proposal_id, from_status, to_status, changed_by, note)
         VALUES (?, ?, ?, ?, ?)`,
        [proposalId, proposal.status, decision, reviewerId, comments],
      );

      const notificationTitle =
        decision === 'approved'
          ? 'Proposal approved'
          : decision === 'rejected'
            ? 'Proposal rejected'
            : 'Revision requested';
      const notificationType = decision === 'revision_required' ? 'revision' : 'decision';
      await connection.execute(
        `INSERT INTO notifications
           (user_id, type, title, message, href, proposal_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          proposal.facultyId,
          notificationType,
          notificationTitle,
          comments,
          `/faculty-project/${proposal.referenceNo}`,
          proposalId,
        ],
      );

      await connection.commit();
      response.json({ proposal: { id: proposalId, status: decision } });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
);
