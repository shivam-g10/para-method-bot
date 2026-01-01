/**
 * Option type for nullable values
 * Similar to Rust's Option<T> or functional programming Maybe type
 * 
 * @typeparam T - Value type
 */
export type Option<T> = Some<T> | None;

/**
 * Some variant of Option (has a value)
 */
export class Some<T> {
	readonly some = true as const;
	readonly none = false as const;
	readonly value: T;

	constructor(value: T) {
		this.value = value;
	}

	/**
	 * Map over the value
	 */
	map<U>(fn: (value: T) => U): Option<U> {
		return some(fn(this.value));
	}

	/**
	 * Map over the value (async)
	 */
	async mapAsync<U>(fn: (value: T) => Promise<U>): Promise<Option<U>> {
		const result = await fn(this.value);
		return some(result);
	}

	/**
	 * Chain operations (flatMap)
	 */
	andThen<U>(fn: (value: T) => Option<U>): Option<U> {
		return fn(this.value);
	}

	/**
	 * Chain operations (async)
	 */
	async andThenAsync<U>(fn: (value: T) => Promise<Option<U>>): Promise<Option<U>> {
		return await fn(this.value);
	}

	/**
	 * Unwrap the value
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

	/**
	 * Check if option has a value
	 */
	isSome(): this is Some<T> {
		return true;
	}

	/**
	 * Check if option is none
	 */
	isNone(): this is None {
		return false;
	}
}

/**
 * None variant of Option (no value)
 */
export class None {
	readonly some = false as const;
	readonly none = true as const;

	/**
	 * Map over the value (no-op for none)
	 */
	map<U>(_fn: (value: never) => U): None {
		return this;
	}

	/**
	 * Map over the value (async, no-op for none)
	 */
	async mapAsync<U>(_fn: (value: never) => Promise<U>): Promise<None> {
		return this;
	}

	/**
	 * Chain operations (no-op for none)
	 */
	andThen<U>(_fn: (value: never) => Option<U>): None {
		return this;
	}

	/**
	 * Chain operations (async, no-op for none)
	 */
	async andThenAsync<U>(_fn: (value: never) => Promise<Option<U>>): Promise<None> {
		return this;
	}

	/**
	 * Unwrap the value (throws)
	 */
	unwrap(): never {
		throw new Error('Called unwrap() on None');
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

	/**
	 * Check if option has a value
	 */
	isSome(): false {
		return false;
	}

	/**
	 * Check if option is none
	 */
	isNone(): true {
		return true;
	}
}

/**
 * Create a Some option
 */
export function some<T>(value: T): Some<T> {
	return new Some(value);
}

/**
 * Create a None option
 */
export const none: None = new None();

/**
 * Create an Option from a nullable value
 */
export function fromNullable<T>(value: T | null | undefined): Option<T> {
	return value === null || value === undefined ? none : some(value);
}

/**
 * Check if Option is Some
 */
export function isSome<T>(option: Option<T>): option is Some<T> {
	return option.some;
}

/**
 * Check if Option is None
 */
export function isNone<T>(option: Option<T>): option is None {
	return option.none;
}

