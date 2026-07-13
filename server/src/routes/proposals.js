import { randomUUID } from 'node:crypto';

import { Router } from 'express';

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

function makeReferenceNumber() {
  return `ATH-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

proposalRouter.get('/', async (request, response) => {
  const conditions = [];
  const values = [];

  if (request.query.facultyId !== undefined) {
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
       p.study_type AS studyType,
       p.status,
       p.current_revision AS currentRevision,
       p.submitted_at AS submittedAt,
       p.decided_at AS decidedAt,
       p.created_at AS createdAt,
       u.id AS facultyId,
       CONCAT(u.first_name, ' ', u.last_name) AS facultyName,
       u.department
     FROM proposals p
     INNER JOIN users u ON u.id = p.faculty_id
     ${whereClause}
     ORDER BY p.updated_at DESC
     LIMIT ${limit}`,
    values,
  );

  response.json({ proposals });
});

proposalRouter.get('/:proposalId', async (request, response) => {
  const proposalId = requirePositiveInteger(request.params.proposalId, 'proposalId');
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
     WHERE p.id = ?`,
    [proposalId],
  );

  if (proposals.length === 0) {
    throw new HttpError(404, 'Proposal not found.', 'PROPOSAL_NOT_FOUND');
  }

  const [[documents], [reviews], [history]] = await Promise.all([
    pool.execute(
      `SELECT id, document_type AS documentType, file_name AS fileName, mime_type AS mimeType,
              file_size AS fileSize, uploaded_at AS uploadedAt
       FROM proposal_documents
       WHERE proposal_id = ?
       ORDER BY uploaded_at DESC`,
      [proposalId],
    ),
    pool.execute(
      `SELECT r.id, r.decision, r.comments, r.decided_at AS decidedAt,
              CONCAT(u.first_name, ' ', u.last_name) AS reviewerName
       FROM proposal_reviews r
       INNER JOIN users u ON u.id = r.reviewer_id
       WHERE r.proposal_id = ?
       ORDER BY r.decided_at DESC`,
      [proposalId],
    ),
    pool.execute(
      `SELECT h.id, h.from_status AS fromStatus, h.to_status AS toStatus, h.note,
              h.created_at AS createdAt,
              CONCAT(u.first_name, ' ', u.last_name) AS changedBy
       FROM proposal_status_history h
       LEFT JOIN users u ON u.id = h.changed_by
       WHERE h.proposal_id = ?
       ORDER BY h.created_at DESC`,
      [proposalId],
    ),
  ]);

  response.json({ proposal: proposals[0], documents, reviews, history });
});

proposalRouter.post('/', async (request, response) => {
  const facultyId = requirePositiveInteger(request.body.facultyId, 'facultyId');
  const title = requireText(request.body.title, 'title', 255);
  const abstractText = requireText(request.body.abstractText, 'abstractText', 10000);
  const studyType = requireText(request.body.studyType ?? 'Institutional Research', 'studyType', 100);
  const department = requireText(request.body.department, 'department', 150);
  const keywords = Array.isArray(request.body.keywords)
    ? request.body.keywords.filter((keyword) => typeof keyword === 'string').slice(0, 20)
    : [];

  const [faculty] = await pool.execute(
    `SELECT id FROM users WHERE id = ? AND role = 'faculty' AND is_active = TRUE`,
    [facultyId],
  );

  if (faculty.length === 0) {
    throw new HttpError(404, 'Faculty user not found.', 'FACULTY_NOT_FOUND');
  }

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

proposalRouter.patch('/:proposalId/decision', async (request, response) => {
  const proposalId = requirePositiveInteger(request.params.proposalId, 'proposalId');
  const reviewerId = requirePositiveInteger(request.body.reviewerId, 'reviewerId');
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

    const [reviewers] = await connection.execute(
      `SELECT id FROM users
       WHERE id = ? AND role IN ('research_head', 'admin') AND is_active = TRUE`,
      [reviewerId],
    );

    if (reviewers.length === 0) {
      throw new HttpError(403, 'Reviewer is not authorized.', 'REVIEWER_NOT_AUTHORIZED');
    }

    const [proposals] = await connection.execute(
      `SELECT id, status FROM proposals WHERE id = ? FOR UPDATE`,
      [proposalId],
    );

    if (proposals.length === 0) {
      throw new HttpError(404, 'Proposal not found.', 'PROPOSAL_NOT_FOUND');
    }

    const previousStatus = proposals[0].status;

    if (previousStatus === 'approved' || previousStatus === 'rejected') {
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
      [proposalId, previousStatus, decision, reviewerId, comments],
    );

    await connection.commit();
    response.json({ proposal: { id: proposalId, status: decision } });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});
