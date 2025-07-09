// Custom error types for the prompts CLI application
export class PromptsError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = this.constructor.name;
        if (cause) {
            this.cause = cause;
        }
    }
}
// File system errors
export class VaultNotFoundError extends PromptsError {
    code = 'VAULT_NOT_FOUND';
    category = 'filesystem';
    constructor(vaultPath) {
        super(`Vault directory not found: '${vaultPath}'\nPlease create the vault directory or specify a different path using --vault option`);
    }
}
export class VaultAccessError extends PromptsError {
    code = 'VAULT_ACCESS_DENIED';
    category = 'filesystem';
    constructor(vaultPath) {
        super(`Cannot access vault directory '${vaultPath}': Permission denied`);
    }
}
export class VaultNotDirectoryError extends PromptsError {
    code = 'VAULT_NOT_DIRECTORY';
    category = 'filesystem';
    constructor(vaultPath) {
        super(`Path '${vaultPath}' exists but is not a directory`);
    }
}
export class OutputWriteError extends PromptsError {
    code = 'OUTPUT_WRITE_ERROR';
    category = 'filesystem';
    constructor(outputPath, reason) {
        super(`Cannot write to ${outputPath}: ${reason}`);
    }
}
// TOML configuration errors
export class TomlNotFoundError extends PromptsError {
    code = 'TOML_NOT_FOUND';
    category = 'configuration';
    constructor(promptPath) {
        super(`prompt.toml not found in: ${promptPath}\nPlease create a prompt.toml file with the required structure`);
    }
}
export class TomlEmptyError extends PromptsError {
    code = 'TOML_EMPTY';
    category = 'configuration';
    constructor(promptPath) {
        super(`prompt.toml is empty in: ${promptPath}\nPlease add a valid TOML configuration`);
    }
}
export class TomlSyntaxError extends PromptsError {
    code = 'TOML_SYNTAX_ERROR';
    category = 'configuration';
    constructor(tomlPath, parseError) {
        super(`Invalid TOML syntax in: ${tomlPath}\n${parseError}`);
    }
}
export class TomlStructureError extends PromptsError {
    code = 'TOML_STRUCTURE_ERROR';
    category = 'configuration';
    constructor(tomlPath) {
        super(`Invalid TOML structure in: ${tomlPath}\nRequired: [metadata] section with 'current_version', 'created_at', 'updated_at' and [[prompts]] array with 'version', 'content', 'created_at' fields`);
    }
}
export class TomlEmptyTemplateError extends PromptsError {
    code = 'TOML_EMPTY_TEMPLATE';
    category = 'configuration';
    constructor(tomlPath) {
        super(`Empty template in: ${tomlPath}\nPlease provide a non-empty template`);
    }
}
export class TomlVersionFormatError extends PromptsError {
    code = 'TOML_VERSION_FORMAT_ERROR';
    category = 'configuration';
    constructor(tomlPath) {
        super(`Invalid version format in: ${tomlPath}\nExpected format: X.Y.Z (e.g., "1.0.0")`);
    }
}
// Clipboard errors
export class ClipboardEmptyError extends PromptsError {
    code = 'CLIPBOARD_EMPTY';
    category = 'input';
    constructor() {
        super('Clipboard is empty\nPlease copy some text to the clipboard before running this command\nExample: echo "Your content here" | pbcopy');
    }
}
export class ClipboardTooLargeError extends PromptsError {
    code = 'CLIPBOARD_TOO_LARGE';
    category = 'input';
    constructor() {
        super('Clipboard content too large (over 1MB)\nPlease use smaller content for processing');
    }
}
export class ClipboardBinaryError extends PromptsError {
    code = 'CLIPBOARD_BINARY_CONTENT';
    category = 'input';
    constructor() {
        super('Clipboard contains binary or control characters\nPlease ensure clipboard content is plain text');
    }
}
export class ClipboardCommandError extends PromptsError {
    code = 'CLIPBOARD_COMMAND_ERROR';
    category = 'environment';
    constructor(command) {
        super(`${command} command not found. This tool only works on macOS.\nPlease run this command on a macOS system with ${command} available.`);
    }
}
// Model validation errors
export class ModelValidationError extends PromptsError {
    code = 'MODEL_VALIDATION_ERROR';
    category = 'validation';
    constructor(model, validModels) {
        super(`Invalid model: '${model}'\nSupported models: ${validModels.join(', ')}\nExample: --model claude-sonnet-4`);
    }
}
export class ModelRequiredError extends PromptsError {
    code = 'MODEL_REQUIRED';
    category = 'validation';
    constructor() {
        super('Model name is required and must be a string\nExample: --model claude-sonnet-4');
    }
}
export class ModelEmptyError extends PromptsError {
    code = 'MODEL_EMPTY';
    category = 'validation';
    constructor() {
        super('Model name cannot be empty\nExample: --model claude-sonnet-4');
    }
}
// General validation errors
export class ValidationError extends PromptsError {
    code = 'VALIDATION_ERROR';
    category = 'validation';
    constructor(field, type) {
        super(`${field} is required and must be ${type}`);
    }
}
// Warning class for non-fatal issues
export class PromptsWarning {
    message;
    code;
    constructor(message, code) {
        this.message = message;
        this.code = code;
    }
}
export class VaultEmptyWarning extends PromptsWarning {
    constructor(vaultPath) {
        super(`Warning: Vault directory '${vaultPath}' contains no prompt directories`, 'VAULT_EMPTY');
    }
}
export class ClipboardShortWarning extends PromptsWarning {
    constructor() {
        super('Warning: Clipboard content is very short (less than 3 characters)', 'CLIPBOARD_SHORT');
    }
}
