import { Result, ok, err } from './Result';
import { ValidationError } from './errors';

/**
 * Validation result type
 */
export type ValidationResult = Result<void, ValidationError>;

/**
 * Validator function type
 */
export type Validator<T> = (value: T) => ValidationResult;

/**
 * Create a validator that checks if value is not null/undefined
 */
export function required<T>(message = 'Value is required'): Validator<T | null | undefined> {
	return (value: T | null | undefined) => {
		if (value === null || value === undefined) {
			return err(new ValidationError(message));
		}
		return ok(undefined);
	};
}

/**
 * Create a validator that checks string length
 */
export function minLength(min: number, message?: string): Validator<string> {
	return (value: string) => {
		if (value.length < min) {
			return err(new ValidationError(
				message || `Value must be at least ${min} characters`,
				'length',
				{ min, actual: value.length }
			));
		}
		return ok(undefined);
	};
}

/**
 * Create a validator that checks string length
 */
export function maxLength(max: number, message?: string): Validator<string> {
	return (value: string) => {
		if (value.length > max) {
			return err(new ValidationError(
				message || `Value must be at most ${max} characters`,
				'length',
				{ max, actual: value.length }
			));
		}
		return ok(undefined);
	};
}

/**
 * Create a validator that checks numeric range
 */
export function inRange(min: number, max: number, message?: string): Validator<number> {
	return (value: number) => {
		if (value < min || value > max) {
			return err(new ValidationError(
				message || `Value must be between ${min} and ${max}`,
				'range',
				{ min, max, actual: value }
			));
		}
		return ok(undefined);
	};
}

/**
 * Create a validator that checks if value matches pattern
 */
export function matches(pattern: RegExp, message?: string): Validator<string> {
	return (value: string) => {
		if (!pattern.test(value)) {
			return err(new ValidationError(
				message || `Value does not match required pattern`,
				'pattern',
				{ pattern: pattern.toString() }
			));
		}
		return ok(undefined);
	};
}

/**
 * Combine multiple validators
 */
export function combine<T>(...validators: Validator<T>[]): Validator<T> {
	return (value: T) => {
		for (const validator of validators) {
			const result = validator(value);
			if (!result.success) {
				return result;
			}
		}
		return ok(undefined);
	};
}

/**
 * Validate an object with a schema
 */
export function validateObject<T extends Record<string, any>>(
	obj: T,
	schema: Record<keyof T, Validator<any>[]>
): Result<T, ValidationError> {
	for (const [key, validators] of Object.entries(schema)) {
		const value = obj[key];
		for (const validator of validators) {
			const result = validator(value);
			if (!result.success) {
				return err(result.error);
			}
		}
	}
	return ok(obj);
}

