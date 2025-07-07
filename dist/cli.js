import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text, useApp } from 'ink';
import { useCallback, useEffect, useState } from 'react';
import { PromptList } from './components/PromptList.js';
import { getClipboardContent } from './utils/clipboard.js';
import { normalizeModelName, saveOutput } from './utils/fileManager.js';
import { scanVaultDirectory, validateVaultStructure, } from './utils/promptManager.js';
import { parsePromptToml } from './utils/tomlParser.js';
export function Cli({ model = 'claude-sonnet-4', vaultPath = 'vault', }) {
    const [state, setState] = useState('loading');
    const [prompts, setPrompts] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { exit } = useApp();
    const normalizedModel = normalizeModelName(model);
    const loadPrompts = useCallback(async () => {
        try {
            setState('loading');
            await validateVaultStructure(vaultPath);
            const promptList = await scanVaultDirectory(vaultPath);
            setPrompts(promptList);
            setState('selecting');
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
            setState('error');
        }
    }, [vaultPath]);
    useEffect(() => {
        loadPrompts();
    }, [loadPrompts]);
    const handlePromptSelect = async (prompt) => {
        if (!prompt.hasToml) {
            setErrorMessage(`Selected prompt "${prompt.name}" does not have a prompt.toml file`);
            setState('error');
            return;
        }
        try {
            setState('processing');
            setSelectedPrompt(prompt);
            // Parse the prompt template
            const promptTemplate = await parsePromptToml(prompt.path);
            // Get clipboard content
            const clipboardContent = await getClipboardContent();
            // Save the output
            const outputPath = await saveOutput(prompt.path, clipboardContent, {
                version: promptTemplate.version,
                model: normalizedModel,
                timestamp: '', // Will be generated in saveOutput
            });
            setSuccessMessage(`Output saved to: ${outputPath}`);
            setState('success');
            // Auto-exit after 2 seconds
            setTimeout(() => {
                exit();
            }, 2000);
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
            setState('error');
        }
    };
    const handleExit = () => {
        exit();
    };
    if (state === 'loading') {
        return (_jsx(Box, { children: _jsxs(Text, { children: ["Loading prompts from ", vaultPath, "..."] }) }));
    }
    if (state === 'error') {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "red", bold: true, children: "Error:" }), _jsx(Text, { color: "red", children: errorMessage }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Press 'r' to retry, or ESC/q to exit" }) })] }));
    }
    if (state === 'processing') {
        return (_jsx(Box, { children: _jsxs(Text, { children: ["Processing prompt \"", selectedPrompt?.name, "\" with model", ' ', normalizedModel, "..."] }) }));
    }
    if (state === 'success') {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "green", bold: true, children: "Success!" }), _jsx(Text, { color: "green", children: successMessage }), _jsx(Text, { dimColor: true, children: "Exiting in 2 seconds..." })] }));
    }
    return (_jsx(PromptList, { prompts: prompts, onSelect: handlePromptSelect, onExit: handleExit }));
}
