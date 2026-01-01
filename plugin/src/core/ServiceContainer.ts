/**
 * Service lifecycle types
 */
export type ServiceLifecycle = 'singleton' | 'transient' | 'scoped';

/**
 * Service registration options
 */
export interface ServiceRegistration<T = any> {
	/** Implementation class or factory function */
	implementation: new (...args: any[]) => T | ((...args: any[]) => T);
	/** Service lifecycle */
	lifecycle?: ServiceLifecycle;
	/** Dependencies required by this service */
	dependencies?: string[];
	/** Factory function for custom instantiation */
	factory?: (...args: any[]) => T;
}

/**
 * Dependency Injection Container
 * Manages service registration, resolution, and lifecycle.
 */
export class ServiceContainer {
	private services: Map<string, ServiceRegistration> = new Map();
	private singletons: Map<string, any> = new Map();
	private scopedInstances: Map<string, Map<string, any>> = new Map();
	private currentScope: string | null = null;
	private resolving: Set<string> = new Set(); // Track services being resolved to detect circular dependencies

	/**
	 * Register a service with the container
	 * @param key - Service identifier (typically interface name)
	 * @param registration - Service registration options
	 */
	register<T = any>(key: string, registration: ServiceRegistration<T>): void {
		this.services.set(key, {
			lifecycle: 'singleton',
			...registration,
		});
	}

	/**
	 * Register a service implementation
	 * @param key - Service identifier
	 * @param implementation - Implementation class
	 * @param lifecycle - Service lifecycle (default: singleton)
	 */
	registerImplementation<T = any>(
		key: string,
		implementation: new (...args: any[]) => T,
		lifecycle: ServiceLifecycle = 'singleton'
	): void {
		this.register(key, {
			implementation,
			lifecycle,
		});
	}

	/**
	 * Register a factory function
	 * @param key - Service identifier
	 * @param factory - Factory function
	 * @param lifecycle - Service lifecycle (default: singleton)
	 */
	registerFactory<T = any>(
		key: string,
		factory: (...args: any[]) => T,
		lifecycle: ServiceLifecycle = 'singleton'
	): void {
		this.register(key, {
			factory,
			lifecycle,
		});
	}

	/**
	 * Resolve a service from the container
	 * @param key - Service identifier
	 * @returns Resolved service instance
	 * @throws Error if service is not registered or circular dependency detected
	 */
	resolve<T = any>(key: string): T {
		const registration = this.services.get(key);
		if (!registration) {
			throw new Error(`Service '${key}' is not registered`);
		}

		// Check for circular dependency
		if (this.resolving.has(key)) {
			throw new Error(`Circular dependency detected while resolving '${key}'`);
		}

		// Handle lifecycle - check if already resolved
		if (registration.lifecycle === 'singleton') {
			if (this.singletons.has(key)) {
				return this.singletons.get(key) as T;
			}
		} else if (registration.lifecycle === 'scoped') {
			if (this.currentScope) {
				const scopeInstances = this.scopedInstances.get(this.currentScope) || new Map();
				if (scopeInstances.has(key)) {
					return scopeInstances.get(key) as T;
				}
			}
		}

		// Mark as resolving
		this.resolving.add(key);

		try {
			// Resolve dependencies
			const dependencies = this.resolveDependencies(registration.dependencies || []);

			// Create instance
			let instance: T;
			if (registration.factory) {
				instance = registration.factory(...dependencies);
			} else if (typeof registration.implementation === 'function') {
				// Assume it's a constructor if it's a class
				try {
					instance = new (registration.implementation as new (...args: any[]) => T)(...dependencies);
				} catch (error) {
					// If constructor fails, try as factory function
					instance = (registration.implementation as (...args: any[]) => T)(...dependencies);
				}
			} else {
				throw new Error(`Invalid service registration for '${key}'`);
			}

			// Store instance based on lifecycle
			if (registration.lifecycle === 'singleton') {
				this.singletons.set(key, instance);
			} else if (registration.lifecycle === 'scoped' && this.currentScope) {
				let scopeInstances = this.scopedInstances.get(this.currentScope);
				if (!scopeInstances) {
					scopeInstances = new Map();
					this.scopedInstances.set(this.currentScope, scopeInstances);
				}
				scopeInstances.set(key, instance);
			}

			return instance;
		} finally {
			// Remove from resolving set
			this.resolving.delete(key);
		}
	}

	/**
	 * Check if a service is registered
	 * @param key - Service identifier
	 * @returns True if service is registered
	 */
	has(key: string): boolean {
		return this.services.has(key);
	}

	/**
	 * Get all registered service keys
	 * @returns Array of service keys
	 */
	getKeys(): string[] {
		return Array.from(this.services.keys());
	}

	/**
	 * Clear all services (useful for testing)
	 */
	clear(): void {
		this.services.clear();
		this.singletons.clear();
		this.scopedInstances.clear();
		this.resolving.clear();
	}

	/**
	 * Start a new scope for scoped services
	 * @param scopeId - Unique scope identifier
	 */
	beginScope(scopeId: string): void {
		this.currentScope = scopeId;
	}

	/**
	 * End current scope and dispose scoped instances
	 */
	endScope(): void {
		if (this.currentScope) {
			this.scopedInstances.delete(this.currentScope);
			this.currentScope = null;
		}
	}

	/**
	 * Resolve dependencies for a service
	 * @param dependencyKeys - Array of dependency keys
	 * @returns Array of resolved dependencies
	 */
	private resolveDependencies(dependencyKeys: string[]): any[] {
		return dependencyKeys.map(key => this.resolve(key));
	}

}

