/**
 * Interface for storage abstraction.
 * Allows swapping storage backends (localStorage, IndexedDB, secure storage, etc.).
 * 
 * @interface IStorage
 */
export interface IStorage {
	/**
	 * Get value from storage
	 * @param key - Storage key
	 * @returns Promise resolving to stored value or null if not found
	 */
	get<T = any>(key: string): Promise<T | null>;

	/**
	 * Set value in storage
	 * @param key - Storage key
	 * @param value - Value to store
	 * @returns Promise that resolves when value is stored
	 */
	set<T = any>(key: string, value: T): Promise<void>;

	/**
	 * Delete value from storage
	 * @param key - Storage key
	 * @returns Promise that resolves when value is deleted
	 */
	delete(key: string): Promise<void>;

	/**
	 * Check if key exists in storage
	 * @param key - Storage key
	 * @returns Promise resolving to true if key exists
	 */
	has(key: string): Promise<boolean>;

	/**
	 * Get all keys in storage
	 * @returns Promise resolving to array of all keys
	 */
	keys(): Promise<string[]>;

	/**
	 * Clear all values from storage
	 * @returns Promise that resolves when storage is cleared
	 */
	clear(): Promise<void>;
}

