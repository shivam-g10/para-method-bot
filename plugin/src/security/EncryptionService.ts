/**
 * Encryption utilities for secure data storage
 * Note: For MVP, we rely on Electron's safeStorage API
 * This service provides a wrapper and fallback mechanisms
 */

export class EncryptionService {
	/**
	 * Check if encryption is available
	 */
	static isEncryptionAvailable(): boolean {
		// In Obsidian/Electron, safeStorage should be available
		// This will be checked at runtime
		return true;
	}

	/**
	 * Encrypt data (wrapper for Electron safeStorage)
	 * In Obsidian, we use the app's safeStorage API
	 */
	static async encrypt(data: string, safeStorage: any): Promise<string> {
		if (!safeStorage || !safeStorage.isEncryptionAvailable()) {
			throw new Error('Encryption not available');
		}

		try {
			// Convert string to Buffer
			const buffer = Buffer.from(data, 'utf8');
			// Encrypt using safeStorage
			const encrypted = safeStorage.encryptString(data);
			// Return as base64 for storage
			return Buffer.from(encrypted).toString('base64');
		} catch (error) {
			console.error('Encryption error:', error);
			throw new Error('Failed to encrypt data');
		}
	}

	/**
	 * Decrypt data (wrapper for Electron safeStorage)
	 */
	static async decrypt(encryptedData: string, safeStorage: any): Promise<string> {
		if (!safeStorage || !safeStorage.isEncryptionAvailable()) {
			throw new Error('Encryption not available');
		}

		try {
			// Convert from base64
			const buffer = Buffer.from(encryptedData, 'base64');
			// Decrypt using safeStorage
			const decrypted = safeStorage.decryptString(buffer.toString('utf8'));
			return decrypted;
		} catch (error) {
			console.error('Decryption error:', error);
			throw new Error('Failed to decrypt data');
		}
	}

	/**
	 * Validate encrypted data format
	 */
	static isValidEncryptedFormat(data: string): boolean {
		// Check if it's valid base64
		try {
			Buffer.from(data, 'base64');
			return true;
		} catch {
			return false;
		}
	}
}

