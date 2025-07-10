import { type Result } from 'neverthrow';
import { ModelEmptyError, ModelRequiredError, ModelValidationError, OutputWriteError, ValidationError } from '../errors/index.js';
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
export declare function generateFrontmatter(metadata: OutputMetadata): string;
export declare function generateTopicFrontmatter(metadata: TopicFileMetadata): string;
export declare function generateTimestamp(): string;
export declare function generateFileName(timestamp: string): string;
export declare function saveOutput(promptPath: string, content: string, metadata: OutputMetadata): Promise<Result<string, ValidationError | ModelRequiredError | ModelEmptyError | ModelValidationError | OutputWriteError>>;
export declare function validateModel(model: string): Result<void, ModelRequiredError | ModelEmptyError | ModelValidationError>;
export declare function normalizeModelName(model: string): string;
/**
 * Create topic file for create action
 * Generates a file with frontmatter but empty body for user to fill
 */
export declare function createTopicFile(promptPath: string, topic: string, promptVersion: string): Promise<Result<string, ValidationError | OutputWriteError>>;
/**
 * Detect unfilled files in the outputs directory
 * Returns files that have frontmatter but empty body
 */
export declare function detectUnfilledFiles(promptPath: string): Promise<Result<UnfilledFile[], ValidationError | OutputWriteError>>;
/**
 * Update a file by appending content to its body
 */
export declare function updateFileContent(filePath: string, content: string): Promise<Result<string, ValidationError | OutputWriteError>>;
