import { describe, expect, it } from 'vitest';
import { getClipboardContent } from './clipboard.js';

describe('clipboard', () => {
	describe('getClipboardContent', () => {
		it('should be a function', () => {
			expect(typeof getClipboardContent).toBe('function');
		});

		it('should return a promise', () => {
			// Skip actual execution to avoid pbpaste dependency
			const result = getClipboardContent().catch(() => 'mocked');
			expect(result).toBeInstanceOf(Promise);
		});

		// Note: Real clipboard tests would require mocking child_process
		// and are platform-dependent. For CI/CD, these would need proper mocking.
	});
});
