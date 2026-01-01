import { App } from 'obsidian';
import { BaseIntegration, IntegrationConfig } from '../BaseIntegration';
import { LocalLLMService } from '../LocalLLMService';
import { AIRequest, AIResponse } from '../AIProviderManager';
import { IAIProvider } from '../../interfaces/IAIProvider';

export class OllamaIntegration extends BaseIntegration implements IAIProvider {
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

	/**
	 * Stream AI response (for real-time updates)
	 */
	async stream(
		request: AIRequest,
		onChunk: (chunk: string) => void
	): Promise<AIResponse> {
		const model = (this.config as any).model || this.defaultModel;
		let fullContent = '';

		// For Ollama, we can implement streaming if LocalLLMService supports it
		// For now, generate normally and call onChunk with full content
		const content = await this.localLLMService.generate(
			request.prompt,
			model,
			request.systemPrompt
		);

		// Simulate streaming by calling onChunk with content
		onChunk(content);
		fullContent = content;

		return {
			content: fullContent,
			model,
		};
	}
}

