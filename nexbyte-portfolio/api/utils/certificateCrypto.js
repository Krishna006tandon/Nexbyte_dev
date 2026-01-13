const crypto = require('crypto');

// Uses AES-256-GCM for authenticated encryption of certificate payloads.
// Ensure CERT_ENC_KEY is a 32-byte hex or base64 key in your environment.

const ALGORITHM = 'aes-256-gcm';

function getKey() {
  const raw = process.env.CERT_ENC_KEY;
  if (!raw) {
    throw new Error('CERT_ENC_KEY is not configured');
  }

  // Support hex or base64 keys
  if (raw.length === 64) {
    return Buffer.from(raw, 'hex');
  }
  return Buffer.from(raw, 'base64');
}

function encryptCertificateData(payload) {
  const key = getKey();
  const iv = crypto.randomBytes(12); // recommended IV size for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

function decryptCertificateData(token) {
  const key = getKey();
  const buf = Buffer.from(token, 'base64');

  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}

module.exports = {
  encryptCertificateData,
  decryptCertificateData,
};

