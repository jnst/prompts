import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { err, ok, type Result } from 'neverthrow';
import {
	FileFormatError,
	ModelEmptyError,
	ModelRequiredError,
	ModelValidationError,
	OutputWriteError,
	ValidationError,
} from '../errors/index.js';

export interface OutputMetadata {
	version: string;
	model: string;
	timestamp: string;
}

export interface TopicFileMetadata {
	topic: string;
	prompt_version: string;
	timestamp: string;
}

export interface UnfilledFile {
	path: string;
	fileName: string;
	topic: string;
	prompt_version: string;
	timestamp: string;
}

export interface FilledFile {
	path: string;
	fileName: string;
	topic: string;
	prompt_version: string;
	timestamp: string;
}

export interface OutputFile {
	path: string;
	fileName: string;
	hasContent: boolean;
	type: 'topic' | 'other';
	metadata?:
		| {
				topic?: string;
				prompt_version?: string;
				timestamp?: string;
		  }
		| undefined;
}

export function generateFrontmatter(metadata: OutputMetadata): string {
	return `---
version: "${metadata.version}"
model: "${metadata.model}"
timestamp: "${metadata.timestamp}"
---
`;
}

export function generateTopicFrontmatter(metadata: TopicFileMetadata): string {
	return `---
topic: "${metadata.topic}"
prompt_version: "${metadata.prompt_version}"
timestamp: "${metadata.timestamp}"
---
`;
}

export function generateTimestamp(): string {
	return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function generateFileName(timestamp: string): string {
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

export async function saveOutput(
	promptPath: string,
	content: string,
	metadata: OutputMetadata,
): Promise<
	Result<
		string,
		| ValidationError
		| ModelRequiredError
		| ModelEmptyError
		| ModelValidationError
		| OutputWriteError
	>
> {
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
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
			return err(
				new OutputWriteError(
					outputsDir,
					'Permission denied. Please check file permissions',
				),
			);
		}
		if (error instanceof Error && 'code' in error && error.code === 'ENOSPC') {
			return err(
				new OutputWriteError(
					outputsDir,
					'No space left on device. Please free up disk space',
				),
			);
		}
		return err(
			new OutputWriteError(outputsDir, `Failed to save output file: ${error}`),
		);
	}
}

export function validateModel(
	model: string,
): Result<void, ModelRequiredError | ModelEmptyError | ModelValidationError> {
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

export function normalizeModelName(model: string): string {
	const normalizedModel = model.toLowerCase();
	const modelMap: Record<string, string> = {
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
export async function createTopicFile(
	promptPath: string,
	topic: string,
	promptVersion: string,
): Promise<Result<string, ValidationError | OutputWriteError>> {
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
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
			return err(
				new OutputWriteError(
					outputsDir,
					'Permission denied. Please check file permissions',
				),
			);
		}
		if (error instanceof Error && 'code' in error && error.code === 'ENOSPC') {
			return err(
				new OutputWriteError(
					outputsDir,
					'No space left on device. Please free up disk space',
				),
			);
		}
		return err(
			new OutputWriteError(outputsDir, `Failed to create topic file: ${error}`),
		);
	}
}

/**
 * Detect unfilled files in the outputs directory
 * Returns files that have frontmatter but empty body
 */
export async function detectUnfilledFiles(
	promptPath: string,
): Promise<Result<UnfilledFile[], ValidationError | OutputWriteError>> {
	// Validate inputs
	if (!promptPath || typeof promptPath !== 'string') {
		return err(new ValidationError('Prompt path', 'a string'));
	}

	const outputsDir = join(promptPath, 'outputs');
	const unfilledFiles: UnfilledFile[] = [];

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
			const frontmatterEnd = lines.findIndex(
				(line, index) => index > 0 && line.startsWith('---'),
			);

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
				const promptVersionMatch = frontmatter.find((line) =>
					line.startsWith('prompt_version:'),
				);
				const timestampMatch = frontmatter.find((line) =>
					line.startsWith('timestamp:'),
				);

				const prompt_version =
					promptVersionMatch?.split(':')[1]?.trim().replace(/"/g, '') || '';
				const timestamp =
					timestampMatch?.split(':')[1]?.trim().replace(/"/g, '') || '';

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
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			// outputs directory doesn't exist, return empty array
			return ok([]);
		}
		return err(
			new OutputWriteError(
				outputsDir,
				`Failed to scan unfilled files: ${error}`,
			),
		);
	}
}

/**
 * Update a file by appending content to its body
 */
export async function updateFileContent(
	filePath: string,
	content: string,
): Promise<Result<string, ValidationError | OutputWriteError>> {
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
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
			return err(
				new OutputWriteError(
					filePath,
					'Permission denied. Please check file permissions',
				),
			);
		}
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			return err(
				new OutputWriteError(
					filePath,
					'File not found. Please check the file path',
				),
			);
		}
		return err(
			new OutputWriteError(filePath, `Failed to update file: ${error}`),
		);
	}
}

/**
 * Detect all output files in the outputs directory
 * Returns all .md files with their content status
 */
export async function detectAllOutputFiles(
	promptPath: string,
): Promise<Result<OutputFile[], ValidationError | OutputWriteError>> {
	// Validate inputs
	if (!promptPath || typeof promptPath !== 'string') {
		return err(new ValidationError('Prompt path', 'a string'));
	}

	const outputsDir = join(promptPath, 'outputs');
	const outputFiles: OutputFile[] = [];

	try {
		// Read all files in outputs directory
		const files = await readdir(outputsDir);
		const mdFiles = files.filter((file) => file.endsWith('.md'));

		for (const fileName of mdFiles) {
			const filePath = join(outputsDir, fileName);
			const content = await readFile(filePath, 'utf-8');
			const lines = content.split('\n');

			// Basic content check
			const hasContent = content.trim().length > 0;

			// Check if it has any frontmatter structure
			let type: 'topic' | 'other' = 'other';
			let metadata: OutputFile['metadata'];

			if (lines.length >= 4 && lines[0] && lines[0].startsWith('---')) {
				// Find the end of frontmatter
				const frontmatterEnd = lines.findIndex(
					(line, index) => index > 0 && line.startsWith('---'),
				);

				if (frontmatterEnd !== -1) {
					// Extract frontmatter
					const frontmatter = lines.slice(1, frontmatterEnd);
					const body = lines
						.slice(frontmatterEnd + 1)
						.join('\n')
						.trim();

					// Check if it's a topic file (has topic field in frontmatter)
					const topicMatch = frontmatter.find((line) =>
						line.startsWith('topic:'),
					);
					if (topicMatch) {
						type = 'topic';
						const topic =
							topicMatch.split(':')[1]?.trim().replace(/"/g, '') || '';
						const promptVersionMatch = frontmatter.find((line) =>
							line.startsWith('prompt_version:'),
						);
						const timestampMatch = frontmatter.find((line) =>
							line.startsWith('timestamp:'),
						);

						const prompt_version =
							promptVersionMatch?.split(':')[1]?.trim().replace(/"/g, '') || '';
						const timestamp =
							timestampMatch?.split(':')[1]?.trim().replace(/"/g, '') || '';

						metadata = { topic, prompt_version, timestamp };
					}

					// Update hasContent based on body
					const bodyHasContent = body !== '';
					outputFiles.push({
						path: filePath,
						fileName,
						hasContent: bodyHasContent,
						type,
						metadata,
					});
				} else {
					// File with malformed frontmatter, treat as other file
					outputFiles.push({
						path: filePath,
						fileName,
						hasContent,
						type: 'other',
						metadata,
					});
				}
			} else {
				// File without frontmatter structure
				outputFiles.push({
					path: filePath,
					fileName,
					hasContent,
					type: 'other',
					metadata,
				});
			}
		}

		return ok(outputFiles);
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			// outputs directory doesn't exist, return empty array
			return ok([]);
		}
		return err(
			new OutputWriteError(outputsDir, `Failed to scan output files: ${error}`),
		);
	}
}

/**
 * Detect filled files in the outputs directory
 * Returns files that have frontmatter and non-empty body
 */
export async function detectFilledFiles(
	promptPath: string,
): Promise<Result<FilledFile[], ValidationError | OutputWriteError>> {
	// Validate inputs
	if (!promptPath || typeof promptPath !== 'string') {
		return err(new ValidationError('Prompt path', 'a string'));
	}

	const outputsDir = join(promptPath, 'outputs');
	const filledFiles: FilledFile[] = [];

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
			const frontmatterEnd = lines.findIndex(
				(line, index) => index > 0 && line.startsWith('---'),
			);

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

			// Check if body has content (not empty)
			if (body !== '') {
				// Parse frontmatter to extract metadata
				const topic = topicMatch.split(':')[1]?.trim().replace(/"/g, '') || '';
				const promptVersionMatch = frontmatter.find((line) =>
					line.startsWith('prompt_version:'),
				);
				const timestampMatch = frontmatter.find((line) =>
					line.startsWith('timestamp:'),
				);

				const prompt_version =
					promptVersionMatch?.split(':')[1]?.trim().replace(/"/g, '') || '';
				const timestamp =
					timestampMatch?.split(':')[1]?.trim().replace(/"/g, '') || '';

				filledFiles.push({
					path: filePath,
					fileName,
					topic,
					prompt_version,
					timestamp,
				});
			}
		}

		return ok(filledFiles);
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			// outputs directory doesn't exist, return empty array
			return ok([]);
		}
		return err(
			new OutputWriteError(outputsDir, `Failed to scan filled files: ${error}`),
		);
	}
}

/**
 * Clear file content while preserving frontmatter (if exists)
 */
export async function clearFileContent(
	filePath: string,
): Promise<
	Result<string, ValidationError | OutputWriteError | FileFormatError>
> {
	// Validate inputs
	if (!filePath || typeof filePath !== 'string') {
		return err(new ValidationError('File path', 'a string'));
	}

	try {
		// Read existing file
		const content = await readFile(filePath, 'utf-8');
		const lines = content.split('\n');

		// Check if file has frontmatter
		if (lines.length >= 4 && lines[0] && lines[0].startsWith('---')) {
			// Find the end of frontmatter
			const frontmatterEnd = lines.findIndex(
				(line, index) => index > 0 && line.startsWith('---'),
			);

			if (frontmatterEnd !== -1) {
				// Keep frontmatter, clear body
				const frontmatterLines = lines.slice(0, frontmatterEnd + 1);
				const clearedContent = `${frontmatterLines.join('\n')}\n\n`;

				// Write cleared content back to file
				await writeFile(filePath, clearedContent, 'utf-8');
			} else {
				// File has malformed frontmatter, clear entire file
				await writeFile(filePath, '', 'utf-8');
			}
		} else {
			// File has no frontmatter, return error
			return err(new FileFormatError(filePath));
		}

		return ok(filePath);
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
			return err(
				new OutputWriteError(
					filePath,
					'Permission denied. Please check file permissions',
				),
			);
		}
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			return err(
				new OutputWriteError(
					filePath,
					'File not found. Please check the file path',
				),
			);
		}
		return err(
			new OutputWriteError(filePath, `Failed to clear file: ${error}`),
		);
	}
}

/**
 * Remove file completely
 */
export async function removeFile(
	filePath: string,
): Promise<Result<string, ValidationError | OutputWriteError>> {
	// Validate inputs
	if (!filePath || typeof filePath !== 'string') {
		return err(new ValidationError('File path', 'a string'));
	}

	try {
		// Delete the file
		await unlink(filePath);
		return ok(filePath);
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
			return err(
				new OutputWriteError(
					filePath,
					'Permission denied. Please check file permissions',
				),
			);
		}
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
			return err(
				new OutputWriteError(
					filePath,
					'File not found. Please check the file path',
				),
			);
		}
		return err(
			new OutputWriteError(filePath, `Failed to remove file: ${error}`),
		);
	}
}
