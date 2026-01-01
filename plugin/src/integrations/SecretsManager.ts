import { App } from 'obsidian';
import { SecureStorage } from '../security/SecureStorage';

export interface APIKeyConfig {
	provider: string;
	key: string;
	validated?: boolean;
}

export class SecretsManager {
	private app: App;
	private secureStorage: SecureStorage;

	constructor(app: App) {
		this.app = app;
		this.secureStorage = new SecureStorage(app);
	}

	/**
	 * Check if secure storage is available
	 */
	isAvailable(): boolean {
		return this.secureStorage.isAvailable();
	}

	/**
	 * Store API key for a provider
	 */
	async storeAPIKey(provider: string, key: string): Promise<void> {
		if (!key || key.trim().length === 0) {
			throw new Error('API key cannot be empty');
		}

		// Validate key format (basic validation)
		if (!this.validateKeyFormat(provider, key)) {
			throw new Error(`Invalid API key format for ${provider}`);
		}

		// Store encrypted
		await this.secureStorage.set(`api_key_${provider}`, key);
	}

	/**
	 * Get API key for a provider
	 */
	async getAPIKey(provider: string): Promise<string | null> {
		return await this.secureStorage.get(`api_key_${provider}`);
	}

	/**
	 * Delete API key for a provider
	 */
	async deleteAPIKey(provider: string): Promise<void> {
		await this.secureStorage.delete(`api_key_${provider}`);
	}

	/**
	 * List all stored API keys (returns provider names only, not keys)
	 */
	async listAPIKeys(): Promise<string[]> {
		const keys = await this.secureStorage.listKeys();
		return keys
			.filter(key => key.startsWith('api_key_'))
			.map(key => key.replace('api_key_', ''));
	}

	/**
	 * Validate API key format (basic validation)
	 */
	private validateKeyFormat(provider: string, key: string): boolean {
		// Basic format validation
		const validations: Record<string, (key: string) => boolean> = {
			openai: (k) => k.startsWith('sk-') && k.length > 20,
			anthropic: (k) => k.startsWith('sk-ant-') && k.length > 20,
			ollama: (k) => true, // Ollama doesn't require keys for local instances
		};

		const validator = validations[provider.toLowerCase()];
		return validator ? validator(key) : key.length > 10; // Default: at least 10 characters
	}

	/**
	 * Test API key by making a simple request (for future implementation)
	 */
	async validateAPIKey(provider: string): Promise<boolean> {
		// TODO: Implement actual API key validation in Phase 4
		const key = await this.getAPIKey(provider);
		return key !== null && this.validateKeyFormat(provider, key);
	}

	/**
	 * Rotate API key (store new, keep old as backup)
	 */
	async rotateAPIKey(provider: string, newKey: string): Promise<void> {
		const oldKey = await this.getAPIKey(provider);
		
		// Store old key as backup
		if (oldKey) {
			await this.secureStorage.set(`api_key_${provider}_backup`, oldKey);
		}

		// Store new key
		await this.storeAPIKey(provider, newKey);
	}
}

