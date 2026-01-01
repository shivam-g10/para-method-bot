import { BaseIntegration, IntegrationConfig } from '../BaseIntegration';
import { SecretsManager } from '../SecretsManager';
import { AIRequest, AIResponse } from '../AIProviderManager';
import { IAIProvider } from '../../interfaces/IAIProvider';

export class OpenAIIntegration extends BaseIntegration implements IAIProvider {
	private secretsManager: SecretsManager;
	private apiKey: string | null = null;

	constructor(name: string, config: IntegrationConfig, secretsManager: SecretsManager) {
		super(name, config);
		this.secretsManager = secretsManager;
	}

	async initialize(): Promise<void> {
		this.apiKey = await this.secretsManager.getAPIKey('openai');
		if (!this.apiKey && this.config.enabled) {
			throw new Error('OpenAI API key not configured');
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
			// Simple health check - list models
			const response = await fetch('https://api.openai.com/v1/models', {
				headers: {
					'Authorization': `Bearer ${this.apiKey}`,
				},
			});

			return response.ok;
		} catch (error) {
			return false;
		}
	}

	async generate(request: AIRequest): Promise<AIResponse> {
		if (!this.apiKey) {
			throw new Error('OpenAI API key not configured');
		}

		const model = (this.config as any).model || 'gpt-3.5-turbo';

		try {
			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model,
					messages: [
						...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
						{ role: 'user', content: request.prompt },
					],
					max_tokens: request.maxTokens || 1000,
					temperature: request.temperature || 0.7,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
			}

			const data = await response.json();
			const choice = data.choices[0];

			return {
				content: choice.message.content,
				model: data.model,
				usage: data.usage ? {
					promptTokens: data.usage.prompt_tokens,
					completionTokens: data.usage.completion_tokens,
					totalTokens: data.usage.total_tokens,
				} : undefined,
			};
		} catch (error) {
			console.error('OpenAI generation error:', error);
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
			throw new Error('OpenAI API key not configured');
		}

		const model = (this.config as any).model || 'gpt-3.5-turbo';
		let fullContent = '';

		try {
			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model,
					messages: [
						...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
						{ role: 'user', content: request.prompt },
					],
					max_tokens: request.maxTokens || 1000,
					temperature: request.temperature || 0.7,
					stream: true,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
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
							const content = parsed.choices[0]?.delta?.content || '';
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
			console.error('OpenAI streaming error:', error);
			throw error;
		}
	}
}

