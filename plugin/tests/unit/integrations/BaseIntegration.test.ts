import { BaseIntegration, IntegrationConfig } from '../../../src/integrations/BaseIntegration';

class TestIntegration extends BaseIntegration {
	async healthCheck(): Promise<boolean> {
		return true;
	}

	async initialize(): Promise<void> {
		// Test implementation
	}

	async cleanup(): Promise<void> {
		// Test implementation
	}
}

describe('BaseIntegration', () => {
	let integration: TestIntegration;
	let config: IntegrationConfig;

	beforeEach(() => {
		config = {
			name: 'test',
			enabled: true,
		};
		integration = new TestIntegration('test', config);
	});

	describe('getName', () => {
		it('should return integration name', () => {
			expect(integration.getName()).toBe('test');
		});
	});

	describe('isEnabled', () => {
		it('should return true when enabled', () => {
			expect(integration.isEnabled()).toBe(true);
		});

		it('should return false when disabled', () => {
			integration.disable();
			expect(integration.isEnabled()).toBe(false);
		});
	});

	describe('enable/disable', () => {
		it('should enable integration', () => {
			integration.disable();
			integration.enable();
			expect(integration.isEnabled()).toBe(true);
		});

		it('should disable integration', () => {
			integration.disable();
			expect(integration.isEnabled()).toBe(false);
		});
	});

	describe('getConfig', () => {
		it('should return configuration', () => {
			const returnedConfig = integration.getConfig();
			expect(returnedConfig).toEqual(config);
		});
	});

	describe('updateConfig', () => {
		it('should update configuration', () => {
			integration.updateConfig({ enabled: false });
			expect(integration.getConfig().enabled).toBe(false);
		});
	});
});

