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
		it('should parse valid TOML with single changelog entry', async () => {
			const tomlContent = `
[prompt]
version = "1.2.0"
template = "Test template content"

[[changelog]]
version = "1.2.0"
date = "2024-01-15"
changes = ["Added new feature", "Fixed bug"]
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), tomlContent);

			const result = await parsePromptToml(TEST_DIR);

			expect(result).toEqual({
				content: 'Test template content',
				version: '1.2.0',
				changelog: [
					{
						version: '1.2.0',
						date: '2024-01-15',
						changes: ['Added new feature', 'Fixed bug'],
					},
				],
			});
		});

		it('should parse TOML with multiple changelog entries and return latest', async () => {
			const tomlContent = `
[prompt]
version = "2.0.0"
template = "Updated template"

[[changelog]]
version = "2.0.0"
date = "2024-02-01"
changes = ["Major update"]

[[changelog]]
version = "1.5.0"
date = "2024-01-20"
changes = ["Minor improvements"]

[[changelog]]
version = "1.0.0"
date = "2024-01-01"
changes = ["Initial version"]
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), tomlContent);

			const result = await parsePromptToml(TEST_DIR);

			expect(result.version).toBe('2.0.0');
			expect(result.changelog).toHaveLength(3);
			expect(result.changelog[0].version).toBe('2.0.0'); // Latest should be first
		});

		it('should handle Japanese content in template and changelog', async () => {
			const tomlContent = `
[prompt]
version = "1.0.0"
template = "これは日本語のテンプレートです"

[[changelog]]
version = "1.0.0"
date = "2024-01-01"
changes = ["初期バージョンを作成", "日本語サポートを追加"]
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), tomlContent);

			const result = await parsePromptToml(TEST_DIR);

			expect(result.content).toBe('これは日本語のテンプレートです');
			expect(result.changelog[0].changes).toContain('初期バージョンを作成');
			expect(result.changelog[0].changes).toContain('日本語サポートを追加');
		});

		it('should throw error when prompt.toml file does not exist', async () => {
			await expect(parsePromptToml(TEST_DIR)).rejects.toThrow();
		});

		it('should throw error when TOML is malformed', async () => {
			const invalidToml = `
version = "1.0.0
template = "Missing quote
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), invalidToml);

			await expect(parsePromptToml(TEST_DIR)).rejects.toThrow();
		});

		it('should throw error when required fields are missing', async () => {
			const incompleteToml = `
[prompt]
version = "1.0.0"
# template field is missing
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), incompleteToml);

			await expect(parsePromptToml(TEST_DIR)).rejects.toThrow(
				'Invalid TOML: missing prompt.template',
			);
		});

		it('should handle TOML without changelog', async () => {
			const tomlWithoutChangelog = `
[prompt]
version = "1.0.0"
template = "Test template"
			`.trim();

			await fs.writeFile(
				path.join(TEST_DIR, 'prompt.toml'),
				tomlWithoutChangelog,
			);

			const result = await parsePromptToml(TEST_DIR);
			expect(result.changelog).toEqual([]);
		});

		it('should handle multi-line template content', async () => {
			const tomlContent = `
[prompt]
version = "1.0.0"
template = """
This is a multi-line template.

It can contain multiple paragraphs
and preserve formatting.
"""

[[changelog]]
version = "1.0.0"
date = "2024-01-01"
changes = ["Initial version with multi-line support"]
			`.trim();

			await fs.writeFile(path.join(TEST_DIR, 'prompt.toml'), tomlContent);

			const result = await parsePromptToml(TEST_DIR);

			expect(result.content).toContain('This is a multi-line template.');
			expect(result.content).toContain('It can contain multiple paragraphs');
		});
	});
});
