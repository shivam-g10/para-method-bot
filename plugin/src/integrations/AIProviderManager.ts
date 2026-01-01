import { App } from 'obsidian';
import { IntegrationManager } from './IntegrationManager';
import { OpenAIIntegration } from './integrations/OpenAIIntegration';
import { AnthropicIntegration } from './integrations/AnthropicIntegration';
import { OllamaIntegration } from './integrations/OllamaIntegration';
import { SecretsManager } from './SecretsManager';

export interface AIProviderConfig {
	provider: 'openai' | 'anthropic' | 'ollama';
	model?: string;
	enabled: boolean;
}

export interface AIRequest {
	prompt: string;
	maxTokens?: number;
	temperature?: number;
	systemPrompt?: string;
}

export interface AIResponse {
	content: string;
	model: string;
	usage?: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}

/**
 * Manages AI providers and routes requests to appropriate provider
 */
export class AIProviderManager {
	private app: App;
	private integrationManager: IntegrationManager;
	private secretsManager: SecretsManager;
	private preferredProvider: string = 'ollama'; // Prefer local LLM for privacy

	constructor(app: App, integrationManager: IntegrationManager, secretsManager: SecretsManager) {
		this.app = app;
		this.integrationManager = integrationManager;
		this.secretsManager = secretsManager;
	}

	/**
	 * Initialize all AI providers
	 */
	async initialize(): Promise<void> {
		// Register providers
		const openai = new OpenAIIntegration('openai', {
			name: 'openai',
			enabled: false,
		}, this.secretsManager);
		
		const anthropic = new AnthropicIntegration('anthropic', {
			name: 'anthropic',
			enabled: false,
		}, this.secretsManager);

		const ollama = new OllamaIntegration('ollama', {
			name: 'ollama',
			enabled: true, // Enable by default if available
		}, this.app);

		this.integrationManager.register(openai);
		this.integrationManager.register(anthropic);
		this.integrationManager.register(ollama);

		// Initialize enabled providers
		await this.integrationManager.initializeAll();
	}

	/**
	 * Get available AI provider (prefer local, fallback to cloud)
	 */
	async getAvailableProvider(): Promise<string | null> {
		// Check Ollama first (local, privacy)
		const ollama = this.integrationManager.get('ollama');
		if (ollama && ollama.isEnabled()) {
			const isHealthy = await ollama.healthCheck();
			if (isHealthy) {
				return 'ollama';
			}
		}

		// Fallback to cloud providers
		const openai = this.integrationManager.get('openai');
		if (openai && openai.isEnabled()) {
			const isHealthy = await openai.healthCheck();
			if (isHealthy) {
				return 'openai';
			}
		}

		const anthropic = this.integrationManager.get('anthropic');
		if (anthropic && anthropic.isEnabled()) {
			const isHealthy = await anthropic.healthCheck();
			if (isHealthy) {
				return 'anthropic';
			}
		}

		return null;
	}

	/**
	 * Make AI request using best available provider
	 */
	async request(request: AIRequest): Promise<AIResponse> {
		const providerName = await this.getAvailableProvider();
		
		if (!providerName) {
			throw new Error('No available AI provider');
		}

		const provider = this.integrationManager.get(providerName);
		if (!provider) {
			throw new Error(`Provider ${providerName} not found`);
		}

		// Check if provider implements IAIProvider interface
		const aiProvider = provider as import('../interfaces/IAIProvider').IAIProvider;
		if (typeof aiProvider.generate !== 'function') {
			throw new Error(`Provider ${providerName} does not support AI generation`);
		}

		return await aiProvider.generate(request);
	}

	/**
	 * Register a new AI provider dynamically
	 * @param provider - AI provider integration
	 */
	async registerProvider(provider: import('../interfaces/IAIProvider').IAIProvider): Promise<void> {
		this.integrationManager.register(provider);
		if (provider.isEnabled()) {
			await provider.initialize();
		}
	}

	/**
	 * Set preferred provider
	 */
	setPreferredProvider(provider: string): void {
		this.preferredProvider = provider;
	}

	/**
	 * Get preferred provider
	 */
	getPreferredProvider(): string {
		return this.preferredProvider;
	}
}

