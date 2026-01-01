/**
 * Base interface for all integrations
 */
export interface IntegrationConfig {
	name: string;
	enabled: boolean;
	[key: string]: any;
}

export interface IntegrationResponse {
	success: boolean;
	data?: any;
	error?: string;
}

/**
 * Base class for all integrations
 */
export abstract class BaseIntegration {
	protected config: IntegrationConfig;
	protected name: string;

	constructor(name: string, config: IntegrationConfig) {
		this.name = name;
		this.config = config;
	}

	/**
	 * Get integration name
	 */
	getName(): string {
		return this.name;
	}

	/**
	 * Check if integration is enabled
	 */
	isEnabled(): boolean {
		return this.config.enabled;
	}

	/**
	 * Enable integration
	 */
	enable(): void {
		this.config.enabled = true;
	}

	/**
	 * Disable integration
	 */
	disable(): void {
		this.config.enabled = false;
	}

	/**
	 * Get configuration
	 */
	getConfig(): IntegrationConfig {
		return this.config;
	}

	/**
	 * Update configuration
	 */
	updateConfig(config: Partial<IntegrationConfig>): void {
		this.config = { ...this.config, ...config };
	}

	/**
	 * Health check - verify integration is working
	 */
	abstract healthCheck(): Promise<boolean>;

	/**
	 * Initialize integration
	 */
	abstract initialize(): Promise<void>;

	/**
	 * Cleanup integration
	 */
	abstract cleanup(): Promise<void>;
}

