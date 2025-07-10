// Custom error types for the prompts CLI application

export abstract class PromptsError extends Error {
	abstract readonly code: string;
	abstract readonly category: string;

	constructor(message: string, cause?: Error) {
		super(message);
		this.name = this.constructor.name;
		if (cause) {
			this.cause = cause;
		}
	}
}

// File system errors
export class VaultNotFoundError extends PromptsError {
	readonly code = 'VAULT_NOT_FOUND';
	readonly category = 'filesystem';

	constructor(vaultPath: string) {
		super(
			`Vault directory not found: '${vaultPath}'\nPlease create the vault directory or specify a different path using --vault option`,
		);
	}
}

export class VaultAccessError extends PromptsError {
	readonly code = 'VAULT_ACCESS_DENIED';
	readonly category = 'filesystem';

	constructor(vaultPath: string) {
		super(`Cannot access vault directory '${vaultPath}': Permission denied`);
	}
}

export class VaultNotDirectoryError extends PromptsError {
	readonly code = 'VAULT_NOT_DIRECTORY';
	readonly category = 'filesystem';

	constructor(vaultPath: string) {
		super(`Path '${vaultPath}' exists but is not a directory`);
	}
}

export class OutputWriteError extends PromptsError {
	readonly code = 'OUTPUT_WRITE_ERROR';
	readonly category = 'filesystem';

	constructor(outputPath: string, reason: string) {
		super(`Cannot write to ${outputPath}: ${reason}`);
	}
}

// TOML configuration errors
export class TomlNotFoundError extends PromptsError {
	readonly code = 'TOML_NOT_FOUND';
	readonly category = 'configuration';

	constructor(promptPath: string) {
		super(
			`prompt.toml not found in: ${promptPath}\nPlease create a prompt.toml file with the required structure`,
		);
	}
}

export class TomlEmptyError extends PromptsError {
	readonly code = 'TOML_EMPTY';
	readonly category = 'configuration';

	constructor(promptPath: string) {
		super(
			`prompt.toml is empty in: ${promptPath}\nPlease add a valid TOML configuration`,
		);
	}
}

export class TomlSyntaxError extends PromptsError {
	readonly code = 'TOML_SYNTAX_ERROR';
	readonly category = 'configuration';

	constructor(tomlPath: string, parseError: string) {
		super(`Invalid TOML syntax in: ${tomlPath}\n${parseError}`);
	}
}

export class TomlStructureError extends PromptsError {
	readonly code = 'TOML_STRUCTURE_ERROR';
	readonly category = 'configuration';

	constructor(tomlPath: string) {
		super(
			`Invalid TOML structure in: ${tomlPath}\nRequired: [metadata] section with 'current_version', 'created_at', 'updated_at' and [[prompts]] array with 'version', 'content', 'created_at' fields`,
		);
	}
}

export class TomlEmptyTemplateError extends PromptsError {
	readonly code = 'TOML_EMPTY_TEMPLATE';
	readonly category = 'configuration';

	constructor(tomlPath: string) {
		super(
			`Empty template in: ${tomlPath}\nPlease provide a non-empty template`,
		);
	}
}

export class TomlVersionFormatError extends PromptsError {
	readonly code = 'TOML_VERSION_FORMAT_ERROR';
	readonly category = 'configuration';

	constructor(tomlPath: string) {
		super(
			`Invalid version format in: ${tomlPath}\nExpected format: X.Y.Z (e.g., "1.0.0")`,
		);
	}
}

// Clipboard errors
export class ClipboardEmptyError extends PromptsError {
	readonly code = 'CLIPBOARD_EMPTY';
	readonly category = 'input';

	constructor() {
		super(
			'Clipboard is empty\nPlease copy some text to the clipboard before running this command\nExample: echo "Your content here" | pbcopy',
		);
	}
}

export class ClipboardTooLargeError extends PromptsError {
	readonly code = 'CLIPBOARD_TOO_LARGE';
	readonly category = 'input';

	constructor() {
		super(
			'Clipboard content too large (over 1MB)\nPlease use smaller content for processing',
		);
	}
}

export class ClipboardBinaryError extends PromptsError {
	readonly code = 'CLIPBOARD_BINARY_CONTENT';
	readonly category = 'input';

	constructor() {
		super(
			'Clipboard contains binary or control characters\nPlease ensure clipboard content is plain text',
		);
	}
}

export class ClipboardCommandError extends PromptsError {
	readonly code = 'CLIPBOARD_COMMAND_ERROR';
	readonly category = 'environment';

	constructor(command: string) {
		super(
			`${command} command not found. This tool only works on macOS.\nPlease run this command on a macOS system with ${command} available.`,
		);
	}
}

// Model validation errors
export class ModelValidationError extends PromptsError {
	readonly code = 'MODEL_VALIDATION_ERROR';
	readonly category = 'validation';

	constructor(model: string, validModels: string[]) {
		super(
			`Invalid model: '${model}'\nSupported models: ${validModels.join(', ')}\nExample: --model claude-sonnet-4`,
		);
	}
}

export class ModelRequiredError extends PromptsError {
	readonly code = 'MODEL_REQUIRED';
	readonly category = 'validation';

	constructor() {
		super(
			'Model name is required and must be a string\nExample: --model claude-sonnet-4',
		);
	}
}

export class ModelEmptyError extends PromptsError {
	readonly code = 'MODEL_EMPTY';
	readonly category = 'validation';

	constructor() {
		super('Model name cannot be empty\nExample: --model claude-sonnet-4');
	}
}

// General validation errors
export class ValidationError extends PromptsError {
	readonly code = 'VALIDATION_ERROR';
	readonly category = 'validation';

	constructor(field: string, type: string) {
		super(`${field} is required and must be ${type}`);
	}
}

// Warning class for non-fatal issues
export class PromptsWarning {
	constructor(
		public readonly message: string,
		public readonly code: string,
	) {}
}

export class VaultEmptyWarning extends PromptsWarning {
	constructor(vaultPath: string) {
		super(
			`Warning: Vault directory '${vaultPath}' contains no prompt directories`,
			'VAULT_EMPTY',
		);
	}
}

export class ClipboardShortWarning extends PromptsWarning {
	constructor() {
		super(
			'Warning: Clipboard content is very short (less than 3 characters)',
			'CLIPBOARD_SHORT',
		);
	}
}

export class FileFormatError extends PromptsError {
	readonly code = 'FILE_FORMAT_ERROR';
	readonly category = 'validation';

	constructor(filePath: string) {
		super(
			`File format error in: ${filePath}\nFile does not have valid frontmatter structure`,
		);
	}
}
