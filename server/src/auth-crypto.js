import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt:${salt}:${Buffer.from(derivedKey).toString('hex')}`;
}

export async function verifyPassword(password, encodedHash) {
  if (typeof encodedHash !== 'string') {
    return false;
  }

  const [algorithm, salt, storedHex] = encodedHash.split(':');

  if (algorithm !== 'scrypt' || !salt || !storedHex) {
    return false;
  }

  const stored = Buffer.from(storedHex, 'hex');
  const derivedKey = Buffer.from(await scrypt(password, salt, stored.length));
  return stored.length === derivedKey.length && timingSafeEqual(stored, derivedKey);
}

export function createSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
