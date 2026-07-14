import { pool } from './database.js';
import { hashSessionToken } from './auth-crypto.js';
import { HttpError } from './http-error.js';

function getBearerToken(request) {
  const authorization = request.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice(7).trim() || null;
}

export async function requireAuth(request, response, next) {
  const token = getBearerToken(request);

  if (!token) {
    throw new HttpError(401, 'Sign in to continue.', 'AUTH_REQUIRED');
  }

  const tokenHash = hashSessionToken(token);
  const [sessions] = await pool.execute(
    `SELECT
       s.id AS sessionId,
       u.id,
       u.university_id AS universityId,
       u.email,
       u.first_name AS firstName,
       u.middle_name AS middleName,
       u.last_name AS lastName,
       u.role,
       u.department
     FROM auth_sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?
       AND s.expires_at > NOW()
       AND u.is_active = TRUE`,
    [tokenHash],
  );

  if (sessions.length === 0) {
    throw new HttpError(401, 'Your session has expired. Sign in again.', 'SESSION_EXPIRED');
  }

  request.authTokenHash = tokenHash;
  request.user = sessions[0];
  await pool.execute('UPDATE auth_sessions SET last_used_at = NOW() WHERE id = ?', [sessions[0].sessionId]);
  next();
}

export function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      throw new HttpError(403, 'You do not have permission to perform this action.', 'FORBIDDEN');
    }

    next();
  };
}
