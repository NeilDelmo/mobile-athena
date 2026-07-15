import { Router } from 'express';

import { createSessionToken, hashSessionToken, verifyPassword } from '../auth-crypto.js';
import { requireAuth } from '../auth-middleware.js';
import { pool } from '../database.js';
import { HttpError, requireText } from '../http-error.js';

export const authRouter = Router();

const UNIVERSITY_EMAIL_PATTERN = /^[^@\s]+@g\.batstate-u\.edu\.ph$/i;

function publicUser(user) {
  return {
    id: user.id,
    universityId: user.universityId,
    email: user.email,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    role: user.role,
    department: user.department,
  };
}

authRouter.post('/login', async (request, response) => {
  const email = requireText(request.body.email, 'email', 191).toLowerCase();
  const password = requireText(request.body.password, 'password', 200);

  if (!UNIVERSITY_EMAIL_PATTERN.test(email)) {
    throw new HttpError(
      403,
      'Use your @g.batstate-u.edu.ph institutional email address.',
      'UNIVERSITY_EMAIL_REQUIRED',
    );
  }

  const [users] = await pool.execute(
    `SELECT
       id,
       university_id AS universityId,
       email,
       first_name AS firstName,
       middle_name AS middleName,
       last_name AS lastName,
       role,
       department,
       password_hash AS passwordHash
     FROM users
     WHERE email = ? AND is_active = TRUE`,
    [email],
  );

  const user = users[0];
  const passwordValid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !passwordValid) {
    throw new HttpError(401, 'The email or password is incorrect.', 'INVALID_CREDENTIALS');
  }

  await pool.query('DELETE FROM auth_sessions WHERE expires_at <= NOW()');

  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  await pool.execute(
    `INSERT INTO auth_sessions (user_id, token_hash, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
    [user.id, tokenHash],
  );

  response.json({ token, user: publicUser(user) });
});

authRouter.get('/me', requireAuth, (request, response) => {
  response.json({ user: publicUser(request.user) });
});

authRouter.post('/logout', requireAuth, async (request, response) => {
  await pool.execute('DELETE FROM auth_sessions WHERE token_hash = ?', [request.authTokenHash]);
  response.status(204).end();
});
