import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { err, ok } from 'neverthrow';
import { VaultAccessError, VaultEmptyWarning, VaultNotDirectoryError, VaultNotFoundError, } from '../errors/index.js';
export async function scanVaultDirectory(vaultPath = 'vault') {
    try {
        const entries = await readdir(vaultPath, { withFileTypes: true });
        const prompts = [];
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const promptPath = join(vaultPath, entry.name);
                const tomlPath = join(promptPath, 'prompt.toml');
                let hasToml = false;
                try {
                    const stats = await stat(tomlPath);
                    hasToml = stats.isFile();
                }
                catch {
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
    }
    catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return err(new VaultNotFoundError(vaultPath));
        }
        return err(new VaultNotFoundError(vaultPath));
    }
}
export async function validateVaultStructure(vaultPath = 'vault') {
    try {
        const stats = await stat(vaultPath);
        if (!stats.isDirectory()) {
            return err(new VaultNotDirectoryError(vaultPath));
        }
        // Check if vault directory is readable
        try {
            await readdir(vaultPath);
        }
        catch {
            return err(new VaultAccessError(vaultPath));
        }
        // Check if vault has any subdirectories
        const entries = await readdir(vaultPath, { withFileTypes: true });
        const hasDirectories = entries.some((entry) => entry.isDirectory());
        const warnings = [];
        if (!hasDirectories) {
            warnings.push(new VaultEmptyWarning(vaultPath));
        }
        return ok(warnings);
    }
    catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return err(new VaultNotFoundError(vaultPath));
        }
        return err(new VaultNotFoundError(vaultPath));
    }
}
