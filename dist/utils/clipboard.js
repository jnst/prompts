import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { err, ok } from 'neverthrow';
import { ClipboardBinaryError, ClipboardCommandError, ClipboardEmptyError, ClipboardShortWarning, ClipboardTooLargeError, } from '../errors/index.js';
const execAsync = promisify(exec);
export async function getClipboardContent() {
    try {
        const { stdout } = await execAsync('pbpaste');
        const content = stdout.trim();
        if (!content) {
            return err(new ClipboardEmptyError());
        }
        // Validate content length (reasonable limits)
        if (content.length > 1000000) {
            // 1MB limit
            return err(new ClipboardTooLargeError());
        }
        const warnings = [];
        if (content.length < 3) {
            warnings.push(new ClipboardShortWarning());
        }
        // Check for potentially problematic content - use string methods instead of regex
        const hasControlChars = content.split('').some((char) => {
            const code = char.charCodeAt(0);
            return ((code >= 0x00 && code <= 0x08) ||
                (code >= 0x0e && code <= 0x1f) ||
                code === 0x7f);
        });
        if (hasControlChars) {
            return err(new ClipboardBinaryError());
        }
        return ok({ content, warnings });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('command not found')) {
                return err(new ClipboardCommandError('pbpaste'));
            }
            return err(new ClipboardCommandError('pbpaste'));
        }
        return err(new ClipboardCommandError('pbpaste'));
    }
}
export async function setClipboardContent(content) {
    try {
        await execAsync(`echo ${JSON.stringify(content)} | pbcopy`);
        return ok(undefined);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('command not found')) {
                return err(new ClipboardCommandError('pbcopy'));
            }
            return err(new ClipboardCommandError('pbcopy'));
        }
        return err(new ClipboardCommandError('pbcopy'));
    }
}
