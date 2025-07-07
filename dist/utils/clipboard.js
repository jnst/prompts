import { exec } from 'node:child_process';
import { promisify } from 'node:util';
const execAsync = promisify(exec);
export async function getClipboardContent() {
    try {
        const { stdout } = await execAsync('pbpaste');
        const content = stdout.trim();
        if (!content) {
            throw new Error('Clipboard is empty');
        }
        return content;
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('command not found')) {
                throw new Error('pbpaste command not found. This tool only works on macOS.');
            }
            throw error;
        }
        throw new Error('Failed to read clipboard content');
    }
}
export async function setClipboardContent(content) {
    try {
        await execAsync(`echo ${JSON.stringify(content)} | pbcopy`);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('command not found')) {
                throw new Error('pbcopy command not found. This tool only works on macOS.');
            }
            throw error;
        }
        throw new Error('Failed to set clipboard content');
    }
}
