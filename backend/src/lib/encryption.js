import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY_RAW = process.env.MESSAGE_ENCRYPTION_KEY || process.env.JWT_SECRET || 'default-fallback-encryption-key-change-me';
// Ensure the key is exactly 32 bytes by hashing it using SHA-256
const ENCRYPTION_KEY = crypto.createHash('sha256').update(ENCRYPTION_KEY_RAW).digest();
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Encrypts a plaintext string.
 * @param {string} text - The plaintext string to encrypt.
 * @returns {string} - The encrypted string in format `iv:encryptedText`.
 */
export const encrypt = (text) => {
    if (!text || typeof text !== 'string') return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        return text;
    }
};

/**
 * Decrypts a ciphertext string.
 * Supports fallback to plaintext if decryption fails or format does not match.
 * @param {string} text - The ciphertext string.
 * @returns {string} - The decrypted plaintext string.
 */
export const decrypt = (text) => {
    if (!text || typeof text !== 'string') return text;
    try {
        const parts = text.split(':');
        // A hex-encoded IV for aes-256-cbc is exactly 32 characters
        if (parts.length !== 2 || parts[0].length !== 32 || !/^[0-9a-fA-F]{32}$/.test(parts[0])) {
            // Not encrypted or format doesn't match, return as-is
            return text;
        }
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = Buffer.from(parts[1], 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        // Safe fallback for legacy plain text messages
        console.error('Decryption failed, returning plain text:', error.message);
        return text;
    }
};
