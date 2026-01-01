import { ServiceContainer } from '../../src/core/ServiceContainer';
import { MockFileService } from './mocks/MockFileService';
import { MockPropertiesService } from './mocks/MockPropertiesService';
import { MockTagService } from './mocks/MockTagService';

/**
 * Test setup with DI container and mock services
 */
export function setupTestContainer(): ServiceContainer {
	const container = new ServiceContainer();

	// Register mock services
	container.register('IFileService', {
		implementation: MockFileService,
		lifecycle: 'singleton',
	});

	container.register('IPropertiesService', {
		implementation: MockPropertiesService,
		lifecycle: 'singleton',
	});

	container.register('ITagService', {
		implementation: MockTagService,
		lifecycle: 'singleton',
	});

	return container;
}
