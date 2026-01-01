import { App } from 'obsidian';

export interface OllamaModel {
	name: string;
	model: string;
	size: number;
	digest: string;
}

/**
 * Service for managing local LLM (Ollama) integration
 */
export class LocalLLMService {
	private app: App;
	private ollamaUrl: string = 'http://localhost:11434';
	private isAvailable: boolean = false;

	constructor(app: App, ollamaUrl?: string) {
		this.app = app;
		if (ollamaUrl) {
			this.ollamaUrl = ollamaUrl;
		}
	}

	/**
	 * Check if Ollama is running and available
	 */
	async checkAvailability(): Promise<boolean> {
		try {
			const response = await fetch(`${this.ollamaUrl}/api/tags`, {
				method: 'GET',
			});

			if (response.ok) {
				this.isAvailable = true;
				return true;
			}
		} catch (error) {
			console.error('Ollama not available:', error);
			this.isAvailable = false;
		}

		return false;
	}

	/**
	 * Get list of available models
	 */
	async getAvailableModels(): Promise<OllamaModel[]> {
		if (!this.isAvailable) {
			await this.checkAvailability();
		}

		if (!this.isAvailable) {
			return [];
		}

		try {
			const response = await fetch(`${this.ollamaUrl}/api/tags`);
			if (!response.ok) {
				return [];
			}

			const data = await response.json();
			return data.models || [];
		} catch (error) {
			console.error('Error fetching Ollama models:', error);
			return [];
		}
	}

	/**
	 * Generate text using Ollama
	 */
	async generate(prompt: string, model: string = 'llama2', systemPrompt?: string): Promise<string> {
		if (!this.isAvailable) {
			await this.checkAvailability();
		}

		if (!this.isAvailable) {
			throw new Error('Ollama is not available');
		}

		try {
			const response = await fetch(`${this.ollamaUrl}/api/generate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model,
					prompt,
					system: systemPrompt,
					stream: false,
				}),
			});

			if (!response.ok) {
				throw new Error(`Ollama API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.response || '';
		} catch (error) {
			console.error('Error generating with Ollama:', error);
			throw error;
		}
	}

	/**
	 * Get Ollama URL
	 */
	getUrl(): string {
		return this.ollamaUrl;
	}

	/**
	 * Set Ollama URL
	 */
	setUrl(url: string): void {
		this.ollamaUrl = url;
	}
}

