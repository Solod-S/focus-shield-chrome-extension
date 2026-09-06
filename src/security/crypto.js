/**
 * Web Crypto PBKDF2 password hashing helper.
 */

const ITERATIONS = 100000;
const KEY_LEN = 256; // bits

function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Derives a PBKDF2 hash from a password and salt.
 * @param {string} password
 * @param {Uint8Array} saltBytes
 * @param {number} [iterations=100000]
 * @returns {Promise<string>} Hex-encoded hash
 */
async function deriveKey(password, saltBytes, iterations = ITERATIONS) {
  const subtle = globalThis.crypto?.subtle || globalThis.crypto?.webcrypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API is not available');
  }

  const enc = new TextEncoder();
  const passwordKey = await subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    KEY_LEN
  );

  return bufferToHex(derivedBits);
}

/**
 * Creates password credential object with salt and PBKDF2 hash.
 * @param {string} password
 * @returns {Promise<{ salt: string, hash: string, iterations: number, algorithmVersion: number }>}
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const saltBytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(saltBytes);

  const hash = await deriveKey(password, saltBytes, ITERATIONS);

  return {
    salt: bufferToHex(saltBytes.buffer),
    hash,
    iterations: ITERATIONS,
    algorithmVersion: 1,
  };
}

/**
 * Verifies a password against a stored credential.
 * Constant-time comparison.
 * @param {string} password
 * @param {Object} credential
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, credential) {
  if (!password || !credential || !credential.salt || !credential.hash) {
    return false;
  }

  try {
    const saltBytes = new Uint8Array(hexToBuffer(credential.salt));
    const computedHash = await deriveKey(password, saltBytes, credential.iterations || ITERATIONS);

    if (computedHash.length !== credential.hash.length) {
      return false;
    }

    // Timing-safe comparison
    let result = 0;
    for (let i = 0; i < computedHash.length; i++) {
      result |= computedHash.charCodeAt(i) ^ credential.hash.charCodeAt(i);
    }
    return result === 0;
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}
