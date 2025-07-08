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
        setState('loading');
        const vaultValidation = await validateVaultStructure(vaultPath);
        if (vaultValidation.isErr()) {
            setErrorMessage(vaultValidation.error.message);
            setState('error');
            return;
        }
        // Handle warnings
        const warnings = vaultValidation.value;
        warnings.forEach((warning) => {
            console.warn(warning.message);
        });
        const promptScan = await scanVaultDirectory(vaultPath);
        if (promptScan.isErr()) {
            setErrorMessage(promptScan.error.message);
            setState('error');
            return;
        }
        setPrompts(promptScan.value);
        setState('selecting');
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
        setState('processing');
        setSelectedPrompt(prompt);
        // Parse the prompt template
        const promptResult = await parsePromptToml(prompt.path);
        if (promptResult.isErr()) {
            setErrorMessage(promptResult.error.message);
            setState('error');
            return;
        }
        // Get clipboard content
        const clipboardResult = await getClipboardContent();
        if (clipboardResult.isErr()) {
            setErrorMessage(clipboardResult.error.message);
            setState('error');
            return;
        }
        // Handle warnings
        const { content, warnings } = clipboardResult.value;
        warnings.forEach((warning) => {
            console.warn(warning.message);
        });
        // Save the output
        const outputResult = await saveOutput(prompt.path, content, {
            version: promptResult.value.version,
            model: normalizedModel,
            timestamp: '', // Will be generated in saveOutput
        });
        if (outputResult.isErr()) {
            setErrorMessage(outputResult.error.message);
            setState('error');
            return;
        }
        setSuccessMessage(`Output saved to: ${outputResult.value}`);
        setState('success');
        // Auto-exit after 2 seconds
        setTimeout(() => {
            exit();
        }, 2000);
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
