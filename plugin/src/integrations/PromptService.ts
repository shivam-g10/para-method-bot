import { App, TFile } from 'obsidian';
import { FileService } from '../services/FileService';

export interface PromptContext {
	vaultContent?: string[];
	currentFile?: TFile;
	paraContext?: string;
}

/**
 * Service for generating context-aware prompts for AI operations
 */
export class PromptService {
	private app: App;
	private fileService: FileService;

	constructor(app: App) {
		this.app = app;
		this.fileService = new FileService(app);
	}

	/**
	 * Generate prompt for extracting information from project
	 */
	async generateExtractionPrompt(projectFile: TFile, context?: PromptContext): Promise<string> {
		const content = await this.fileService.readFile(projectFile);
		
		let prompt = `Extract key information from this project note. Focus on:
- Important learnings and insights
- Useful resources or references
- Actionable knowledge that should be preserved
- Key outcomes or results

Project Content:
${content}

`;

		if (context?.vaultContent && context.vaultContent.length > 0) {
			prompt += `\nRelevant context from vault:\n${context.vaultContent.join('\n\n')}\n`;
		}

		prompt += `\nProvide a structured summary that can be added to Resources.`;

		return prompt;
	}

	/**
	 * Generate prompt for archiving project
	 */
	async generateArchivePrompt(projectFile: TFile): Promise<string> {
		const content = await this.fileService.readFile(projectFile);
		
		return `This project is being archived. Extract and summarize:
1. What was accomplished
2. Key learnings
3. Resources that should be preserved
4. Any follow-up actions needed

Project Content:
${content}

Provide a concise archive summary.`;
	}

	/**
	 * Generate prompt for generating insights from vault
	 */
	async generateInsightPrompt(files: TFile[], focusArea?: string): Promise<string> {
		const contents = await Promise.all(
			files.map(file => this.fileService.readFile(file))
		);

		let prompt = `Analyze the following content from my second brain vault and generate insights. `;
		
		if (focusArea) {
			prompt += `Focus on: ${focusArea}\n\n`;
		}

		prompt += `Content:\n${contents.join('\n\n---\n\n')}\n\n`;
		prompt += `Generate actionable insights, patterns, and connections. Use only the provided content - do not add external information.`;

		return prompt;
	}

	/**
	 * Generate prompt for content analysis
	 */
	async generateAnalysisPrompt(file: TFile, analysisType: 'summary' | 'key-points' | 'action-items'): Promise<string> {
		const content = await this.fileService.readFile(file);

		const prompts: Record<string, string> = {
			summary: `Provide a concise summary of this content:\n\n${content}`,
			'key-points': `Extract the key points from this content:\n\n${content}`,
			'action-items': `Extract actionable items or tasks from this content:\n\n${content}`,
		};

		return prompts[analysisType] || prompts.summary;
	}

	/**
	 * Build context from vault files
	 */
	async buildContext(files: TFile[], maxLength: number = 10000): Promise<string[]> {
		const contexts: string[] = [];
		let totalLength = 0;

		for (const file of files) {
			if (totalLength >= maxLength) break;

			const content = await this.fileService.readFile(file);
			const fileContext = `File: ${file.basename}\n${content.substring(0, 2000)}`;

			if (totalLength + fileContext.length <= maxLength) {
				contexts.push(fileContext);
				totalLength += fileContext.length;
			}
		}

		return contexts;
	}
}

