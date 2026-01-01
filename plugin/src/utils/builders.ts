/**
 * Builder pattern utilities
 */

/**
 * Base builder interface
 */
export interface Builder<T> {
	build(): T;
}

/**
 * Fluent builder helper
 */
export class FluentBuilder<T> {
	protected data: Partial<T> = {};

	build(): T {
		return this.data as T;
	}

	/**
	 * Set a property
	 */
	set<K extends keyof T>(key: K, value: T[K]): this {
		this.data[key] = value;
		return this;
	}

	/**
	 * Merge properties
	 */
	merge(partial: Partial<T>): this {
		Object.assign(this.data, partial);
		return this;
	}
}

