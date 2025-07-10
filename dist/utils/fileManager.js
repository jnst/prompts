import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { err, ok } from 'neverthrow';
import { ModelEmptyError, ModelRequiredError, ModelValidationError, OutputWriteError, ValidationError, } from '../errors/index.js';
export function generateFrontmatter(metadata) {
    return `---
version: "${metadata.version}"
model: "${metadata.model}"
timestamp: "${metadata.timestamp}"
---
`;
}
export function generateTopicFrontmatter(metadata) {
    return `---
topic: "${metadata.topic}"
prompt_version: "${metadata.prompt_version}"
timestamp: "${metadata.timestamp}"
---
`;
}
export function generateTimestamp() {
    return new Date().toISOString();
}
export function generateFileName(timestamp) {
    // Convert ISO timestamp to filename-safe format
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}.md`;
}
export async function saveOutput(promptPath, content, metadata) {
    // Validate inputs
    if (!promptPath || typeof promptPath !== 'string') {
        return err(new ValidationError('Prompt path', 'a string'));
    }
    if (!content || typeof content !== 'string') {
        return err(new ValidationError('Content', 'a string'));
    }
    if (!metadata || typeof metadata !== 'object') {
        return err(new ValidationError('Metadata', 'an object'));
    }
    // Validate model name
    const modelValidation = validateModel(metadata.model);
    if (modelValidation.isErr()) {
        return err(modelValidation.error);
    }
    // Validate version format
    if (!metadata.version || typeof metadata.version !== 'string') {
        return err(new ValidationError('Version', 'a string'));
    }
    const outputsDir = join(promptPath, 'outputs');
    // Use provided timestamp or generate new one
    const finalTimestamp = metadata.timestamp || generateTimestamp();
    const fileName = generateFileName(finalTimestamp);
    const filePath = join(outputsDir, fileName);
    // Update metadata with final timestamp
    const updatedMetadata = { ...metadata, timestamp: finalTimestamp };
    const frontmatter = generateFrontmatter(updatedMetadata);
    const fileContent = `${frontmatter}\n${content}\n`;
    try {
        // Ensure outputs directory exists
        await mkdir(outputsDir, { recursive: true });
        // Write the file
        await writeFile(filePath, fileContent, 'utf-8');
        return ok(filePath);
    }
    catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
            return err(new OutputWriteError(outputsDir, 'Permission denied. Please check file permissions'));
        }
        if (error instanceof Error && 'code' in error && error.code === 'ENOSPC') {
            return err(new OutputWriteError(outputsDir, 'No space left on device. Please free up disk space'));
        }
        return err(new OutputWriteError(outputsDir, `Failed to save output file: ${error}`));
    }
}
export function validateModel(model) {
    if (!model || typeof model !== 'string') {
        return err(new ModelRequiredError());
    }
    const trimmedModel = model.trim();
    if (trimmedModel.length === 0) {
        return err(new ModelEmptyError());
    }
    const validModels = ['claude-sonnet-4', 'claude-opus-4'];
    if (!validModels.includes(trimmedModel)) {
        return err(new ModelValidationError(trimmedModel, validModels));
    }
    return ok(undefined);
}
export function normalizeModelName(model) {
    const normalizedModel = model.toLowerCase();
    const modelMap = {
        sonnet4: 'claude-sonnet-4',
        opus4: 'claude-opus-4',
        'claude-sonnet-4': 'claude-sonnet-4',
        'claude-opus-4': 'claude-opus-4',
    };
    return modelMap[normalizedModel] || model;
}
/**
 * Create topic file for create action
 * Generates a file with frontmatter but empty body for user to fill
 */
export async function createTopicFile(promptPath, topic, promptVersion) {
    // Validate inputs
    if (!promptPath || typeof promptPath !== 'string') {
        return err(new ValidationError('Prompt path', 'a string'));
    }
    if (!topic || typeof topic !== 'string') {
        return err(new ValidationError('Topic', 'a string'));
    }
    if (!promptVersion || typeof promptVersion !== 'string') {
        return err(new ValidationError('Prompt version', 'a string'));
    }
    const outputsDir = join(promptPath, 'outputs');
    const timestamp = generateTimestamp();
    // Generate filename based on topic
    const sanitizedTopic = topic.replace(/[<>:"/\\|?*]/g, '_'); // Sanitize for filename
    const fileName = `${sanitizedTopic}.md`;
    const filePath = join(outputsDir, fileName);
    const frontmatter = generateTopicFrontmatter({
        topic,
        prompt_version: promptVersion,
        timestamp,
    });
    // Create file with frontmatter and empty body
    const fileContent = `${frontmatter}\n`;
    try {
        // Ensure outputs directory exists
        await mkdir(outputsDir, { recursive: true });
        // Write the file
        await writeFile(filePath, fileContent, 'utf-8');
        return ok(filePath);
    }
    catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
            return err(new OutputWriteError(outputsDir, 'Permission denied. Please check file permissions'));
        }
        if (error instanceof Error && 'code' in error && error.code === 'ENOSPC') {
            return err(new OutputWriteError(outputsDir, 'No space left on device. Please free up disk space'));
        }
        return err(new OutputWriteError(outputsDir, `Failed to create topic file: ${error}`));
    }
}
/**
 * Detect unfilled files in the outputs directory
 * Returns files that have frontmatter but empty body
 */
export async function detectUnfilledFiles(promptPath) {
    // Validate inputs
    if (!promptPath || typeof promptPath !== 'string') {
        return err(new ValidationError('Prompt path', 'a string'));
    }
    const outputsDir = join(promptPath, 'outputs');
    const unfilledFiles = [];
    try {
        // Read all files in outputs directory
        const files = await readdir(outputsDir);
        const mdFiles = files.filter((file) => file.endsWith('.md'));
        for (const fileName of mdFiles) {
            const filePath = join(outputsDir, fileName);
            const content = await readFile(filePath, 'utf-8');
            // Check if file has frontmatter with topic (indicating a topic file)
            const lines = content.split('\n');
            if (lines.length < 4 || !lines[0] || !lines[0].startsWith('---')) {
                continue; // Skip files without frontmatter
            }
            // Find the end of frontmatter
            const frontmatterEnd = lines.findIndex((line, index) => index > 0 && line.startsWith('---'));
            if (frontmatterEnd === -1) {
                continue; // Skip files with malformed frontmatter
            }
            // Extract frontmatter
            const frontmatter = lines.slice(1, frontmatterEnd);
            const body = lines
                .slice(frontmatterEnd + 1)
                .join('\n')
                .trim();
            // Check if it's a topic file (has topic field in frontmatter)
            const topicMatch = frontmatter.find((line) => line.startsWith('topic:'));
            if (!topicMatch) {
                continue; // Skip non-topic files
            }
            // Check if body is empty (only contains whitespace)
            if (body === '') {
                // Parse frontmatter to extract metadata
                const topic = topicMatch.split(':')[1]?.trim().replace(/"/g, '') || '';
                const promptVersionMatch = frontmatter.find((line) => line.startsWith('prompt_version:'));
                const timestampMatch = frontmatter.find((line) => line.startsWith('timestamp:'));
                const prompt_version = promptVersionMatch?.split(':')[1]?.trim().replace(/"/g, '') || '';
                const timestamp = timestampMatch?.split(':')[1]?.trim().replace(/"/g, '') || '';
                unfilledFiles.push({
                    path: filePath,
                    fileName,
                    topic,
                    prompt_version,
                    timestamp,
                });
            }
        }
        return ok(unfilledFiles);
    }
    catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            // outputs directory doesn't exist, return empty array
            return ok([]);
        }
        return err(new OutputWriteError(outputsDir, `Failed to scan unfilled files: ${error}`));
    }
}
/**
 * Update a file by appending content to its body
 */
export async function updateFileContent(filePath, content) {
    // Validate inputs
    if (!filePath || typeof filePath !== 'string') {
        return err(new ValidationError('File path', 'a string'));
    }
    if (!content || typeof content !== 'string') {
        return err(new ValidationError('Content', 'a string'));
    }
    try {
        // Read existing file
        const existingContent = await readFile(filePath, 'utf-8');
        // Append new content to the file
        const updatedContent = existingContent + content;
        // Write updated content back to file
        await writeFile(filePath, updatedContent, 'utf-8');
        return ok(filePath);
    }
    catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
            return err(new OutputWriteError(filePath, 'Permission denied. Please check file permissions'));
        }
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return err(new OutputWriteError(filePath, 'File not found. Please check the file path'));
        }
        return err(new OutputWriteError(filePath, `Failed to update file: ${error}`));
    }
}
