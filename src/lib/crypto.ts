'use client';

/**
 * Derives a 32-byte (64-character hex) AES-256 key from a password using PBKDF2.
 *
 * @param password - The user's raw password string.
 * @param salt - A unique string for the user (e.g., a stored random string, or user ID/email).
 * @param iterations - Number of hashing iterations (default: 600,000 per OWASP recommendations).
 */
export async function deriveHexKey(password: string, salt: string, iterations = 600000): Promise<string> {
  const encoder = new TextEncoder();

  // Import the raw string into a base key material object
  const baseKey = await window.crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, [
    'deriveBits',
  ]);

  //  Derive 256 bits (32 bytes) for AES-256 from the password using PBKDF2
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: iterations,
      hash: 'SHA-256',
    },
    baseKey,
    256,
  );

  // Convert the to a hex string
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hexString = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');

  return hexString;
}

/**
 * Converts a hex string key into a CryptoKey usable by the Web Crypto API.
 * @param hexKey - A 64-character (32-byte) hex string representing the AES-256 key
 */
async function importKey(hexKey: string): Promise<CryptoKey> {
  // Convert hex string to Uint8Array
  const keyBytes = new Uint8Array(hexKey.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);

  return await window.crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export interface EncryptedData {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  tag: Uint8Array;
}

/** Encrypts a JSON-serializable object using AES-256-GCM.
 *
 * @param payload - The data to encrypt (object, string, array, etc.)
 * @param hexKey - A 64-character (32-byte) hex string representing the AES-256 key
 * @returns {Promise<EncryptedData>} The encrypted data, including ciphertext, iv, and tag
 */
export async function encryptPayload(payload: unknown, hexKey: string): Promise<EncryptedData> {
  const key = await importKey(hexKey);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Serialize the payload, then encode it
  const jsonPayload = JSON.stringify(payload);
  const encodedPayload = new TextEncoder().encode(jsonPayload);

  // Web Crypto API appends the 16-byte auth tag to the end of the ciphertext
  const encryptedBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodedPayload);

  const encryptedBytes = new Uint8Array(encryptedBuffer);

  // Split the combined buffer
  const ciphertext = encryptedBytes.slice(0, -16);
  const tag = encryptedBytes.slice(-16);

  return { ciphertext, iv, tag };
}

/**Decrypts an AES-256-GCM encrypted payload to original JSON.
 *
 * @param data - The EncryptedData object containing ciphertext, iv, and tag
 * @param hexKey - The same 64-character hex string used for encryption
 * @returns {Promise<T>} The decrypted data, parsed from JSON
 */
export async function decryptPayload<T = unknown>(data: EncryptedData, hexKey: string): Promise<T> {
  const key = await importKey(hexKey);

  // Web Crypto API requires the ciphertext and tag to be concatenated
  const combinedBuffer = new Uint8Array(data.ciphertext.length + data.tag.length);
  combinedBuffer.set(data.ciphertext, 0);
  combinedBuffer.set(data.tag, data.ciphertext.length);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(data.iv),
      },
      key,
      combinedBuffer,
    );

    // Decode bytes and parse JSON
    const jsonString = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed. The payload may have been tampered with or the key is incorrect.');
  }
}

/**
 * Derives a SHA-256 hash from the concatenation of password and email.
 * This can be used for authentication purposes, such as generating a unique hash for user login.
 * @param password - The user's raw password string.
 * @param email - The user's email address.
 * @returns {Promise<string>} A 64-character hex string representing the SHA-256 hash.
 */
export async function deriveAuthHash(password: string, email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + email);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates an RSA-OAEP key pair and encrypts the private key with the provided Master Encryption Key (MEK).
 * @param mek - The Master Encryption Key used to encrypt the private key.
 * @returns An object containing the Base64-encoded public key and the encrypted private key.
 */
export async function generateUserKeyPair(mekHex: string): Promise<{ publicKey: string; encryptedPrivateKey: string }> {
  const mek = await importKey(mekHex);
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // Must be true so we can export the keys
    ['encrypt', 'decrypt'],
  );

  const rawPublicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyString = bufferToBase64(rawPublicKey);

  const rawPrivateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedPrivateKeyBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, mek, rawPrivateKey);

  const encryptedKeyWithIv = new Uint8Array(iv.byteLength + encryptedPrivateKeyBuffer.byteLength);
  encryptedKeyWithIv.set(iv, 0);
  encryptedKeyWithIv.set(new Uint8Array(encryptedPrivateKeyBuffer), iv.byteLength);

  const encryptedPrivateKeyString = bufferToBase64(encryptedKeyWithIv.buffer);

  return {
    publicKey: publicKeyString,
    encryptedPrivateKey: encryptedPrivateKeyString,
  };
}

/**
 * Utility to convert an ArrayBuffer to a Base64 string for easy database storage
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join('');
  return window.btoa(binary);
}

export function stringToUint8(str: string): Uint8Array {
  const binary = window.atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
