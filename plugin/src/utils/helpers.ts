/**
 * Utility helper functions
 */

/**
 * Format date to string
 */
export function formatDate(date: Date): string {
	return date.toLocaleDateString();
}

/**
 * Parse date from string
 */
export function parseDate(dateString: string): Date | null {
	const date = new Date(dateString);
	return isNaN(date.getTime()) ? null : date;
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
	return !str || str.trim().length === 0;
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
	return filename
		.replace(/[<>:"/\\|?*]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
	const parts = filename.split('.');
	return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Remove file extension
 */
export function removeFileExtension(filename: string): string {
	const lastDot = filename.lastIndexOf('.');
	return lastDot > 0 ? filename.substring(0, lastDot) : filename;
}

