import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'smol-toml';
export async function parsePromptToml(promptPath) {
    const tomlPath = join(promptPath, 'prompt.toml');
    try {
        const content = await readFile(tomlPath, 'utf-8');
        const data = parse(content);
        if (!data.prompt?.template) {
            throw new Error('Invalid TOML: missing prompt.template');
        }
        if (!data.prompt?.version) {
            throw new Error('Invalid TOML: missing prompt.version');
        }
        // Get latest version from changelog (array index 0)
        const latestVersion = data.changelog?.[0]?.version || data.prompt.version;
        return {
            content: data.prompt.template,
            version: latestVersion,
            changelog: data.changelog || [],
        };
    }
    catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            throw new Error(`prompt.toml not found in: ${promptPath}`);
        }
        throw error;
    }
}
export function validateTomlStructure(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }
    // Use explicit interface to avoid index signature issues
    const obj = data;
    // Check prompt section
    if (!obj.prompt || typeof obj.prompt !== 'object') {
        return false;
    }
    const prompt = obj.prompt;
    if (typeof prompt.template !== 'string' ||
        typeof prompt.version !== 'string') {
        return false;
    }
    // Changelog is optional
    if (obj.changelog && !Array.isArray(obj.changelog)) {
        return false;
    }
    return true;
}
