import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Hashes a plaintext password using the scrypt key derivation function.
 * Returns a string formatted as "salt:hash" in hexadecimal format.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Compares a plaintext password against a stored "salt:hash" string.
 * Uses timingSafeEqual to protect against timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) {
    return false;
  }
  
  const [salt, hash] = parts;
  if (!salt || !hash) {
    return false;
  }

  const hashToCompare = scryptSync(password, salt, 64).toString('hex');
  
  // Prevent timing attacks by checking match in constant time
  return timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(hashToCompare, 'hex')
  );
}
