import { App } from 'obsidian';
import { ServiceContainer } from './ServiceContainer';
import { PluginSettings } from './PluginManager';

/**
 * Factory for creating services with proper dependencies and configuration.
 */
export class ServiceFactory {
	private container: ServiceContainer;
	private app: App;
	private settings: PluginSettings;

	constructor(container: ServiceContainer, app: App, settings: PluginSettings) {
		this.container = container;
		this.app = app;
		this.settings = settings;
	}

	/**
	 * Create a service with dependencies injected
	 * @param key - Service key
	 * @returns Created service instance
	 */
	createService<T = any>(key: string): T {
		return this.container.resolve<T>(key);
	}

	/**
	 * Create a service with custom dependencies
	 * @param key - Service key
	 * @param dependencies - Custom dependencies to inject
	 * @returns Created service instance
	 */
	createWithDependencies<T = any>(key: string, dependencies: any[]): T {
		const registration = (this.container as any).services.get(key);
		if (!registration) {
			throw new Error(`Service '${key}' is not registered`);
		}

		if (registration.factory) {
			return registration.factory(...dependencies);
		} else if (typeof registration.implementation === 'function') {
			// Try as constructor first, fall back to factory function
			try {
				return new (registration.implementation as new (...args: any[]) => T)(...dependencies);
			} catch {
				return (registration.implementation as (...args: any[]) => T)(...dependencies);
			}
		}

		throw new Error(`Invalid service registration for '${key}'`);
	}

	/**
	 * Get the Obsidian App instance
	 * @returns Obsidian App instance
	 */
	getApp(): App {
		return this.app;
	}

	/**
	 * Get plugin settings
	 * @returns Plugin settings
	 */
	getSettings(): PluginSettings {
		return this.settings;
	}

	/**
	 * Update settings
	 * @param settings - New settings
	 */
	updateSettings(settings: Partial<PluginSettings>): void {
		this.settings = { ...this.settings, ...settings };
	}

	/**
	 * Get the service container
	 * @returns Service container instance
	 */
	getContainer(): ServiceContainer {
		return this.container;
	}

}

