import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
export function generateFrontmatter(metadata) {
    return `---
version: "${metadata.version}"
model: "${metadata.model}"
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
    const outputsDir = join(promptPath, 'outputs');
    const timestamp = generateTimestamp();
    const fileName = generateFileName(timestamp);
    const filePath = join(outputsDir, fileName);
    // Update metadata with generated timestamp
    const updatedMetadata = { ...metadata, timestamp };
    const frontmatter = generateFrontmatter(updatedMetadata);
    const fileContent = `${frontmatter}\n${content}\n`;
    try {
        // Ensure outputs directory exists
        await mkdir(outputsDir, { recursive: true });
        // Write the file
        await writeFile(filePath, fileContent, 'utf-8');
        return filePath;
    }
    catch (error) {
        throw new Error(`Failed to save output file: ${error}`);
    }
}
export function validateModel(model) {
    const validModels = ['claude-sonnet-4', 'claude-opus-4'];
    return validModels.includes(model);
}
export function normalizeModelName(model) {
    const modelMap = {
        sonnet4: 'claude-sonnet-4',
        opus4: 'claude-opus-4',
        'claude-sonnet-4': 'claude-sonnet-4',
        'claude-opus-4': 'claude-opus-4',
    };
    return modelMap[model] || 'claude-sonnet-4';
}
