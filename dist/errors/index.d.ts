export declare abstract class PromptsError extends Error {
    abstract readonly code: string;
    abstract readonly category: string;
    constructor(message: string, cause?: Error);
}
export declare class VaultNotFoundError extends PromptsError {
    readonly code = "VAULT_NOT_FOUND";
    readonly category = "filesystem";
    constructor(vaultPath: string);
}
export declare class VaultAccessError extends PromptsError {
    readonly code = "VAULT_ACCESS_DENIED";
    readonly category = "filesystem";
    constructor(vaultPath: string);
}
export declare class VaultNotDirectoryError extends PromptsError {
    readonly code = "VAULT_NOT_DIRECTORY";
    readonly category = "filesystem";
    constructor(vaultPath: string);
}
export declare class OutputWriteError extends PromptsError {
    readonly code = "OUTPUT_WRITE_ERROR";
    readonly category = "filesystem";
    constructor(outputPath: string, reason: string);
}
export declare class TomlNotFoundError extends PromptsError {
    readonly code = "TOML_NOT_FOUND";
    readonly category = "configuration";
    constructor(promptPath: string);
}
export declare class TomlEmptyError extends PromptsError {
    readonly code = "TOML_EMPTY";
    readonly category = "configuration";
    constructor(promptPath: string);
}
export declare class TomlSyntaxError extends PromptsError {
    readonly code = "TOML_SYNTAX_ERROR";
    readonly category = "configuration";
    constructor(tomlPath: string, parseError: string);
}
export declare class TomlStructureError extends PromptsError {
    readonly code = "TOML_STRUCTURE_ERROR";
    readonly category = "configuration";
    constructor(tomlPath: string);
}
export declare class TomlEmptyTemplateError extends PromptsError {
    readonly code = "TOML_EMPTY_TEMPLATE";
    readonly category = "configuration";
    constructor(tomlPath: string);
}
export declare class TomlVersionFormatError extends PromptsError {
    readonly code = "TOML_VERSION_FORMAT_ERROR";
    readonly category = "configuration";
    constructor(tomlPath: string);
}
export declare class ClipboardEmptyError extends PromptsError {
    readonly code = "CLIPBOARD_EMPTY";
    readonly category = "input";
    constructor();
}
export declare class ClipboardTooLargeError extends PromptsError {
    readonly code = "CLIPBOARD_TOO_LARGE";
    readonly category = "input";
    constructor();
}
export declare class ClipboardBinaryError extends PromptsError {
    readonly code = "CLIPBOARD_BINARY_CONTENT";
    readonly category = "input";
    constructor();
}
export declare class ClipboardCommandError extends PromptsError {
    readonly code = "CLIPBOARD_COMMAND_ERROR";
    readonly category = "environment";
    constructor(command: string);
}
export declare class ModelValidationError extends PromptsError {
    readonly code = "MODEL_VALIDATION_ERROR";
    readonly category = "validation";
    constructor(model: string, validModels: string[]);
}
export declare class ModelRequiredError extends PromptsError {
    readonly code = "MODEL_REQUIRED";
    readonly category = "validation";
    constructor();
}
export declare class ModelEmptyError extends PromptsError {
    readonly code = "MODEL_EMPTY";
    readonly category = "validation";
    constructor();
}
export declare class ValidationError extends PromptsError {
    readonly code = "VALIDATION_ERROR";
    readonly category = "validation";
    constructor(field: string, type: string);
}
export declare class PromptsWarning {
    readonly message: string;
    readonly code: string;
    constructor(message: string, code: string);
}
export declare class VaultEmptyWarning extends PromptsWarning {
    constructor(vaultPath: string);
}
export declare class ClipboardShortWarning extends PromptsWarning {
    constructor();
}
