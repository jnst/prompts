import { type Result } from 'neverthrow';
import { FileFormatError, ModelEmptyError, ModelRequiredError, ModelValidationError, OutputWriteError, ValidationError } from '../errors/index.js';
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
    metadata?: {
        topic?: string;
        prompt_version?: string;
        timestamp?: string;
    } | undefined;
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
/**
 * Detect all output files in the outputs directory
 * Returns all .md files with their content status
 */
export declare function detectAllOutputFiles(promptPath: string): Promise<Result<OutputFile[], ValidationError | OutputWriteError>>;
/**
 * Detect filled files in the outputs directory
 * Returns files that have frontmatter and non-empty body
 */
export declare function detectFilledFiles(promptPath: string): Promise<Result<FilledFile[], ValidationError | OutputWriteError>>;
/**
 * Clear file content while preserving frontmatter (if exists)
 */
export declare function clearFileContent(filePath: string): Promise<Result<string, ValidationError | OutputWriteError | FileFormatError>>;
/**
 * Remove file completely
 */
export declare function removeFile(filePath: string): Promise<Result<string, ValidationError | OutputWriteError>>;
