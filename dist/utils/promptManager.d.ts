export interface PromptInfo {
    name: string;
    path: string;
    hasToml: boolean;
}
export declare function scanVaultDirectory(vaultPath?: string): Promise<PromptInfo[]>;
export declare function validateVaultStructure(vaultPath?: string): Promise<void>;
