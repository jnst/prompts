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

	const handlePromptSelect = async (prompt: PromptInfo) => {
		if (!prompt.hasToml) {
			setErrorMessage(
				`Selected prompt "${prompt.name}" does not have a prompt.toml file`,
			);
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
