import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_SECRET;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

if (!SECRET_KEY || SECRET_KEY.length !== 32) {
  throw new Error("ENCRYPTION_SECRET must be exactly 32 characters long in .env");
}

export function encryptData(text: string): string {
  if (!text) return text;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  // Deriving the key using PBKDF2 for extra security layer, though we already have a 32 char key
  const key = crypto.pbkdf2Sync(SECRET_KEY!, salt, 100000, 32, 'sha512');
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Return a combined buffer payload containing all necessary pieces for decryption
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

export function decryptData(encryptedBase64: string): string {
  if (!encryptedBase64) return encryptedBase64;
  
  try {
    const payload = Buffer.from(encryptedBase64, 'base64');
    
    // Extract pieces based on known lengths
    const salt = payload.subarray(0, SALT_LENGTH);
    const iv = payload.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = payload.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encryptedText = payload.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    const key = crypto.pbkdf2Sync(SECRET_KEY!, salt, 100000, 32, 'sha512');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    return decipher.update(encryptedText) + decipher.final('utf8');
  } catch (error) {
    console.error("Decryption failed:", error);
    return "DECRYPTION_ERROR";
  }
}
