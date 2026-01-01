import { BaseIntegration, IntegrationConfig } from './BaseIntegration';

/**
 * Manages all integrations (AI providers, external services, etc.)
 */
export class IntegrationManager {
	private integrations: Map<string, BaseIntegration> = new Map();

	/**
	 * Register an integration
	 */
	register(integration: BaseIntegration): void {
		this.integrations.set(integration.getName(), integration);
	}

	/**
	 * Unregister an integration
	 */
	unregister(name: string): void {
		this.integrations.delete(name);
	}

	/**
	 * Get an integration by name
	 */
	get(name: string): BaseIntegration | undefined {
		return this.integrations.get(name);
	}

	/**
	 * Get all integrations
	 */
	getAll(): BaseIntegration[] {
		return Array.from(this.integrations.values());
	}

	/**
	 * Get enabled integrations
	 */
	getEnabled(): BaseIntegration[] {
		return this.getAll().filter(integration => integration.isEnabled());
	}

	/**
	 * Enable an integration
	 */
	async enable(name: string): Promise<void> {
		const integration = this.get(name);
		if (integration) {
			integration.enable();
			await integration.initialize();
		}
	}

	/**
	 * Disable an integration
	 */
	async disable(name: string): Promise<void> {
		const integration = this.get(name);
		if (integration) {
			integration.disable();
			await integration.cleanup();
		}
	}

	/**
	 * Health check for all integrations
	 */
	async healthCheckAll(): Promise<Record<string, boolean>> {
		const results: Record<string, boolean> = {};

		for (const integration of this.getAll()) {
			if (integration.isEnabled()) {
				try {
					results[integration.getName()] = await integration.healthCheck();
				} catch (error) {
					results[integration.getName()] = false;
				}
			}
		}

		return results;
	}

	/**
	 * Initialize all enabled integrations
	 */
	async initializeAll(): Promise<void> {
		for (const integration of this.getEnabled()) {
			try {
				await integration.initialize();
			} catch (error) {
				console.error(`Failed to initialize ${integration.getName()}:`, error);
			}
		}
	}

	/**
	 * Cleanup all integrations
	 */
	async cleanupAll(): Promise<void> {
		for (const integration of this.getAll()) {
			try {
				await integration.cleanup();
			} catch (error) {
				console.error(`Failed to cleanup ${integration.getName()}:`, error);
			}
		}
	}
}

