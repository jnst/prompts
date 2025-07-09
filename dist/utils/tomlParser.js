import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { err, ok } from 'neverthrow';
import { parse } from 'smol-toml';
import { TomlEmptyError, TomlEmptyTemplateError, TomlNotFoundError, TomlStructureError, TomlSyntaxError, TomlVersionFormatError, } from '../errors/index.js';
export async function parsePromptToml(promptPath) {
    const tomlPath = join(promptPath, 'prompt.toml');
    try {
        const content = await readFile(tomlPath, 'utf-8');
        // Check for empty file
        if (content.trim().length === 0) {
            return err(new TomlEmptyError(promptPath));
        }
        let data;
        try {
            data = parse(content);
        }
        catch (parseError) {
            const errorMessage = parseError instanceof Error ? parseError.message : 'Parse error';
            return err(new TomlSyntaxError(tomlPath, errorMessage));
        }
        // Use validation function for comprehensive checking
        if (!validateTomlStructure(data)) {
            return err(new TomlStructureError(tomlPath));
        }
        const tomlData = data;
        // Validate version format (basic semver check)
        const versionRegex = /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/;
        if (!versionRegex.test(tomlData.metadata.current_version)) {
            return err(new TomlVersionFormatError(tomlPath));
        }
        // Validate prompts array
        if (!tomlData.prompts || tomlData.prompts.length === 0) {
            return err(new TomlStructureError(tomlPath));
        }
        // Validate each prompt entry
        for (const entry of tomlData.prompts) {
            if (!entry.version || !entry.content || !entry.created_at) {
                return err(new TomlStructureError(tomlPath));
            }
            if (!versionRegex.test(entry.version)) {
                return err(new TomlVersionFormatError(tomlPath));
            }
            if (entry.content.trim().length === 0) {
                return err(new TomlEmptyTemplateError(tomlPath));
            }
        }
        // Validate current_version exists in prompts
        const currentVersionExists = tomlData.prompts.some((p) => p.version === tomlData.metadata.current_version);
        if (!currentVersionExists) {
            return err(new TomlStructureError(tomlPath));
        }
        // Get current version content
        const currentPrompt = tomlData.prompts.find((p) => p.version === tomlData.metadata.current_version);
        return ok({
            content: currentPrompt.content,
            version: tomlData.metadata.current_version,
            prompts: tomlData.prompts,
        });
    }
    catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return err(new TomlNotFoundError(promptPath));
        }
        return err(new TomlNotFoundError(promptPath));
    }
}
export function validateTomlStructure(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }
    // Use explicit interface to avoid index signature issues
    const obj = data;
    // Check metadata section
    if (!obj.metadata || typeof obj.metadata !== 'object') {
        return false;
    }
    const metadata = obj.metadata;
    if (typeof metadata.current_version !== 'string' ||
        typeof metadata.created_at !== 'string' ||
        typeof metadata.updated_at !== 'string') {
        return false;
    }
    // Check prompts array
    if (!obj.prompts || !Array.isArray(obj.prompts)) {
        return false;
    }
    // Validate each prompt entry
    for (const prompt of obj.prompts) {
        if (!prompt || typeof prompt !== 'object') {
            return false;
        }
        const entry = prompt;
        if (typeof entry.version !== 'string' ||
            typeof entry.content !== 'string' ||
            typeof entry.created_at !== 'string') {
            return false;
        }
    }
    return true;
}
