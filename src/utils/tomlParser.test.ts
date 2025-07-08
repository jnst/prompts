import { promises as fs } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { parsePromptToml } from './tomlParser.js';

const TEST_DIR = path.join(process.cwd(), 'test-toml');

describe('tomlParser', () => {
	beforeEach(async () => {
		await fs.mkdir(TEST_DIR, { recursive: true });
	});

	afterEach(async () => {
		try {
			await fs.rm(TEST_DIR, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	});

	describe('parsePromptToml', () => {
		it('should parse valid TOML with new structure', async () => {
			const tomlContent = `
[metadata]
current_version = "1.2.0"
created_at = "2024-01-01"
updated_at = "2024-01-15"

[[prompts]]
version = "1.0.0"
content = "Initial template content"
created_at = "2024-01-01"

[[prompts]]
version = "1.2.0"
content = "Updated template content"
created_at = "2024-01-15"
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), tomlContent);

			const result = await parsePromptToml(TEST_DIR);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toEqual({
					content: 'Updated template content',
					version: '1.2.0',
					prompts: [
						{
							version: '1.0.0',
							content: 'Initial template content',
							created_at: '2024-01-01',
						},
						{
							version: '1.2.0',
							content: 'Updated template content',
							created_at: '2024-01-15',
						},
					],
				});
			}
		});

		it('should parse TOML with multiple prompt versions', async () => {
			const tomlContent = `
[metadata]
current_version = "2.0.0"
created_at = "2024-01-01"
updated_at = "2024-02-01"

[[prompts]]
version = "1.0.0"
content = "First version"
created_at = "2024-01-01"

[[prompts]]
version = "1.5.0"
content = "Second version"
created_at = "2024-01-20"

[[prompts]]
version = "2.0.0"
content = "Latest version"
created_at = "2024-02-01"
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), tomlContent);

			const result = await parsePromptToml(TEST_DIR);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.version).toBe('2.0.0');
				expect(result.value.content).toBe('Latest version');
				expect(result.value.prompts).toHaveLength(3);
			}
		});

		it('should handle Japanese content in prompts', async () => {
			const tomlContent = `
[metadata]
current_version = "1.0.0"
created_at = "2024-01-01"
updated_at = "2024-01-01"

[[prompts]]
version = "1.0.0"
content = "これは日本語のプロンプトです"
created_at = "2024-01-01"
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), tomlContent);

			const result = await parsePromptToml(TEST_DIR);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.content).toBe('これは日本語のプロンプトです');
			}
		});

		it('should throw error when prompt.toml file does not exist', async () => {
			const result = await parsePromptToml(TEST_DIR);
			expect(result.isErr()).toBe(true);
		});

		it('should throw error when TOML is malformed', async () => {
			const invalidToml = `
[metadata]
current_version = "1.0.0
created_at = "2024-01-01"
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), invalidToml);

			const result = await parsePromptToml(TEST_DIR);
			expect(result.isErr()).toBe(true);
		});

		it('should throw error when metadata section is missing', async () => {
			const incompleteToml = `
[[prompts]]
version = "1.0.0"
content = "Test content"
created_at = "2024-01-01"
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), incompleteToml);

			const result = await parsePromptToml(TEST_DIR);
			expect(result.isErr()).toBe(true);
		});

		it('should throw error when prompts array is missing', async () => {
			const incompleteToml = `
[metadata]
current_version = "1.0.0"
created_at = "2024-01-01"
updated_at = "2024-01-01"
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), incompleteToml);

			const result = await parsePromptToml(TEST_DIR);
			expect(result.isErr()).toBe(true);
		});

		it('should throw error when current_version does not exist in prompts', async () => {
			const invalidToml = `
[metadata]
current_version = "2.0.0"
created_at = "2024-01-01"
updated_at = "2024-01-01"

[[prompts]]
version = "1.0.0"
content = "Test content"
created_at = "2024-01-01"
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), invalidToml);

			const result = await parsePromptToml(TEST_DIR);
			expect(result.isErr()).toBe(true);
		});

		it('should handle multi-line prompt content', async () => {
			const tomlContent = `
[metadata]
current_version = "1.0.0"
created_at = "2024-01-01"
updated_at = "2024-01-01"

[[prompts]]
version = "1.0.0"
content = """
This is a multi-line prompt.

It can contain multiple paragraphs
and preserve formatting.
"""
created_at = "2024-01-01"
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), tomlContent);

			const result = await parsePromptToml(TEST_DIR);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.content).toContain('This is a multi-line prompt.');
				expect(result.value.content).toContain(
					'It can contain multiple paragraphs',
				);
			}
		});

		it('should validate version format in all prompts', async () => {
			const invalidToml = `
[metadata]
current_version = "1.0.0"
created_at = "2024-01-01"
updated_at = "2024-01-01"

[[prompts]]
version = "invalid-version"
content = "Test content"
created_at = "2024-01-01"
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), invalidToml);

			const result = await parsePromptToml(TEST_DIR);
			expect(result.isErr()).toBe(true);
		});

		it('should throw error when prompt content is empty', async () => {
			const invalidToml = `
[metadata]
current_version = "1.0.0"
created_at = "2024-01-01"
updated_at = "2024-01-01"

[[prompts]]
version = "1.0.0"
content = ""
created_at = "2024-01-01"
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), invalidToml);

			const result = await parsePromptToml(TEST_DIR);
			expect(result.isErr()).toBe(true);
		});
	});
});
