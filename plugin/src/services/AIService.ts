import { App, TFile } from 'obsidian';
import { OrganizationMode } from './FileService';
import { IAIService } from '../interfaces/IAIService';
import { AIProviderManager } from '../integrations/AIProviderManager';
import { PromptService } from '../integrations/PromptService';
import { IFileService } from '../interfaces/IFileService';
import { IProjectService } from '../interfaces/IProjectService';
import { ISearchService } from '../interfaces/ISearchService';

export interface ExtractionResult {
	summary: string;
	learnings: string[];
	resources: string[];
	actionItems: string[];
}

export interface ArchiveResult {
	summary: string;
	extractedInfo: ExtractionResult;
}

export interface Insight {
	title: string;
	description: string;
	relatedFiles: string[];
}

export class AIService implements IAIService {
	private app: App;
	private aiProviderManager: AIProviderManager;
	private promptService: PromptService;
	private fileService: IFileService;
	private projectService: IProjectService;
	private searchService: ISearchService;

	constructor(
		app: App,
		aiProviderManager: AIProviderManager,
		promptService: PromptService,
		fileService: IFileService,
		projectService: IProjectService,
		searchService: ISearchService
	) {
		this.app = app;
		this.aiProviderManager = aiProviderManager;
		this.promptService = promptService;
		this.fileService = fileService;
		this.projectService = projectService;
		this.searchService = searchService;
	}

	/**
	 * Extract information from project and prepare for distribution to resources
	 */
	async extractFromProject(projectFile: TFile, mode: OrganizationMode): Promise<ExtractionResult> {
		// Build context from related files
		const relatedFiles = await this.searchService.search(
			{ paraType: 'resource' },
			mode
		);

		const context = await this.promptService.buildContext(relatedFiles.slice(0, 5));

		// Generate extraction prompt
		const prompt = await this.promptService.generateExtractionPrompt(projectFile, {
			vaultContent: context,
		});

		// Get AI response
		const response = await this.aiProviderManager.request({
			prompt,
			systemPrompt: 'You are a knowledge management assistant. Extract and organize information from project notes.',
		});

		// Parse response into structured format
		return this.parseExtractionResponse(response.content);
	}

	/**
	 * Archive project with AI assistance
	 */
	async archiveProjectWithAI(
		projectFile: TFile,
		mode: OrganizationMode
	): Promise<ArchiveResult> {
		// Extract information before archiving
		const extractedInfo = await this.extractFromProject(projectFile, mode);

		// Generate archive summary
		const archivePrompt = await this.promptService.generateArchivePrompt(projectFile);
		const archiveResponse = await this.aiProviderManager.request({
			prompt: archivePrompt,
			systemPrompt: 'You are a knowledge management assistant. Create concise archive summaries.',
		});

		// Archive the project
		await this.projectService.archiveProject(projectFile, mode);

		return {
			summary: archiveResponse.content,
			extractedInfo,
		};
	}

	/**
	 * Generate insights from vault content
	 */
	async generateInsights(
		files: TFile[],
		focusArea?: string,
		mode: OrganizationMode = 'hybrid'
	): Promise<Insight[]> {
		// Limit files for context
		const limitedFiles = files.slice(0, 10);

		// Generate insight prompt
		const prompt = await this.promptService.generateInsightPrompt(limitedFiles, focusArea);

		// Get AI response
		const response = await this.aiProviderManager.request({
			prompt,
			systemPrompt: 'You are a knowledge management assistant. Generate actionable insights from second brain content.',
			maxTokens: 2000,
		});

		// Parse insights
		return this.parseInsightsResponse(response.content, limitedFiles);
	}

	/**
	 * Analyze content and extract key information
	 */
	async analyzeContent(
		file: TFile,
		analysisType: 'summary' | 'key-points' | 'action-items'
	): Promise<string> {
		const prompt = await this.promptService.generateAnalysisPrompt(file, analysisType);
		
		const response = await this.aiProviderManager.request({
			prompt,
			systemPrompt: 'You are a content analysis assistant. Provide clear, concise analysis.',
		});

		return response.content;
	}

	/**
	 * Distribute extracted information to resources
	 */
	async distributeToResources(
		extraction: ExtractionResult,
		targetResources: TFile[],
		mode: OrganizationMode
	): Promise<void> {
		for (const resource of targetResources) {
			const content = await this.fileService.readFile(resource);
			
			// Generate distribution prompt
			const prompt = `Add the following information to this resource note in an appropriate section:\n\n${JSON.stringify(extraction, null, 2)}\n\nCurrent resource content:\n${content}\n\nProvide updated content that integrates the new information naturally.`;

			const response = await this.aiProviderManager.request({
				prompt,
				systemPrompt: 'You are a knowledge management assistant. Integrate new information into existing notes.',
			});

			// Update resource file
			await this.fileService.writeFile(resource, response.content);
		}
	}

	/**
	 * Parse extraction response into structured format
	 */
	private parseExtractionResponse(content: string): ExtractionResult {
		// Simple parsing - in production, use more robust parsing
		const learnings: string[] = [];
		const resources: string[] = [];
		const actionItems: string[] = [];

		// Extract sections (simple regex-based parsing)
		const learningsMatch = content.match(/Learnings?:?\s*\n([\s\S]*?)(?=\n\w+:|$)/i);
		if (learningsMatch) {
			learningsMatch[1].split('\n').forEach(line => {
				const trimmed = line.replace(/^[-*]\s*/, '').trim();
				if (trimmed) learnings.push(trimmed);
			});
		}

		const resourcesMatch = content.match(/Resources?:?\s*\n([\s\S]*?)(?=\n\w+:|$)/i);
		if (resourcesMatch) {
			resourcesMatch[1].split('\n').forEach(line => {
				const trimmed = line.replace(/^[-*]\s*/, '').trim();
				if (trimmed) resources.push(trimmed);
			});
		}

		const actionsMatch = content.match(/Action Items?:?\s*\n([\s\S]*?)(?=\n\w+:|$)/i);
		if (actionsMatch) {
			actionsMatch[1].split('\n').forEach(line => {
				const trimmed = line.replace(/^[-*]\s*/, '').trim();
				if (trimmed) actionItems.push(trimmed);
			});
		}

		return {
			summary: content.split('\n')[0] || content.substring(0, 200),
			learnings,
			resources,
			actionItems,
		};
	}

	/**
	 * Parse insights response
	 */
	private parseInsightsResponse(content: string, files: TFile[]): Insight[] {
		const insights: Insight[] = [];

		// Simple parsing - split by numbered or bulleted items
		const lines = content.split('\n');
		let currentInsight: Partial<Insight> | null = null;

		for (const line of lines) {
			const trimmed = line.trim();
			
			// Check if it's a new insight (starts with number, bullet, or title-like pattern)
			if (/^\d+\.|^[-*]|^##/.test(trimmed)) {
				if (currentInsight && currentInsight.title) {
					insights.push(currentInsight as Insight);
				}
				currentInsight = {
					title: trimmed.replace(/^#+\s*|^\d+\.\s*|^[-*]\s*/, ''),
					description: '',
					relatedFiles: files.slice(0, 3).map(f => f.basename),
				};
			} else if (currentInsight && trimmed) {
				currentInsight.description += (currentInsight.description ? ' ' : '') + trimmed;
			}
		}

		if (currentInsight && currentInsight.title) {
			insights.push(currentInsight as Insight);
		}

		return insights.length > 0 ? insights : [{
			title: 'General Insight',
			description: content,
			relatedFiles: files.slice(0, 3).map(f => f.basename),
		}];
	}
}

