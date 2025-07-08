import { type Result } from 'neverthrow';
import { TomlChangelogError, TomlEmptyError, TomlEmptyTemplateError, TomlNotFoundError, TomlStructureError, TomlSyntaxError, TomlVersionFormatError } from '../errors/index.js';
export interface PromptTemplate {
    content: string;
    version: string;
    changelog: ChangelogEntry[];
}
export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}
export interface TomlData {
    prompt: {
        template: string;
        version: string;
    };
    changelog: ChangelogEntry[];
}
export declare function parsePromptToml(promptPath: string): Promise<Result<PromptTemplate, TomlNotFoundError | TomlEmptyError | TomlSyntaxError | TomlStructureError | TomlEmptyTemplateError | TomlVersionFormatError | TomlChangelogError>>;
export declare function validateTomlStructure(data: unknown): data is TomlData;
