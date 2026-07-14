import { Router } from 'express';

import { requireAuth, requireRole } from '../auth-middleware.js';
import { pool } from '../database.js';
import { HttpError, requirePositiveInteger, requireText } from '../http-error.js';

export const researchCallRouter = Router();

researchCallRouter.use(requireAuth);

function optionalText(value, fieldName, maxLength, fallback = null) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return requireText(value, fieldName, maxLength);
}

function optionalDate(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, `${fieldName} must use YYYY-MM-DD.`, 'VALIDATION_ERROR');
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, `${fieldName} is invalid.`, 'VALIDATION_ERROR');
  }

  return `${value} 00:00:00`;
}

function readCallContent(body) {
  const title = requireText(body.title, 'title', 255);
  const sponsor = optionalText(body.sponsor, 'sponsor', 180, 'BatStateU Research Office');
  const description = requireText(body.description, 'description', 10000);
  const budget = optionalText(body.budget, 'budget', 120);
  const category = optionalText(body.category, 'category', 120);
  const eligibility = optionalText(body.eligibility, 'eligibility', 5000);
  const opensAt = optionalDate(body.opensAt, 'opensAt');
  const closesAt = optionalDate(body.closesAt, 'closesAt');

  if (opensAt && closesAt && opensAt > closesAt) {
    throw new HttpError(400, 'closesAt must be on or after opensAt.', 'VALIDATION_ERROR');
  }

  return { title, sponsor, description, budget, category, eligibility, opensAt, closesAt };
}

function selectResearchCallQuery(canSeeDrafts) {
  return `SELECT
       rc.id,
       rc.title,
       rc.sponsor,
       rc.description,
       rc.budget,
       rc.category,
       rc.eligibility,
       rc.opens_at AS opensAt,
       rc.closes_at AS closesAt,
       rc.status,
       rc.created_at AS createdAt,
       rc.updated_at AS updatedAt
     FROM research_calls rc
     WHERE rc.id = ? ${canSeeDrafts ? '' : "AND rc.status <> 'draft'"}`;
}

researchCallRouter.get('/', async (request, response) => {
  const canSeeDrafts = ['research_head', 'admin'].includes(request.user.role);
  const [researchCalls] = await pool.query(
    `SELECT
       rc.id,
       rc.title,
       rc.sponsor,
       rc.description,
       rc.budget,
       rc.category,
       rc.eligibility,
       rc.opens_at AS opensAt,
       rc.closes_at AS closesAt,
       rc.status,
       rc.created_at AS createdAt,
       rc.updated_at AS updatedAt,
       CONCAT(u.first_name, ' ', u.last_name) AS createdBy
     FROM research_calls rc
     INNER JOIN users u ON u.id = rc.created_by
     ${canSeeDrafts ? '' : "WHERE rc.status <> 'draft'"}
     ORDER BY COALESCE(rc.closes_at, '9999-12-31') ASC, rc.created_at DESC`,
  );

  response.json({ researchCalls });
});

researchCallRouter.get('/:researchCallId', async (request, response) => {
  const researchCallId = requirePositiveInteger(request.params.researchCallId, 'researchCallId');
  const canSeeDrafts = ['research_head', 'admin'].includes(request.user.role);
  const [researchCalls] = await pool.execute(selectResearchCallQuery(canSeeDrafts), [researchCallId]);

  if (researchCalls.length === 0) {
    throw new HttpError(404, 'Research call not found.', 'RESEARCH_CALL_NOT_FOUND');
  }

  response.json({ researchCall: researchCalls[0] });
});

researchCallRouter.post(
  '/',
  requireRole('research_head', 'admin'),
  async (request, response) => {
    const { title, sponsor, description, budget, category, eligibility, opensAt, closesAt } =
      readCallContent(request.body);
    const status = request.body.status ?? 'draft';

    if (!['draft', 'open'].includes(status)) {
      throw new HttpError(400, 'status must be draft or open.', 'VALIDATION_ERROR');
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(
        `INSERT INTO research_calls
           (title, sponsor, description, budget, category, eligibility,
            opens_at, closes_at, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          sponsor,
          description,
          budget,
          category,
          eligibility,
          opensAt,
          closesAt,
          status,
          request.user.id,
        ],
      );

      if (status === 'open') {
        await connection.execute(
          `INSERT INTO notifications
             (user_id, type, title, message, href, research_call_id)
           SELECT id, 'deadline', 'New research call', ?, ?, ?
             FROM users
            WHERE role = 'faculty' AND is_active = TRUE`,
          [`${title} is now open for faculty applications.`, `/research-call/${result.insertId}`, result.insertId],
        );
      }

      await connection.commit();
      response.status(201).json({ researchCall: { id: result.insertId } });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
);

researchCallRouter.patch(
  '/:researchCallId',
  requireRole('research_head', 'admin'),
  async (request, response) => {
    const researchCallId = requirePositiveInteger(request.params.researchCallId, 'researchCallId');
    const { title, sponsor, description, budget, category, eligibility, opensAt, closesAt } =
      readCallContent(request.body);
    const [existing] = await pool.execute('SELECT id FROM research_calls WHERE id = ?', [researchCallId]);

    if (existing.length === 0) {
      throw new HttpError(404, 'Research call not found.', 'RESEARCH_CALL_NOT_FOUND');
    }

    await pool.execute(
      `UPDATE research_calls
          SET title = ?, sponsor = ?, description = ?, budget = ?, category = ?,
              eligibility = ?, opens_at = ?, closes_at = ?
        WHERE id = ?`,
      [title, sponsor, description, budget, category, eligibility, opensAt, closesAt, researchCallId],
    );

    response.json({ researchCall: { id: researchCallId } });
  },
);

researchCallRouter.patch(
  '/:researchCallId/status',
  requireRole('research_head', 'admin'),
  async (request, response) => {
    const researchCallId = requirePositiveInteger(request.params.researchCallId, 'researchCallId');
    const nextStatus = request.body.status;

    if (!['open', 'closed'].includes(nextStatus)) {
      throw new HttpError(400, 'status must be open or closed.', 'VALIDATION_ERROR');
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      const [researchCalls] = await connection.execute(
        `SELECT id, title, status, closes_at AS closesAt
           FROM research_calls
          WHERE id = ?
          FOR UPDATE`,
        [researchCallId],
      );

      if (researchCalls.length === 0) {
        throw new HttpError(404, 'Research call not found.', 'RESEARCH_CALL_NOT_FOUND');
      }

      const researchCall = researchCalls[0];
      const allowedTransitions = {
        draft: ['open'],
        open: ['closed'],
        closed: ['open'],
      };

      if (researchCall.status === nextStatus) {
        await connection.commit();
        response.json({ researchCall: { id: researchCallId, status: nextStatus } });
        return;
      }

      if (!allowedTransitions[researchCall.status]?.includes(nextStatus)) {
        throw new HttpError(
          409,
          `A ${researchCall.status} research call cannot be changed to ${nextStatus}.`,
          'INVALID_RESEARCH_CALL_TRANSITION',
        );
      }

      if (nextStatus === 'open' && researchCall.closesAt && researchCall.closesAt <= new Date()) {
        throw new HttpError(
          409,
          'Update the closing date before publishing or reopening this call.',
          'RESEARCH_CALL_DEADLINE_PASSED',
        );
      }

      await connection.execute('UPDATE research_calls SET status = ? WHERE id = ?', [nextStatus, researchCallId]);

      if (nextStatus === 'open') {
        const reopened = researchCall.status === 'closed';
        await connection.execute(
          `INSERT INTO notifications
             (user_id, type, title, message, href, research_call_id)
           SELECT id, 'deadline', ?, ?, ?, ?
             FROM users
            WHERE role = 'faculty' AND is_active = TRUE`,
          [
            reopened ? 'Research call reopened' : 'New research call',
            `${researchCall.title} is ${reopened ? 'open again' : 'now open'} for faculty applications.`,
            `/research-call/${researchCallId}`,
            researchCallId,
          ],
        );
      }

      await connection.commit();
      response.json({ researchCall: { id: researchCallId, status: nextStatus } });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
);
