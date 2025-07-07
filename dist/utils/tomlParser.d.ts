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
export declare function parsePromptToml(promptPath: string): Promise<PromptTemplate>;
export declare function validateTomlStructure(data: unknown): data is TomlData;
