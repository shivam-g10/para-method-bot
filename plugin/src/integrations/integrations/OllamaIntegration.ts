import { App } from 'obsidian';
import { BaseIntegration, IntegrationConfig } from '../BaseIntegration';
import { LocalLLMService } from '../LocalLLMService';
import { AIRequest, AIResponse } from '../AIProviderManager';

export class OllamaIntegration extends BaseIntegration {
	private app: App;
	private localLLMService: LocalLLMService;
	private defaultModel: string = 'llama2';

	constructor(name: string, config: IntegrationConfig, app: App) {
		super(name, config);
		this.app = app;
		this.localLLMService = new LocalLLMService(app);
	}

	async initialize(): Promise<void> {
		// Check if Ollama is available
		const isAvailable = await this.localLLMService.checkAvailability();
		if (!isAvailable && this.config.enabled) {
			console.warn('Ollama is not available, but integration is enabled');
		}
	}

	async cleanup(): Promise<void> {
		// No cleanup needed
	}

	async healthCheck(): Promise<boolean> {
		return await this.localLLMService.checkAvailability();
	}

	async generate(request: AIRequest): Promise<AIResponse> {
		const model = (this.config as any).model || this.defaultModel;
		
		const content = await this.localLLMService.generate(
			request.prompt,
			model,
			request.systemPrompt
		);

		return {
			content,
			model,
		};
	}

	/**
	 * Get available models
	 */
	async getAvailableModels(): Promise<string[]> {
		const models = await this.localLLMService.getAvailableModels();
		return models.map(m => m.name);
	}

	/**
	 * Set default model
	 */
	setDefaultModel(model: string): void {
		this.defaultModel = model;
	}
}

