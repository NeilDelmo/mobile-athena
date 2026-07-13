import { Router } from 'express';

import { pool } from '../database.js';
import { HttpError, requirePositiveInteger } from '../http-error.js';

export const dashboardRouter = Router();

dashboardRouter.get('/faculty/:facultyId', async (request, response) => {
  const facultyId = requirePositiveInteger(request.params.facultyId, 'facultyId');

  const [users] = await pool.execute(
    `SELECT id, first_name AS firstName, last_name AS lastName, email, department
       FROM users
      WHERE id = ? AND role = 'faculty' AND is_active = TRUE`,
    [facultyId],
  );

  if (users.length === 0) {
    throw new HttpError(404, 'Faculty user not found.', 'FACULTY_NOT_FOUND');
  }

  const [[stats], [proposals], [notices]] = await Promise.all([
    pool.execute(
      `SELECT
         COUNT(*) AS totalProposals,
         COALESCE(SUM(status IN ('submitted', 'under_evaluation', 'revision_required')), 0) AS activeProposals,
         COALESCE(SUM(status = 'approved'), 0) AS approvedStudies,
         COALESCE(SUM(status IN ('submitted', 'under_evaluation')), 0) AS underEvaluation,
         COALESCE(SUM(status = 'revision_required'), 0) AS actionRequired
       FROM proposals
       WHERE faculty_id = ? AND status <> 'draft'`,
      [facultyId],
    ),
    pool.execute(
      `SELECT
         p.id,
         p.reference_no AS referenceNo,
         p.title,
         p.study_type AS studyType,
         p.status,
         p.submitted_at AS submittedAt,
         p.updated_at AS updatedAt
       FROM proposals p
       WHERE p.faculty_id = ?
       ORDER BY p.updated_at DESC
       LIMIT 10`,
      [facultyId],
    ),
    pool.query(
      `SELECT id, category, title, body, published_at AS publishedAt
       FROM announcements
       WHERE status = 'published'
         AND (starts_at IS NULL OR starts_at <= NOW())
         AND (ends_at IS NULL OR ends_at >= NOW())
       ORDER BY is_featured DESC, published_at DESC
       LIMIT 5`,
    ),
  ]);

  response.json({
    faculty: users[0],
    stats: stats[0],
    proposals,
    notices,
  });
});

dashboardRouter.get('/research-head', async (request, response) => {
  const [[stats], [proposals]] = await Promise.all([
    pool.query(
      `SELECT
         COALESCE(SUM(status = 'submitted'), 0) AS awaitingScreening,
         COALESCE(SUM(status = 'under_evaluation'), 0) AS underEvaluation,
         COALESCE(SUM(status = 'revision_required'), 0) AS revisionRequired,
         COALESCE(SUM(status = 'approved'), 0) AS approvedProjects,
         COUNT(*) AS totalProposals
       FROM proposals
       WHERE status <> 'draft'`,
    ),
    pool.query(
      `SELECT
         p.id,
         p.reference_no AS referenceNo,
         p.title,
         p.study_type AS studyType,
         p.status,
         p.submitted_at AS submittedAt,
         u.id AS facultyId,
         CONCAT(u.first_name, ' ', u.last_name) AS facultyName,
         u.department
       FROM proposals p
       INNER JOIN users u ON u.id = p.faculty_id
       WHERE p.status IN ('submitted', 'under_evaluation', 'revision_required')
       ORDER BY p.submitted_at ASC
       LIMIT 20`,
    ),
  ]);

  response.json({ stats: stats[0], proposals });
});
