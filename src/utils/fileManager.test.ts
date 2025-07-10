import { promises as fs } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	clearFileContent,
	createTopicFile,
	detectFilledFiles,
	detectUnfilledFiles,
	normalizeModelName,
	removeFile,
	saveOutput,
	updateFileContent,
} from './fileManager.js';

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

		it('should return original input for unknown models', () => {
			expect(normalizeModelName('unknown-model')).toBe('unknown-model');
			expect(normalizeModelName('')).toBe('');
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

			const result = await saveOutput(TEST_PROMPT_PATH, testContent, metadata);

			// Check that save was successful
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard for TypeScript

			const outputPath = result.value;
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

			const result = await saveOutput(TEST_PROMPT_PATH, testContent, metadata);

			// Check that save was successful
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard for TypeScript

			const outputPath = result.value;
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

			const result = await saveOutput(TEST_PROMPT_PATH, testContent, metadata);

			// Check that save was successful
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard for TypeScript

			const outputPath = result.value;

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
			const result1 = await saveOutput(TEST_PROMPT_PATH, testContent, {
				...metadata1,
				timestamp: '2024-01-15T10:30:00.000Z',
			});
			const result2 = await saveOutput(TEST_PROMPT_PATH, testContent, {
				...metadata2,
				timestamp: '2024-01-15T10:30:01.000Z',
			});

			// Check that both saves were successful
			expect(result1.isOk()).toBe(true);
			expect(result2.isOk()).toBe(true);
			if (result1.isErr() || result2.isErr()) return; // Type guard for TypeScript

			const path1 = result1.value;
			const path2 = result2.value;

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

			const result = await saveOutput(TEST_PROMPT_PATH, testContent, metadata);

			// Check that save was successful
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard for TypeScript

			const outputPath = result.value;
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

			const result = await saveOutput(TEST_PROMPT_PATH, testContent, metadata);

			// Check that save was successful
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard for TypeScript

			const outputPath = result.value;
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

			const result = await saveOutput(TEST_PROMPT_PATH, testContent, metadata);

			// Check that save was successful
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard for TypeScript

			const outputPath = result.value;

			expect(path.extname(outputPath)).toBe('.md');
		});
	});

	describe('createTopicFile', () => {
		it('should create a topic file with correct frontmatter', async () => {
			const topic = 'test-topic';
			const promptVersion = '1.0.0';

			const result = await createTopicFile(
				TEST_PROMPT_PATH,
				topic,
				promptVersion,
			);

			// Check that creation was successful
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard

			const filePath = result.value;
			const content = await fs.readFile(filePath, 'utf-8');

			// Should contain frontmatter
			expect(content).toContain('---');
			expect(content).toContain('topic: "test-topic"');
			expect(content).toContain('prompt_version: "1.0.0"');
			expect(content).toContain('timestamp:');
			expect(content).toContain('---');

			// Should have empty body
			const lines = content.split('\n');
			const frontmatterEnd = lines.findIndex(
				(line, index) => index > 0 && line.startsWith('---'),
			);
			const body = lines
				.slice(frontmatterEnd + 1)
				.join('\n')
				.trim();
			expect(body).toBe('');
		});

		it('should sanitize topic names for filename', async () => {
			const topic = 'test<>topic:with/special?characters';
			const promptVersion = '1.0.0';

			const result = await createTopicFile(
				TEST_PROMPT_PATH,
				topic,
				promptVersion,
			);

			// Check that creation was successful
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard

			const filePath = result.value;
			const fileName = path.basename(filePath);

			// Should have sanitized filename but original topic in frontmatter
			expect(fileName).toBe('test__topic_with_special_characters.md');

			const content = await fs.readFile(filePath, 'utf-8');
			expect(content).toContain('topic: "test<>topic:with/special?characters"');
		});
	});

	describe('detectUnfilledFiles', () => {
		it('should detect files with empty body', async () => {
			// Create test topic file
			const topic = 'empty-topic';
			const promptVersion = '1.0.0';

			await createTopicFile(TEST_PROMPT_PATH, topic, promptVersion);

			// Create another file with content
			const filledFilePath = path.join(TEST_OUTPUTS_PATH, 'filled-topic.md');
			await fs.writeFile(
				filledFilePath,
				`---
topic: "filled-topic"
prompt_version: "1.0.0"
timestamp: "2024-01-15T10:30:00Z"
---

This file has content and should not be detected as unfilled.
`,
			);

			const result = await detectUnfilledFiles(TEST_PROMPT_PATH);

			// Should detect only the empty file
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard

			const unfilledFiles = result.value;
			expect(unfilledFiles).toHaveLength(1);
			expect(unfilledFiles[0].topic).toBe('empty-topic');
			expect(unfilledFiles[0].fileName).toBe('empty-topic.md');
		});

		it('should return empty array when no unfilled files exist', async () => {
			// Create only filled files
			const filledFilePath = path.join(TEST_OUTPUTS_PATH, 'filled-topic.md');
			await fs.writeFile(
				filledFilePath,
				`---
topic: "filled-topic"
prompt_version: "1.0.0"
timestamp: "2024-01-15T10:30:00Z"
---

This file has content.
`,
			);

			const result = await detectUnfilledFiles(TEST_PROMPT_PATH);

			// Should return empty array
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard

			const unfilledFiles = result.value;
			expect(unfilledFiles).toHaveLength(0);
		});

		it('should return empty array when outputs directory does not exist', async () => {
			// Remove outputs directory
			await fs.rm(TEST_OUTPUTS_PATH, { recursive: true, force: true });

			const result = await detectUnfilledFiles(TEST_PROMPT_PATH);

			// Should return empty array without error
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard

			const unfilledFiles = result.value;
			expect(unfilledFiles).toHaveLength(0);
		});
	});

	describe('updateFileContent', () => {
		it('should append content to existing file', async () => {
			// Create test file
			const testFilePath = path.join(TEST_OUTPUTS_PATH, 'test-file.md');
			const initialContent = `---
topic: "test-topic"
prompt_version: "1.0.0"
timestamp: "2024-01-15T10:30:00Z"
---

`;
			await fs.writeFile(testFilePath, initialContent);

			// Update with new content
			const newContent = 'This is new content added to the file.';
			const result = await updateFileContent(testFilePath, newContent);

			// Check that update was successful
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard

			const updatedContent = await fs.readFile(testFilePath, 'utf-8');
			expect(updatedContent).toBe(initialContent + newContent);
		});

		it('should handle multi-line content', async () => {
			// Create test file
			const testFilePath = path.join(TEST_OUTPUTS_PATH, 'test-file.md');
			const initialContent = `---
topic: "test-topic"
prompt_version: "1.0.0"
timestamp: "2024-01-15T10:30:00Z"
---

`;
			await fs.writeFile(testFilePath, initialContent);

			// Update with multi-line content
			const newContent = `Line 1
Line 2

Line 4 after empty line`;
			const result = await updateFileContent(testFilePath, newContent);

			// Check that update was successful
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard

			const updatedContent = await fs.readFile(testFilePath, 'utf-8');
			expect(updatedContent).toContain('Line 1');
			expect(updatedContent).toContain('Line 2');
			expect(updatedContent).toContain('Line 4 after empty line');
		});

		it('should return error for non-existent file', async () => {
			const nonExistentFile = path.join(TEST_OUTPUTS_PATH, 'does-not-exist.md');
			const result = await updateFileContent(nonExistentFile, 'some content');

			expect(result.isErr()).toBe(true);
			if (result.isOk()) return; // Type guard

			expect(result.error.message).toContain('File not found');
		});
	});

	describe('detectFilledFiles', () => {
		it('should detect files with content', async () => {
			// Create filled topic file
			const filledFilePath = path.join(TEST_OUTPUTS_PATH, 'filled-topic.md');
			await fs.writeFile(
				filledFilePath,
				`---
topic: "filled-topic"
prompt_version: "1.0.0"
timestamp: "2024-01-15T10:30:00Z"
---

This file has content and should be detected as filled.
`,
			);

			// Create empty topic file
			const emptyFilePath = path.join(TEST_OUTPUTS_PATH, 'empty-topic.md');
			await fs.writeFile(
				emptyFilePath,
				`---
topic: "empty-topic"
prompt_version: "1.0.0"
timestamp: "2024-01-15T10:30:00Z"
---

`,
			);

			const result = await detectFilledFiles(TEST_PROMPT_PATH);

			// Should detect only the filled file
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard

			const filledFiles = result.value;
			expect(filledFiles).toHaveLength(1);
			expect(filledFiles[0].topic).toBe('filled-topic');
			expect(filledFiles[0].fileName).toBe('filled-topic.md');
		});

		it('should return empty array when no filled files exist', async () => {
			// Create only empty files
			const emptyFilePath = path.join(TEST_OUTPUTS_PATH, 'empty-topic.md');
			await fs.writeFile(
				emptyFilePath,
				`---
topic: "empty-topic"
prompt_version: "1.0.0"
timestamp: "2024-01-15T10:30:00Z"
---

`,
			);

			const result = await detectFilledFiles(TEST_PROMPT_PATH);

			// Should return empty array
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard

			const filledFiles = result.value;
			expect(filledFiles).toHaveLength(0);
		});

		it('should return empty array when outputs directory does not exist', async () => {
			// Remove outputs directory
			await fs.rm(TEST_OUTPUTS_PATH, { recursive: true, force: true });

			const result = await detectFilledFiles(TEST_PROMPT_PATH);

			// Should return empty array without error
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard

			const filledFiles = result.value;
			expect(filledFiles).toHaveLength(0);
		});
	});

	describe('clearFileContent', () => {
		it('should clear content while preserving frontmatter', async () => {
			// Create test file with content
			const testFilePath = path.join(TEST_OUTPUTS_PATH, 'test-clear.md');
			const originalContent = `---
topic: "test-topic"
prompt_version: "1.0.0"
timestamp: "2024-01-15T10:30:00Z"
---

This is some content that should be cleared.

Multiple lines of content here.
`;
			await fs.writeFile(testFilePath, originalContent);

			// Clear the file
			const result = await clearFileContent(testFilePath);

			// Check that clear was successful
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard

			const clearedContent = await fs.readFile(testFilePath, 'utf-8');

			// Should contain frontmatter
			expect(clearedContent).toContain('---');
			expect(clearedContent).toContain('topic: "test-topic"');
			expect(clearedContent).toContain('prompt_version: "1.0.0"');
			expect(clearedContent).toContain('timestamp: "2024-01-15T10:30:00Z"');
			expect(clearedContent).toContain('---');

			// Should not contain the original content
			expect(clearedContent).not.toContain('This is some content');
			expect(clearedContent).not.toContain('Multiple lines');

			// Should have empty body
			const lines = clearedContent.split('\n');
			const frontmatterEnd = lines.findIndex(
				(line, index) => index > 0 && line.startsWith('---'),
			);
			const body = lines
				.slice(frontmatterEnd + 1)
				.join('\n')
				.trim();
			expect(body).toBe('');
		});

		it('should return error for file without frontmatter', async () => {
			// Create test file without frontmatter
			const testFilePath = path.join(TEST_OUTPUTS_PATH, 'no-frontmatter.md');
			await fs.writeFile(testFilePath, 'Just some content without frontmatter');

			const result = await clearFileContent(testFilePath);

			expect(result.isErr()).toBe(true);
			if (result.isOk()) return; // Type guard

			expect(result.error.message).toContain('File format');
		});

		it('should return error for non-existent file', async () => {
			const nonExistentFile = path.join(TEST_OUTPUTS_PATH, 'does-not-exist.md');
			const result = await clearFileContent(nonExistentFile);

			expect(result.isErr()).toBe(true);
			if (result.isOk()) return; // Type guard

			expect(result.error.message).toContain('File not found');
		});
	});

	describe('removeFile', () => {
		it('should remove file completely', async () => {
			// Create test file
			const testFilePath = path.join(TEST_OUTPUTS_PATH, 'test-remove.md');
			await fs.writeFile(testFilePath, 'This file will be removed');

			// Verify file exists
			await expect(fs.access(testFilePath)).resolves.not.toThrow();

			// Remove the file
			const result = await removeFile(testFilePath);

			// Check that removal was successful
			expect(result.isOk()).toBe(true);
			if (result.isErr()) return; // Type guard

			// Verify file no longer exists
			await expect(fs.access(testFilePath)).rejects.toThrow();
		});

		it('should return error for non-existent file', async () => {
			const nonExistentFile = path.join(TEST_OUTPUTS_PATH, 'does-not-exist.md');
			const result = await removeFile(nonExistentFile);

			expect(result.isErr()).toBe(true);
			if (result.isOk()) return; // Type guard

			expect(result.error.message).toContain('File not found');
		});
	});
});
