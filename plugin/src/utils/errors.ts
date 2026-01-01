/**
 * Custom error types for better error handling
 */

/**
 * Base error class for the plugin
 */
export class PARAError extends Error {
	readonly code: string;
	readonly context?: Record<string, any>;

	constructor(message: string, code: string, context?: Record<string, any>) {
		super(message);
		this.name = 'PARAError';
		this.code = code;
		this.context = context;
		Error.captureStackTrace?.(this, this.constructor);
	}
}

/**
 * Service error - errors from service operations
 */
export class ServiceError extends PARAError {
	constructor(message: string, service: string, context?: Record<string, any>) {
		super(message, `SERVICE_${service.toUpperCase()}`, { service, ...context });
		this.name = 'ServiceError';
	}
}

/**
 * Validation error - input validation failures
 */
export class ValidationError extends PARAError {
	constructor(message: string, field?: string, context?: Record<string, any>) {
		super(message, 'VALIDATION_ERROR', { field, ...context });
		this.name = 'ValidationError';
	}
}

/**
 * Configuration error - configuration issues
 */
export class ConfigurationError extends PARAError {
	constructor(message: string, setting?: string, context?: Record<string, any>) {
		super(message, 'CONFIGURATION_ERROR', { setting, ...context });
		this.name = 'ConfigurationError';
	}
}

/**
 * Integration error - errors from external integrations
 */
export class IntegrationError extends PARAError {
	constructor(message: string, integration: string, context?: Record<string, any>) {
		super(message, `INTEGRATION_${integration.toUpperCase()}`, { integration, ...context });
		this.name = 'IntegrationError';
	}
}

/**
 * File operation error
 */
export class FileOperationError extends ServiceError {
	constructor(message: string, operation: string, path?: string, context?: Record<string, any>) {
		super(message, 'FILE', { operation, path, ...context });
		this.name = 'FileOperationError';
	}
}

/**
 * Project limit error
 */
export class ProjectLimitError extends ValidationError {
	constructor(currentCount: number, maxCount: number) {
		super(
			`Maximum ${maxCount} active projects allowed. Current: ${currentCount}`,
			'maxActiveProjects',
			{ currentCount, maxCount }
		);
		this.name = 'ProjectLimitError';
	}
}

