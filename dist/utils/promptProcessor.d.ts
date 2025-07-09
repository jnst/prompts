import { type Result } from 'neverthrow';
import { ValidationError } from '../errors/index.js';
export interface TemplateVariables {
    [key: string]: string;
}
export interface ProcessedPrompt {
    content: string;
    variables: string[];
}
/**
 * Extract variables from template content
 * Finds all {{variable}} patterns and returns unique variable names
 */
export declare function extractVariables(template: string): string[];
/**
 * Process template by replacing variables with provided values
 */
export declare function processTemplate(template: string, variables: TemplateVariables): Result<ProcessedPrompt, ValidationError>;
/**
 * Convenience function for single variable replacement (common case)
 */
export declare function processTopicTemplate(template: string, topic: string): Result<ProcessedPrompt, ValidationError>;
