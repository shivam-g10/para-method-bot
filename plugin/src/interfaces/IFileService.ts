import { TFile, TFolder } from 'obsidian';
import { PARAType } from '../core/PARA';
import { OrganizationMode } from '../services/FileService';
import { Result } from '../utils/Result';
import { Option } from '../utils/Option';
import { FileOperationError } from '../utils/errors';

/**
 * Interface for file operations abstraction.
 * Allows swapping file system implementations, cloud storage, etc.
 * 
 * @interface IFileService
 */
export interface IFileService {
	/**
	 * Read file content
	 * @param file - The file to read
	 * @returns Promise resolving to file content as string
	 */
	readFile(file: TFile): Promise<string>;

	/**
	 * Read file content (Result pattern)
	 * @param file - The file to read
	 * @returns Promise resolving to Result with file content or error
	 */
	readFileSafe(file: TFile): Promise<Result<string, FileOperationError>>;

	/**
	 * Write content to file
	 * @param file - The file to write to
	 * @param content - Content to write
	 * @returns Promise that resolves when write is complete
	 */
	writeFile(file: TFile, content: string): Promise<void>;

	/**
	 * Write content to file (Result pattern)
	 * @param file - The file to write to
	 * @param content - Content to write
	 * @returns Promise resolving to Result indicating success or error
	 */
	writeFileSafe(file: TFile, content: string): Promise<Result<void, FileOperationError>>;

	/**
	 * Create a new file
	 * @param path - Path where file should be created
	 * @param content - Initial content for the file
	 * @returns Promise resolving to created file
	 */
	createFile(path: string, content: string): Promise<TFile>;

	/**
	 * Create a new file (Result pattern)
	 * @param path - Path where file should be created
	 * @param content - Initial content for the file
	 * @returns Promise resolving to Result with created file or error
	 */
	createFileSafe(path: string, content: string): Promise<Result<TFile, FileOperationError>>;

	/**
	 * Move file to PARA folder
	 * @param file - File to move
	 * @param type - PARA type (project, area, resource, archive)
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise that resolves when move is complete
	 */
	moveToPARAFolder(
		file: TFile,
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): Promise<void>;

	/**
	 * Ensure folder exists, create if it doesn't
	 * @param folderPath - Path of folder to ensure exists
	 * @returns Promise that resolves when folder exists
	 */
	ensureFolderExists(folderPath: string): Promise<void>;

	/**
	 * Get all files in PARA folder
	 * @param type - PARA type
	 * @param customFolders - Optional custom folder mapping
	 * @returns Array of files in the folder
	 */
	getFilesInPARAFolder(
		type: PARAType,
		customFolders?: Record<PARAType, string>
	): TFile[];

	/**
	 * Delete file
	 * @param file - File to delete
	 * @returns Promise that resolves when deletion is complete
	 */
	deleteFile(file: TFile): Promise<void>;

	/**
	 * Check if file exists
	 * @param path - Path to check
	 * @returns True if file exists, false otherwise
	 */
	fileExists(path: string): boolean;

	/**
	 * Auto-detect PARA category from file
	 * @param file - File to analyze
	 * @param mode - Organization mode (folder, property, hybrid)
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise resolving to detected PARA type or null
	 */
	detectPARAType(
		file: TFile,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<PARAType | null>;

	/**
	 * Auto-detect PARA category from file (Option pattern)
	 * @param file - File to analyze
	 * @param mode - Organization mode (folder, property, hybrid)
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise resolving to Option of detected PARA type
	 */
	detectPARATypeSafe(
		file: TFile,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<Option<PARAType>>;

	/**
	 * Organize file to PARA category based on mode
	 * @param file - File to organize
	 * @param type - PARA type to organize to
	 * @param mode - Organization mode
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise that resolves when organization is complete
	 */
	organizeToPARA(
		file: TFile,
		type: PARAType,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<void>;

	/**
	 * Batch organize multiple files
	 * @param files - Files to organize
	 * @param type - PARA type to organize to
	 * @param mode - Organization mode
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise that resolves when all files are organized
	 */
	batchOrganize(
		files: TFile[],
		type: PARAType,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<void>;

	/**
	 * Get files by PARA type based on organization mode
	 * @param type - PARA type to filter by
	 * @param mode - Organization mode
	 * @param customFolders - Optional custom folder mapping
	 * @returns Promise resolving to array of files matching the type
	 */
	getFilesByPARAType(
		type: PARAType,
		mode: OrganizationMode,
		customFolders?: Record<PARAType, string>
	): Promise<TFile[]>;
}

