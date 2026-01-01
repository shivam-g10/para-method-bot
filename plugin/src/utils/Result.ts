/**
 * Result type for error handling
 * Similar to Rust's Result<T, E> or functional programming Either type
 * 
 * @typeparam T - Success value type
 * @typeparam E - Error type (defaults to Error)
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

/**
 * Success variant of Result
 */
export class Ok<T> {
	readonly success = true as const;
	readonly value: T;

	constructor(value: T) {
		this.value = value;
	}

	/**
	 * Map over the success value
	 */
	map<U>(fn: (value: T) => U): Result<U> {
		return ok(fn(this.value));
	}

	/**
	 * Map over the success value (async)
	 */
	async mapAsync<U>(fn: (value: T) => Promise<U>): Promise<Result<U>> {
		try {
			const result = await fn(this.value);
			return ok(result);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}

	/**
	 * Chain operations (flatMap)
	 */
	andThen<U>(fn: (value: T) => Result<U>): Result<U> {
		return fn(this.value);
	}

	/**
	 * Chain operations (async)
	 */
	async andThenAsync<U>(fn: (value: T) => Promise<Result<U>>): Promise<Result<U>> {
		return await fn(this.value);
	}

	/**
	 * Unwrap the value or throw
	 */
	unwrap(): T {
		return this.value;
	}

	/**
	 * Unwrap the value or return default
	 */
	unwrapOr(_default: T): T {
		return this.value;
	}

	/**
	 * Unwrap the value or compute default
	 */
	unwrapOrElse(_fn: () => T): T {
		return this.value;
	}
}

/**
 * Error variant of Result
 */
export class Err<E = Error> {
	readonly success = false as const;
	readonly error: E;

	constructor(error: E) {
		this.error = error;
	}

	/**
	 * Map over the success value (no-op for error)
	 */
	map<U>(_fn: (value: never) => U): Result<U, E> {
		return this as unknown as Result<U, E>;
	}

	/**
	 * Map over the success value (async, no-op for error)
	 */
	async mapAsync<U>(_fn: (value: never) => Promise<U>): Promise<Result<U, E>> {
		return this as unknown as Result<U, E>;
	}

	/**
	 * Chain operations (no-op for error)
	 */
	andThen<U>(_fn: (value: never) => Result<U>): Result<U, E> {
		return this as unknown as Result<U, E>;
	}

	/**
	 * Chain operations (async, no-op for error)
	 */
	async andThenAsync<U>(_fn: (value: never) => Promise<Result<U>>): Promise<Result<U, E>> {
		return this as unknown as Result<U, E>;
	}

	/**
	 * Unwrap the value or throw
	 */
	unwrap(): never {
		throw this.error instanceof Error ? this.error : new Error(String(this.error));
	}

	/**
	 * Unwrap the value or return default
	 */
	unwrapOr<T>(defaultValue: T): T {
		return defaultValue;
	}

	/**
	 * Unwrap the value or compute default
	 */
	unwrapOrElse<T>(fn: () => T): T {
		return fn();
	}
}

/**
 * Create a success Result
 */
export function ok<T>(value: T): Ok<T> {
	return new Ok(value);
}

/**
 * Create an error Result
 */
export function err<E = Error>(error: E): Err<E> {
	return new Err(error);
}

/**
 * Check if Result is success
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
	return result.success;
}

/**
 * Check if Result is error
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
	return !result.success;
}

/**
 * Convert a promise to a Result
 */
export async function toResult<T>(
	promise: Promise<T>
): Promise<Result<T>> {
	try {
		const value = await promise;
		return ok(value);
	} catch (error) {
		return err(error instanceof Error ? error : new Error(String(error)));
	}
}

/**
 * Convert a function that throws to a Result
 */
export function tryCatch<T>(fn: () => T): Result<T> {
	try {
		return ok(fn());
	} catch (error) {
		return err(error instanceof Error ? error : new Error(String(error)));
	}
}

/**
 * Convert an async function that throws to a Result
 */
export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
	try {
		const value = await fn();
		return ok(value);
	} catch (error) {
		return err(error instanceof Error ? error : new Error(String(error)));
	}
}

