import { promises as fs } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	type PromptInfo,
	scanVaultDirectory,
	validateVaultStructure,
} from './promptManager.js';

const TEST_VAULT_PATH = path.join(process.cwd(), 'test-vault');

describe('promptManager', () => {
	beforeEach(async () => {
		// Create test vault structure
		await fs.mkdir(TEST_VAULT_PATH, { recursive: true });
	});

	afterEach(async () => {
		// Clean up test vault
		try {
			await fs.rm(TEST_VAULT_PATH, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	});

	describe('validateVaultStructure', () => {
		it('should pass when vault directory exists', async () => {
			const result = await validateVaultStructure(TEST_VAULT_PATH);
			expect(result.isOk()).toBe(true);
		});

		it('should return error when vault directory does not exist', async () => {
			const nonExistentPath = path.join(process.cwd(), 'non-existent-vault');
			const result = await validateVaultStructure(nonExistentPath);
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.message).toContain('Vault directory not found:');
			}
		});

		it('should return error when path is not a directory', async () => {
			const filePath = path.join(TEST_VAULT_PATH, 'not-a-directory.txt');
			await fs.writeFile(filePath, 'test content');

			const result = await validateVaultStructure(filePath);
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.message).toContain('is not a directory');
			}
		});
	});

	describe('scanVaultDirectory', () => {
		it('should return empty array when vault is empty', async () => {
			const result = await scanVaultDirectory(TEST_VAULT_PATH);
			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toEqual([]);
			}
		});

		it('should find prompts with prompt.toml files', async () => {
			// Create test prompt directory with toml file
			const promptDir = path.join(TEST_VAULT_PATH, 'test-prompt');
			await fs.mkdir(promptDir, { recursive: true });
			await fs.writeFile(
				path.join(promptDir, 'prompt.toml'),
				`
version = "1.0.0"
template = "Test template"

[[changelog]]
version = "1.0.0"
date = "2024-01-01"
changes = ["Initial version"]
				`.trim(),
			);

			const result = await scanVaultDirectory(TEST_VAULT_PATH);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toHaveLength(1);
				expect(result.value[0]).toEqual({
					name: 'test-prompt',
					path: promptDir,
					hasToml: true,
				} satisfies PromptInfo);
			}
		});

		it('should find prompts without prompt.toml files', async () => {
			// Create test prompt directory without toml file
			const promptDir = path.join(TEST_VAULT_PATH, 'no-toml-prompt');
			await fs.mkdir(promptDir, { recursive: true });
			await fs.writeFile(path.join(promptDir, 'readme.txt'), 'some content');

			const result = await scanVaultDirectory(TEST_VAULT_PATH);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toHaveLength(1);
				expect(result.value[0]).toEqual({
					name: 'no-toml-prompt',
					path: promptDir,
					hasToml: false,
				} satisfies PromptInfo);
			}
		});

		it('should handle Japanese directory names', async () => {
			// Create test prompt directory with Japanese name
			const promptDir = path.join(TEST_VAULT_PATH, '概念理解テスト');
			await fs.mkdir(promptDir, { recursive: true });
			await fs.writeFile(
				path.join(promptDir, 'prompt.toml'),
				'version = "1.0.0"\ntemplate = "テスト"',
			);

			const result = await scanVaultDirectory(TEST_VAULT_PATH);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toHaveLength(1);
				expect(result.value[0].name).toBe('概念理解テスト');
				expect(result.value[0].hasToml).toBe(true);
			}
		});

		it('should ignore files in vault root', async () => {
			// Create a file in vault root
			await fs.writeFile(
				path.join(TEST_VAULT_PATH, 'readme.md'),
				'vault readme',
			);

			// Create a proper prompt directory
			const promptDir = path.join(TEST_VAULT_PATH, 'valid-prompt');
			await fs.mkdir(promptDir, { recursive: true });

			const result = await scanVaultDirectory(TEST_VAULT_PATH);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toHaveLength(1);
				expect(result.value[0].name).toBe('valid-prompt');
			}
		});

		it('should sort results by name', async () => {
			// Create multiple prompt directories
			const prompts = ['zebra-prompt', 'alpha-prompt', 'beta-prompt'];

			for (const promptName of prompts) {
				const promptDir = path.join(TEST_VAULT_PATH, promptName);
				await fs.mkdir(promptDir, { recursive: true });
			}

			const result = await scanVaultDirectory(TEST_VAULT_PATH);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.map((p) => p.name)).toEqual([
					'alpha-prompt',
					'beta-prompt',
					'zebra-prompt',
				]);
			}
		});
	});
});
