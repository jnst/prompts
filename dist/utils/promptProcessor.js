import { err, ok } from 'neverthrow';
import { ValidationError } from '../errors/index.js';
/**
 * Extract variables from template content
 * Finds all {{variable}} patterns and returns unique variable names
 */
export function extractVariables(template) {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables = new Set();
    for (const match of template.matchAll(variableRegex)) {
        const variableName = match[1]?.trim();
        if (variableName) {
            variables.add(variableName);
        }
    }
    return Array.from(variables);
}
/**
 * Process template by replacing variables with provided values
 */
export function processTemplate(template, variables) {
    if (!template || typeof template !== 'string') {
        return err(new ValidationError('Template', 'a non-empty string'));
    }
    if (!variables || typeof variables !== 'object') {
        return err(new ValidationError('Variables', 'an object'));
    }
    // Extract all variables from template
    const extractedVariables = extractVariables(template);
    // Check if all required variables are provided
    const missingVariables = extractedVariables.filter((variable) => !(variable in variables));
    if (missingVariables.length > 0) {
        return err(new ValidationError(`Missing variables: ${missingVariables.join(', ')}`, 'provided in variables object'));
    }
    // Replace all variables in template
    let processedContent = template;
    for (const [key, value] of Object.entries(variables)) {
        const variablePattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        processedContent = processedContent.replace(variablePattern, value);
    }
    return ok({
        content: processedContent,
        variables: extractedVariables,
    });
}
/**
 * Convenience function for single variable replacement (common case)
 */
export function processTopicTemplate(template, topic) {
    return processTemplate(template, { topic });
}
