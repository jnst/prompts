import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { err, ok, type Result } from 'neverthrow';
import {
	type PromptsWarning,
	VaultAccessError,
	VaultEmptyWarning,
	VaultNotDirectoryError,
	VaultNotFoundError,
} from '../errors/index.js';

export interface PromptInfo {
	name: string;
	path: string;
	hasToml: boolean;
}

export async function scanVaultDirectory(
	vaultPath = 'vault',
): Promise<Result<PromptInfo[], VaultNotFoundError>> {
	try {
		const entries = await readdir(vaultPath, { withFileTypes: true });
		const prompts: PromptInfo[] = [];

		for (const entry of entries) {
			if (entry.isDirectory()) {
				const promptPath = join(vaultPath, entry.name);
				const tomlPath = join(promptPath, 'prompt.toml');

				let hasToml = false;
				try {
					const stats = await stat(tomlPath);
					hasToml = stats.isFile();
				} catch {
					// File doesn't exist, hasToml remains false
				}

				prompts.push({
					name: entry.name,
					path: promptPath,
					hasToml,
				});
			}
		}

		return ok(prompts.sort((a, b) => a.name.localeCompare(b.name)));
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			return err(new VaultNotFoundError(vaultPath));
		}
		return err(new VaultNotFoundError(vaultPath));
	}
}

export async function validateVaultStructure(
	vaultPath = 'vault',
): Promise<
	Result<
		PromptsWarning[],
		VaultNotFoundError | VaultAccessError | VaultNotDirectoryError
	>
> {
	try {
		const stats = await stat(vaultPath);
		if (!stats.isDirectory()) {
			return err(new VaultNotDirectoryError(vaultPath));
		}

		// Check if vault directory is readable
		try {
			await readdir(vaultPath);
		} catch {
			return err(new VaultAccessError(vaultPath));
		}

		// Check if vault has any subdirectories
		const entries = await readdir(vaultPath, { withFileTypes: true });
		const hasDirectories = entries.some((entry) => entry.isDirectory());

		const warnings: PromptsWarning[] = [];
		if (!hasDirectories) {
			warnings.push(new VaultEmptyWarning(vaultPath));
		}

		return ok(warnings);
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			return err(new VaultNotFoundError(vaultPath));
		}
		return err(new VaultNotFoundError(vaultPath));
	}
}
