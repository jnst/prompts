import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
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
        return prompts.sort((a, b) => a.name.localeCompare(b.name));
    }
    catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            throw new Error(`Vault directory not found: ${vaultPath}`);
        }
        throw error;
    }
}
export async function validateVaultStructure(vaultPath = 'vault') {
    try {
        const stats = await stat(vaultPath);
        if (!stats.isDirectory()) {
            throw new Error(`${vaultPath} is not a directory`);
        }
    }
    catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            throw new Error(`Vault directory not found: ${vaultPath}`);
        }
        throw error;
    }
}
