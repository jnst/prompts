import { type Result } from 'neverthrow';
import { ModelEmptyError, ModelRequiredError, ModelValidationError, OutputWriteError, ValidationError } from '../errors/index.js';
export interface OutputMetadata {
    version: string;
    model: string;
    timestamp: string;
}
export declare function generateFrontmatter(metadata: OutputMetadata): string;
export declare function generateTimestamp(): string;
export declare function generateFileName(timestamp: string): string;
export declare function saveOutput(promptPath: string, content: string, metadata: OutputMetadata): Promise<Result<string, ValidationError | ModelRequiredError | ModelEmptyError | ModelValidationError | OutputWriteError>>;
export declare function validateModel(model: string): Result<void, ModelRequiredError | ModelEmptyError | ModelValidationError>;
export declare function normalizeModelName(model: string): string;
