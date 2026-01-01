import { App } from 'obsidian';
import { EncryptionService } from './EncryptionService';

/**
 * Secure storage wrapper for Obsidian/Electron safeStorage API
 */
export class SecureStorage {
	private app: App;
	private safeStorage: any;

	constructor(app: App) {
		this.app = app;
		// Access Electron's safeStorage through app
		// In Obsidian, this is available via electron API
		this.safeStorage = (this.app as any).electron?.safeStorage;
	}

	/**
	 * Check if secure storage is available
	 */
	isAvailable(): boolean {
		return this.safeStorage && this.safeStorage.isEncryptionAvailable();
	}

	/**
	 * Store encrypted value securely
	 */
	async set(key: string, value: string): Promise<void> {
		if (!this.isAvailable()) {
			throw new Error('Secure storage not available on this platform');
		}

		try {
			const encrypted = await EncryptionService.encrypt(value, this.safeStorage);
			
			// Store in plugin data directory
			const pluginDataPath = (this.app.vault.adapter as any).basePath;
			const secretsPath = `${pluginDataPath}/.obsidian/plugins/para-agent/secrets.json`;
			
			// Read existing secrets
			let secrets: Record<string, string> = {};
			try {
				const fs = require('fs');
				if (fs.existsSync(secretsPath)) {
					const data = fs.readFileSync(secretsPath, 'utf8');
					secrets = JSON.parse(data);
				}
			} catch (error) {
				// File doesn't exist yet, create new
			}

			// Update secrets
			secrets[key] = encrypted;

			// Write back
			const fs = require('fs');
			const path = require('path');
			const dir = path.dirname(secretsPath);
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}
			fs.writeFileSync(secretsPath, JSON.stringify(secrets, null, 2));
		} catch (error) {
			console.error('Error storing secret:', error);
			throw error;
		}
	}

	/**
	 * Get and decrypt value
	 */
	async get(key: string): Promise<string | null> {
		if (!this.isAvailable()) {
			throw new Error('Secure storage not available on this platform');
		}

		try {
			const pluginDataPath = (this.app.vault.adapter as any).basePath;
			const secretsPath = `${pluginDataPath}/.obsidian/plugins/para-agent/secrets.json`;
			
			const fs = require('fs');
			if (!fs.existsSync(secretsPath)) {
				return null;
			}

			const data = fs.readFileSync(secretsPath, 'utf8');
			const secrets: Record<string, string> = JSON.parse(data);

			if (!secrets[key]) {
				return null;
			}

			const decrypted = await EncryptionService.decrypt(secrets[key], this.safeStorage);
			return decrypted;
		} catch (error) {
			console.error('Error retrieving secret:', error);
			return null;
		}
	}

	/**
	 * Delete a secret
	 */
	async delete(key: string): Promise<void> {
		try {
			const pluginDataPath = (this.app.vault.adapter as any).basePath;
			const secretsPath = `${pluginDataPath}/.obsidian/plugins/para-agent/secrets.json`;
			
			const fs = require('fs');
			if (!fs.existsSync(secretsPath)) {
				return;
			}

			const data = fs.readFileSync(secretsPath, 'utf8');
			const secrets: Record<string, string> = JSON.parse(data);

			delete secrets[key];

			fs.writeFileSync(secretsPath, JSON.stringify(secrets, null, 2));
		} catch (error) {
			console.error('Error deleting secret:', error);
			throw error;
		}
	}

	/**
	 * List all secret keys
	 */
	async listKeys(): Promise<string[]> {
		try {
			const pluginDataPath = (this.app.vault.adapter as any).basePath;
			const secretsPath = `${pluginDataPath}/.obsidian/plugins/para-agent/secrets.json`;
			
			const fs = require('fs');
			if (!fs.existsSync(secretsPath)) {
				return [];
			}

			const data = fs.readFileSync(secretsPath, 'utf8');
			const secrets: Record<string, string> = JSON.parse(data);

			return Object.keys(secrets);
		} catch (error) {
			console.error('Error listing secrets:', error);
			return [];
		}
	}
}

