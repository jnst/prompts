import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { err, ok, type Result } from 'neverthrow';
import {
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
	return new Date().toISOString();
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
