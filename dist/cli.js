import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text, useApp } from 'ink';
import { useCallback, useEffect, useState } from 'react';
import { ActionList } from './components/ActionList.js';
import { PromptList } from './components/PromptList.js';
import { TopicInput } from './components/TopicInput.js';
import { setClipboardContent } from './utils/clipboard.js';
import { createTopicFile, normalizeModelName, } from './utils/fileManager.js';
import { scanVaultDirectory, validateVaultStructure, } from './utils/promptManager.js';
import { processTopicTemplate } from './utils/promptProcessor.js';
import { parsePromptToml } from './utils/tomlParser.js';
export function Cli({ model = 'claude-sonnet-4', vaultPath = 'vault', }) {
    const [state, setState] = useState('loading');
    const [prompts, setPrompts] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [, setSelectedAction] = useState(null);
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
    const handlePromptSelect = (prompt) => {
        if (!prompt.hasToml) {
            setErrorMessage(`Selected prompt "${prompt.name}" does not have a prompt.toml file`);
            setState('error');
            return;
        }
        setSelectedPrompt(prompt);
        setState('action-selecting');
    };
    const handleActionSelect = (action) => {
        setSelectedAction(action);
        if (action.id === 'create') {
            setState('topic-input');
        }
        else if (action.id === 'fill') {
            // TODO: Implement fill action
            setErrorMessage('Fill action not yet implemented');
            setState('error');
        }
    };
    const handleTopicSubmit = async (topic) => {
        if (!selectedPrompt) {
            setErrorMessage('No prompt selected');
            setState('error');
            return;
        }
        setState('processing');
        try {
            // Parse the prompt template
            const promptResult = await parsePromptToml(selectedPrompt.path);
            if (promptResult.isErr()) {
                setErrorMessage(promptResult.error.message);
                setState('error');
                return;
            }
            // Process template with topic variable
            const processedResult = processTopicTemplate(promptResult.value.content, topic);
            if (processedResult.isErr()) {
                setErrorMessage(processedResult.error.message);
                setState('error');
                return;
            }
            // Create topic file
            const fileResult = await createTopicFile(selectedPrompt.path, topic, promptResult.value.version);
            if (fileResult.isErr()) {
                setErrorMessage(fileResult.error.message);
                setState('error');
                return;
            }
            // Copy processed prompt to clipboard
            const clipboardResult = await setClipboardContent(processedResult.value.content);
            if (clipboardResult.isErr()) {
                setErrorMessage(clipboardResult.error.message);
                setState('error');
                return;
            }
            setSuccessMessage(`Topic file created: ${fileResult.value}\nProcessed prompt copied to clipboard!`);
            setState('success');
            setTimeout(() => {
                exit();
            }, 3000);
        }
        catch (error) {
            setErrorMessage(`Unexpected error: ${error}`);
            setState('error');
        }
    };
    const handleBackToPromptSelection = () => {
        setSelectedPrompt(null);
        setSelectedAction(null);
        setState('selecting');
    };
    const handleBackToActionSelection = () => {
        setSelectedAction(null);
        setState('action-selecting');
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
    if (state === 'action-selecting') {
        const actions = [
            { id: 'create', name: 'create', description: 'Create new topic file' },
            { id: 'fill', name: 'fill', description: 'Fill existing empty file' },
        ];
        return (_jsx(ActionList, { actions: actions, onSelect: handleActionSelect, onExit: handleBackToPromptSelection }));
    }
    if (state === 'topic-input') {
        return (_jsx(TopicInput, { onSubmit: handleTopicSubmit, onCancel: handleBackToActionSelection }));
    }
    return (_jsx(PromptList, { prompts: prompts, onSelect: handlePromptSelect, onExit: handleExit }));
}
