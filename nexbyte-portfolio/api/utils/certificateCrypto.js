const crypto = require('crypto');

// Uses AES-256-GCM for authenticated encryption of certificate payloads.
// Ensure CERT_ENC_KEY is a 32-byte hex or base64 key in your environment.

const ALGORITHM = 'aes-256-gcm';

function getKey() {
  const raw = process.env.CERT_SECRET || process.env.CERT_ENC_KEY;
  if (!raw) {
    // Fallback to a default key for development
    console.warn('Certificate encryption key not found, using default key (development only)');
    return crypto.createHash('sha256').update('nexbyte-certificate-key-2024').digest();
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

  try {
    const iv = buf.subarray(0, 12);
    const authTag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    console.warn('GCM decryption failed, trying fallback method:', error);
    
    // Fallback to CBC decryption
    try {
      const parts = token.split(':');
      if (parts.length === 2) {
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
      }
    } catch (fallbackError) {
      console.error('Fallback decryption also failed:', fallbackError);
    }
    
    throw new Error('Certificate decryption failed');
  }
}

module.exports = {
  encryptCertificateData,
  decryptCertificateData,
};

