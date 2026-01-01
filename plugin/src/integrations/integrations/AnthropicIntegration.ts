import { BaseIntegration, IntegrationConfig } from '../BaseIntegration';
import { SecretsManager } from '../SecretsManager';
import { AIRequest, AIResponse } from '../AIProviderManager';
import { IAIProvider } from '../../interfaces/IAIProvider';

export class AnthropicIntegration extends BaseIntegration implements IAIProvider {
	private secretsManager: SecretsManager;
	private apiKey: string | null = null;

	constructor(name: string, config: IntegrationConfig, secretsManager: SecretsManager) {
		super(name, config);
		this.secretsManager = secretsManager;
	}

	async initialize(): Promise<void> {
		this.apiKey = await this.secretsManager.getAPIKey('anthropic');
		if (!this.apiKey && this.config.enabled) {
			throw new Error('Anthropic API key not configured');
		}
	}

	async cleanup(): Promise<void> {
		// No cleanup needed
	}

	async healthCheck(): Promise<boolean> {
		if (!this.apiKey) {
			return false;
		}

		try {
			// Simple health check
			const response = await fetch('https://api.anthropic.com/v1/messages', {
				method: 'POST',
				headers: {
					'x-api-key': this.apiKey,
					'anthropic-version': '2023-06-01',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: 'claude-3-sonnet-20240229',
					max_tokens: 10,
					messages: [{ role: 'user', content: 'test' }],
				}),
			});

			// Even if it fails, we know the API is reachable
			return response.status !== 401;
		} catch (error) {
			return false;
		}
	}

	async generate(request: AIRequest): Promise<AIResponse> {
		if (!this.apiKey) {
			throw new Error('Anthropic API key not configured');
		}

		const model = (this.config as any).model || 'claude-3-sonnet-20240229';

		try {
			const response = await fetch('https://api.anthropic.com/v1/messages', {
				method: 'POST',
				headers: {
					'x-api-key': this.apiKey,
					'anthropic-version': '2023-06-01',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model,
					max_tokens: request.maxTokens || 1000,
					temperature: request.temperature || 0.7,
					system: request.systemPrompt,
					messages: [
						{ role: 'user', content: request.prompt },
					],
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
			}

			const data = await response.json();
			const content = data.content[0]?.text || '';

			return {
				content,
				model: data.model,
				usage: data.usage ? {
					promptTokens: data.usage.input_tokens,
					completionTokens: data.usage.output_tokens,
					totalTokens: data.usage.input_tokens + data.usage.output_tokens,
				} : undefined,
			};
		} catch (error) {
			console.error('Anthropic generation error:', error);
			throw error;
		}
	}

	/**
	 * Stream AI response (for real-time updates)
	 */
	async stream(
		request: AIRequest,
		onChunk: (chunk: string) => void
	): Promise<AIResponse> {
		if (!this.apiKey) {
			throw new Error('Anthropic API key not configured');
		}

		const model = (this.config as any).model || 'claude-3-sonnet-20240229';
		let fullContent = '';

		try {
			const response = await fetch('https://api.anthropic.com/v1/messages', {
				method: 'POST',
				headers: {
					'x-api-key': this.apiKey,
					'anthropic-version': '2023-06-01',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model,
					max_tokens: request.maxTokens || 1000,
					temperature: request.temperature || 0.7,
					system: request.systemPrompt,
					messages: [
						{ role: 'user', content: request.prompt },
					],
					stream: true,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error('Failed to get response reader');
			}

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n').filter(line => line.trim() !== '');

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6);
						if (data === '[DONE]') continue;

						try {
							const parsed = JSON.parse(data);
							const content = parsed.delta?.text || '';
							if (content) {
								fullContent += content;
								onChunk(content);
							}
						} catch (e) {
							// Ignore parse errors
						}
					}
				}
			}

			return {
				content: fullContent,
				model,
			};
		} catch (error) {
			console.error('Anthropic streaming error:', error);
			throw error;
		}
	}
}

