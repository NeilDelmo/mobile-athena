import { Router } from 'express';

import { requireAuth } from '../auth-middleware.js';
import { pool } from '../database.js';
import { HttpError, requirePositiveInteger } from '../http-error.js';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get('/', async (request, response) => {
  const [notifications] = await pool.execute(
    `SELECT
       id,
       type,
       title,
       message,
       href,
       proposal_id AS proposalId,
       research_call_id AS researchCallId,
       read_at AS readAt,
       created_at AS createdAt
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 100`,
    [request.user.id],
  );

  response.json({ notifications });
});

notificationRouter.patch('/read-all', async (request, response) => {
  await pool.execute(
    'UPDATE notifications SET read_at = COALESCE(read_at, NOW()) WHERE user_id = ?',
    [request.user.id],
  );
  response.status(204).end();
});

notificationRouter.patch('/:notificationId/read', async (request, response) => {
  const notificationId = requirePositiveInteger(request.params.notificationId, 'notificationId');
  const [result] = await pool.execute(
    `UPDATE notifications
        SET read_at = COALESCE(read_at, NOW())
      WHERE id = ? AND user_id = ?`,
    [notificationId, request.user.id],
  );

  if (result.affectedRows === 0) {
    throw new HttpError(404, 'Notification not found.', 'NOTIFICATION_NOT_FOUND');
  }

  response.status(204).end();
});
