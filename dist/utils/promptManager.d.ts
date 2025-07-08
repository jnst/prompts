import { type Result } from 'neverthrow';
import { type PromptsWarning, VaultAccessError, VaultNotDirectoryError, VaultNotFoundError } from '../errors/index.js';
export interface PromptInfo {
    name: string;
    path: string;
    hasToml: boolean;
}
export declare function scanVaultDirectory(vaultPath?: string): Promise<Result<PromptInfo[], VaultNotFoundError>>;
export declare function validateVaultStructure(vaultPath?: string): Promise<Result<PromptsWarning[], VaultNotFoundError | VaultAccessError | VaultNotDirectoryError>>;
