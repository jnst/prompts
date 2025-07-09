import { type Result } from 'neverthrow';
import { TomlEmptyError, TomlEmptyTemplateError, TomlNotFoundError, TomlStructureError, TomlSyntaxError, TomlVersionFormatError } from '../errors/index.js';
export interface PromptTemplate {
    content: string;
    version: string;
    prompts: PromptEntry[];
}
export interface PromptEntry {
    version: string;
    content: string;
    created_at: string;
}
export interface TomlMetadata {
    current_version: string;
    created_at: string;
    updated_at: string;
}
export interface TomlData {
    metadata: TomlMetadata;
    prompts: PromptEntry[];
}
export declare function parsePromptToml(promptPath: string): Promise<Result<PromptTemplate, TomlNotFoundError | TomlEmptyError | TomlSyntaxError | TomlStructureError | TomlEmptyTemplateError | TomlVersionFormatError>>;
export declare function validateTomlStructure(data: unknown): data is TomlData;
