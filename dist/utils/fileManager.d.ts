export interface OutputMetadata {
    version: string;
    model: string;
    timestamp: string;
}
export declare function generateFrontmatter(metadata: OutputMetadata): string;
export declare function generateTimestamp(): string;
export declare function generateFileName(timestamp: string): string;
export declare function saveOutput(promptPath: string, content: string, metadata: OutputMetadata): Promise<string>;
export declare function validateModel(model: string): boolean;
export declare function normalizeModelName(model: string): string;
