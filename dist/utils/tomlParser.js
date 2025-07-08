import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { err, ok } from 'neverthrow';
import { parse } from 'smol-toml';
import { TomlChangelogError, TomlEmptyError, TomlEmptyTemplateError, TomlNotFoundError, TomlStructureError, TomlSyntaxError, TomlVersionFormatError, } from '../errors/index.js';
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
        // Validate template content
        if (tomlData.prompt.template.trim().length === 0) {
            return err(new TomlEmptyTemplateError(tomlPath));
        }
        // Validate version format (basic semver check)
        const versionRegex = /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/;
        if (!versionRegex.test(tomlData.prompt.version)) {
            return err(new TomlVersionFormatError(tomlPath));
        }
        // Validate changelog if present
        if (tomlData.changelog && tomlData.changelog.length > 0) {
            for (const [index, entry] of tomlData.changelog.entries()) {
                if (!entry.version || !entry.date || !entry.changes) {
                    return err(new TomlChangelogError(tomlPath, index + 1, 'Required: version, date, and changes fields'));
                }
                if (!Array.isArray(entry.changes) || entry.changes.length === 0) {
                    return err(new TomlChangelogError(tomlPath, index + 1, 'Must have non-empty changes array'));
                }
            }
        }
        // Get latest version from changelog (array index 0)
        const latestVersion = tomlData.changelog?.[0]?.version || tomlData.prompt.version;
        return ok({
            content: tomlData.prompt.template,
            version: latestVersion,
            changelog: tomlData.changelog || [],
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
