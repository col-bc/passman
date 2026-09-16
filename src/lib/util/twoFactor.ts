'use server';
import * as OTPAuth from 'otpauth';
import 'server-only';

/**
 * Generates a two-factor authentication secret.
 * @param length The length of the generated two-factor secret in bytes. Must be at least 16.
 * @returns A promise that resolves to the generated two-factor secret in base32 format.
 */
export async function generateTwoFactorSecret(length: number = 24): Promise<string> {
  if (length < 16) {
    throw new Error('Two-factor secret length must be at least 16 bytes.');
  }
  return new OTPAuth.Secret({ size: length }).base32;
}

/**
 * Generates a TOTP (Time-based One-Time Password) authentication scheme URI for two-factor authentication setup.
 * @param data An object containing the label and secret for the TOTP authentication scheme.
 * @returns A promise that resolves to the TOTP authentication scheme URI.
 */
export async function getTotpAuthScheme(data: { label: string; secret: string }) {
  return new OTPAuth.TOTP({
    issuer: 'Passman',
    label: data.label,
    secret: data.secret,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  }).toString();
}

/**
 * Verifies a TOTP (Time-based One-Time Password) token against the provided secret.
 * @param data An object containing the token and secret for verification.
 * @returns A boolean indicating whether the TOTP token is valid.
 */
export async function verifyTotp(data: { token: string; secret: string }) {
  return new OTPAuth.TOTP({
    issuer: 'Passman',
    label: 'Passman',
    secret: data.secret,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  }).validate({ token: data.token });
}

/**
 * Generates a TOTP (Time-based One-Time Password) token for the provided secret.
 * @param data An object containing the secret for which to generate the TOTP token.
 * @returns The generated TOTP token.
 */
export async function generateTotpToken(data: { secret: string }) {
  return new OTPAuth.TOTP({
    issuer: 'Passman',
    label: 'Passman',
    secret: data.secret,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  }).generate();
}

/**
 * Generates recovery codes for two-factor authentication backup.
 * @param count The number of recovery codes to generate. Default is 10.
 * @param length The length of each recovery code. Default is 16.
 * @returns A promise that resolves to an array of generated recovery codes.
 */
export async function generateRecoveryCodes(count: number = 10, length: number = 16): Promise<string[]> {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(Array.from({ length }, () => Math.floor(Math.random() * 36).toString(36)).join(''));
  }
  return codes;
}
