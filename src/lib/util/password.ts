import { hash, HashOptions, verify, VerifyOptions } from 'argon2';
import zxcvbn from 'zxcvbn';

// OWASP Recommended Parameters
const ARGON2_CONFIG = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4,
};

/**
 * Hashes a plain text password using Argon2id.
 * @param password The plain text password from the user.
 * @param email The user's email, used as a salt for hashing.
 * @returns {Promise<string>} A promise that resolves to the hashed password string.
 * @throws An error if the password is less than 8 characters long.
 */
export async function hashPassword(password: string, email: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  return hash(password, {
    ...ARGON2_CONFIG,
    salt: Buffer.from(email, 'utf-8'),
  } as HashOptions);
}

/**
 * Verifies a plain text password against an existing Argon2id hash.
 * @param password The plain text password to check.
 * @param hash The stored Argon2id hash string.
 * @returns {Promise<boolean>} A promise that resolves to true if the password matches the hash, false otherwise.
 */
export async function verifyPassword(password: string, email: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }

  try {
    return await verify(hash, password, {
      ...ARGON2_CONFIG,
      salt: Buffer.from(email, 'utf-8'),
    } as VerifyOptions);
  } catch (error) {
    console.warn('Password verification failed:', error);
    return false;
  }
}

export function checkPasswordStrength(password: string): boolean {
  // minimum 12 characters, at least one uppercase letter, one lowercase letter, one number, one special character and no zxcvbn feedback
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isStrong = password.length >= 12 && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  const passwordStrength = zxcvbn(password);
  return isStrong && passwordStrength.score >= 3 && passwordStrength.feedback.warning === '';
}
