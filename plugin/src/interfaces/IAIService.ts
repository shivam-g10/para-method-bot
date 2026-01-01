import { TFile } from 'obsidian';
import { OrganizationMode } from '../services/FileService';
import { ExtractionResult, ArchiveResult, Insight } from '../services/AIService';

/**
 * Interface for AI operations abstraction.
 * Allows swapping AI service implementations.
 * 
 * @interface IAIService
 */
export interface IAIService {
	/**
	 * Extract information from project and prepare for distribution to resources
	 * @param projectFile - Project file to extract from
	 * @param mode - Organization mode
	 * @returns Promise resolving to extraction result with summary, learnings, resources, and action items
	 */
	extractFromProject(projectFile: TFile, mode: OrganizationMode): Promise<ExtractionResult>;

	/**
	 * Archive project with AI assistance
	 * @param projectFile - Project file to archive
	 * @param mode - Organization mode
	 * @returns Promise resolving to archive result with summary and extracted info
	 */
	archiveProjectWithAI(projectFile: TFile, mode: OrganizationMode): Promise<ArchiveResult>;

	/**
	 * Generate insights from vault content
	 * @param files - Files to analyze
	 * @param focusArea - Optional focus area for insights
	 * @param mode - Organization mode
	 * @returns Promise resolving to array of insights
	 */
	generateInsights(
		files: TFile[],
		focusArea?: string,
		mode?: OrganizationMode
	): Promise<Insight[]>;

	/**
	 * Analyze content and extract key information
	 * @param file - File to analyze
	 * @param analysisType - Type of analysis (summary, key-points, action-items)
	 * @returns Promise resolving to analysis result string
	 */
	analyzeContent(
		file: TFile,
		analysisType: 'summary' | 'key-points' | 'action-items'
	): Promise<string>;

	/**
	 * Distribute extracted information to resources
	 * @param extraction - Extraction result to distribute
	 * @param targetResources - Target resource files
	 * @param mode - Organization mode
	 * @returns Promise that resolves when distribution is complete
	 */
	distributeToResources(
		extraction: ExtractionResult,
		targetResources: TFile[],
		mode: OrganizationMode
	): Promise<void>;
}

