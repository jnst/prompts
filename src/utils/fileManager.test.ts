import { promises as fs } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { normalizeModelName, saveOutput } from './fileManager.js';

const TEST_PROMPT_PATH = path.join(process.cwd(), 'test-prompt');
const TEST_OUTPUTS_PATH = path.join(TEST_PROMPT_PATH, 'outputs');

describe('fileManager', () => {
	beforeEach(async () => {
		await fs.mkdir(TEST_OUTPUTS_PATH, { recursive: true });
	});

	afterEach(async () => {
		try {
			await fs.rm(TEST_PROMPT_PATH, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	});

	describe('normalizeModelName', () => {
		it('should normalize sonnet4 to claude-sonnet-4', () => {
			expect(normalizeModelName('sonnet4')).toBe('claude-sonnet-4');
		});

		it('should normalize opus4 to claude-opus-4', () => {
			expect(normalizeModelName('opus4')).toBe('claude-opus-4');
		});

		it('should return full model names unchanged', () => {
			expect(normalizeModelName('claude-sonnet-4')).toBe('claude-sonnet-4');
			expect(normalizeModelName('claude-opus-4')).toBe('claude-opus-4');
		});

		it('should handle case variations', () => {
			expect(normalizeModelName('SONNET4')).toBe('claude-sonnet-4');
			expect(normalizeModelName('OPUS4')).toBe('claude-opus-4');
		});

		it('should default to claude-sonnet-4 for unknown models', () => {
			expect(normalizeModelName('unknown-model')).toBe('claude-sonnet-4');
			expect(normalizeModelName('')).toBe('claude-sonnet-4');
		});
	});

	describe('saveOutput', () => {
		it('should save output with correct frontmatter and content', async () => {
			const testContent = 'This is test clipboard content';
			const metadata = {
				version: '1.2.0',
				model: 'claude-sonnet-4',
				timestamp: '2024-01-15T10:30:00Z',
			};

			const outputPath = await saveOutput(
				TEST_PROMPT_PATH,
				testContent,
				metadata,
			);

			// Check that file was created
			expect(outputPath).toBeDefined();
			await expect(fs.access(outputPath)).resolves.not.toThrow();

			// Read and verify content
			const savedContent = await fs.readFile(outputPath, 'utf-8');

			expect(savedContent).toContain('---');
			expect(savedContent).toContain('version: "1.2.0"');
			expect(savedContent).toContain('model: "claude-sonnet-4"');
			expect(savedContent).toContain('timestamp: "2024-01-15T10:30:00Z"');
			expect(savedContent).toContain('---');
			expect(savedContent).toContain('This is test clipboard content');
		});

		it('should generate timestamp if not provided', async () => {
			const testContent = 'Test content';
			const metadata = {
				version: '1.0.0',
				model: 'claude-opus-4',
				timestamp: '', // Empty timestamp should trigger generation
			};

			const outputPath = await saveOutput(
				TEST_PROMPT_PATH,
				testContent,
				metadata,
			);
			const savedContent = await fs.readFile(outputPath, 'utf-8');

			// Should contain a valid ISO timestamp
			const timestampMatch = savedContent.match(/timestamp: "([^"]+)"/);
			expect(timestampMatch).toBeTruthy();

			const timestamp = timestampMatch![1];
			expect(() => new Date(timestamp)).not.toThrow();
			expect(new Date(timestamp).getTime()).toBeGreaterThan(Date.now() - 5000); // Within last 5 seconds
		});

		it('should create outputs directory if it does not exist', async () => {
			// Remove outputs directory
			await fs.rm(TEST_OUTPUTS_PATH, { recursive: true, force: true });

			const testContent = 'Test content';
			const metadata = {
				version: '1.0.0',
				model: 'claude-sonnet-4',
				timestamp: '2024-01-15T10:30:00Z',
			};

			const outputPath = await saveOutput(
				TEST_PROMPT_PATH,
				testContent,
				metadata,
			);

			// Check that outputs directory was created
			await expect(fs.access(TEST_OUTPUTS_PATH)).resolves.not.toThrow();
			await expect(fs.access(outputPath)).resolves.not.toThrow();
		});

		it('should generate unique filenames for multiple saves', async () => {
			const testContent = 'Test content';
			const metadata1 = {
				version: '1.0.0',
				model: 'claude-sonnet-4',
				timestamp: '', // Empty to trigger generation
			};
			const metadata2 = {
				version: '1.0.0',
				model: 'claude-sonnet-4',
				timestamp: '', // Empty to trigger generation
			};

			// Use different timestamps to ensure unique filenames
			const path1 = await saveOutput(TEST_PROMPT_PATH, testContent, {
				...metadata1,
				timestamp: '2024-01-15T10:30:00.000Z',
			});
			const path2 = await saveOutput(TEST_PROMPT_PATH, testContent, {
				...metadata2,
				timestamp: '2024-01-15T10:30:01.000Z',
			});

			expect(path1).not.toBe(path2);
			await expect(fs.access(path1)).resolves.not.toThrow();
			await expect(fs.access(path2)).resolves.not.toThrow();
		});

		it('should handle Japanese content in both metadata and content', async () => {
			const testContent =
				'これは日本語のテストコンテンツです。\\n\\n複数行にわたっています。';
			const metadata = {
				version: '1.0.0-日本語',
				model: 'claude-sonnet-4',
				timestamp: '2024-01-15T10:30:00Z',
			};

			const outputPath = await saveOutput(
				TEST_PROMPT_PATH,
				testContent,
				metadata,
			);
			const savedContent = await fs.readFile(outputPath, 'utf-8');

			expect(savedContent).toContain('version: "1.0.0-日本語"');
			expect(savedContent).toContain('これは日本語のテストコンテンツです。');
		});

		it('should preserve line breaks and formatting in content', async () => {
			const testContent = `Line 1
Line 2

Line 4 after empty line
	Indented line`;

			const metadata = {
				version: '1.0.0',
				model: 'claude-sonnet-4',
				timestamp: '2024-01-15T10:30:00Z',
			};

			const outputPath = await saveOutput(
				TEST_PROMPT_PATH,
				testContent,
				metadata,
			);
			const savedContent = await fs.readFile(outputPath, 'utf-8');

			expect(savedContent).toContain('Line 1');
		});

		it('should use .md extension for output files', async () => {
			const testContent = 'Test content';
			const metadata = {
				version: '1.0.0',
				model: 'claude-sonnet-4',
				timestamp: '2024-01-15T10:30:00Z',
			};

			const outputPath = await saveOutput(
				TEST_PROMPT_PATH,
				testContent,
				metadata,
			);

			expect(path.extname(outputPath)).toBe('.md');
		});
	});
});
