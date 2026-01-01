import { TFile } from 'obsidian';
import { IPropertiesService } from '../../src/interfaces/IPropertiesService';
import { PARAType, ProjectStatus, AreaStatus } from '../../src/core/PARA';
import { PARAProperties } from '../../src/services/PropertiesService';

/**
 * Mock implementation of IPropertiesService for testing
 */
export class MockPropertiesService implements IPropertiesService {
	private properties: Map<string, PARAProperties> = new Map();

	async getProperties(file: TFile): Promise<PARAProperties> {
		return this.properties.get(file.path) || {};
	}

	async setProperties(file: TFile, properties: PARAProperties): Promise<void> {
		this.properties.set(file.path, { ...this.properties.get(file.path), ...properties });
	}

	async updateProperty(
		file: TFile,
		key: keyof PARAProperties,
		value: any
	): Promise<void> {
		const props = await this.getProperties(file);
		props[key] = value;
		await this.setProperties(file, props);
	}

	async getPARAType(file: TFile): Promise<PARAType | null> {
		const props = await this.getProperties(file);
		return props['para-type'] || null;
	}

	async setPARAType(file: TFile, type: PARAType): Promise<void> {
		await this.updateProperty(file, 'para-type', type);
	}

	async getStatus(file: TFile): Promise<ProjectStatus | AreaStatus | null> {
		const props = await this.getProperties(file);
		return props.status || null;
	}

	async setStatus(file: TFile, status: ProjectStatus | AreaStatus): Promise<void> {
		await this.updateProperty(file, 'status', status);
	}

	// Helper methods for testing
	clear(): void {
		this.properties.clear();
	}
}

