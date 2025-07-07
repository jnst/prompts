import { Box, Text, useApp } from 'ink';
import { useCallback, useEffect, useState } from 'react';
import { PromptList } from './components/PromptList.js';
import { getClipboardContent } from './utils/clipboard.js';
import { normalizeModelName, saveOutput } from './utils/fileManager.js';
import type { PromptInfo } from './utils/promptManager.js';
import {
	scanVaultDirectory,
	validateVaultStructure,
} from './utils/promptManager.js';
import { parsePromptToml } from './utils/tomlParser.js';

type AppState = 'loading' | 'selecting' | 'processing' | 'success' | 'error';

interface CliProps {
	model?: string;
	vaultPath?: string;
}

export function Cli({
	model = 'claude-sonnet-4',
	vaultPath = 'vault',
}: CliProps) {
	const [state, setState] = useState<AppState>('loading');
	const [prompts, setPrompts] = useState<PromptInfo[]>([]);
	const [selectedPrompt, setSelectedPrompt] = useState<PromptInfo | null>(null);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [successMessage, setSuccessMessage] = useState<string>('');
	const { exit } = useApp();

	const normalizedModel = normalizeModelName(model);

	const loadPrompts = useCallback(async () => {
		try {
			setState('loading');
			await validateVaultStructure(vaultPath);
			const promptList = await scanVaultDirectory(vaultPath);
			setPrompts(promptList);
			setState('selecting');
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Unknown error occurred',
			);
			setState('error');
		}
	}, [vaultPath]);

	useEffect(() => {
		loadPrompts();
	}, [loadPrompts]);

	const handlePromptSelect = async (prompt: PromptInfo) => {
		if (!prompt.hasToml) {
			setErrorMessage(
				`Selected prompt "${prompt.name}" does not have a prompt.toml file`,
			);
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
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Unknown error occurred',
			);
			setState('error');
		}
	};

	const handleExit = () => {
		exit();
	};

	if (state === 'loading') {
		return (
			<Box>
				<Text>Loading prompts from {vaultPath}...</Text>
			</Box>
		);
	}

	if (state === 'error') {
		return (
			<Box flexDirection="column">
				<Text color="red" bold>
					Error:
				</Text>
				<Text color="red">{errorMessage}</Text>
				<Box marginTop={1}>
					<Text dimColor>Press 'r' to retry, or ESC/q to exit</Text>
				</Box>
			</Box>
		);
	}

	if (state === 'processing') {
		return (
			<Box>
				<Text>
					Processing prompt "{selectedPrompt?.name}" with model{' '}
					{normalizedModel}...
				</Text>
			</Box>
		);
	}

	if (state === 'success') {
		return (
			<Box flexDirection="column">
				<Text color="green" bold>
					Success!
				</Text>
				<Text color="green">{successMessage}</Text>
				<Text dimColor>Exiting in 2 seconds...</Text>
			</Box>
		);
	}

	return (
		<PromptList
			prompts={prompts}
			onSelect={handlePromptSelect}
			onExit={handleExit}
		/>
	);
}
