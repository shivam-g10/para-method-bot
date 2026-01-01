import { BaseIntegration } from '../integrations/BaseIntegration';
import { AIRequest, AIResponse } from '../integrations/AIProviderManager';

/**
 * Interface for AI provider abstraction.
 * Extends BaseIntegration with AI-specific methods.
 * 
 * @interface IAIProvider
 */
export interface IAIProvider extends BaseIntegration {
	/**
	 * Generate AI response from request
	 * @param request - AI request with prompt and options
	 * @returns Promise resolving to AI response
	 * @throws Error if generation fails
	 */
	generate(request: AIRequest): Promise<AIResponse>;

	/**
	 * Stream AI response (for real-time updates)
	 * @param request - AI request with prompt and options
	 * @param onChunk - Callback for each chunk of response
	 * @returns Promise that resolves when streaming is complete
	 */
	stream(
		request: AIRequest,
		onChunk: (chunk: string) => void
	): Promise<AIResponse>;

	/**
	 * Health check - verify AI provider is working
	 * @returns Promise resolving to true if provider is healthy
	 */
	healthCheck(): Promise<boolean>;
}

