import { type Result } from 'neverthrow';
import { ClipboardBinaryError, ClipboardCommandError, ClipboardEmptyError, ClipboardTooLargeError, type PromptsWarning } from '../errors/index.js';
export declare function getClipboardContent(): Promise<Result<{
    content: string;
    warnings: PromptsWarning[];
}, ClipboardEmptyError | ClipboardTooLargeError | ClipboardBinaryError | ClipboardCommandError>>;
export declare function setClipboardContent(content: string): Promise<Result<void, ClipboardCommandError>>;
