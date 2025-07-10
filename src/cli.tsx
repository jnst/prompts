import { Box, Text, useApp } from 'ink';
import { useCallback, useEffect, useState } from 'react';
import { type ActionInfo, ActionList } from './components/ActionList.js';
import { FileList } from './components/FileList.js';
import { PromptList } from './components/PromptList.js';
import { TopicInput } from './components/TopicInput.js';
import { getClipboardContent, setClipboardContent } from './utils/clipboard.js';
import {
	clearFileContent,
	createTopicFile,
	detectAllOutputFiles,
	detectUnfilledFiles,
	normalizeModelName,
	type OutputFile,
	removeFile,
	type UnfilledFile,
	updateFileContent,
} from './utils/fileManager.js';
import type { PromptInfo } from './utils/promptManager.js';
import {
	scanVaultDirectory,
	validateVaultStructure,
} from './utils/promptManager.js';
import { processTopicTemplate } from './utils/promptProcessor.js';
import { parsePromptToml } from './utils/tomlParser.js';

type AppState =
	| 'loading'
	| 'selecting'
	| 'action-selecting'
	| 'topic-input'
	| 'file-selecting'
	| 'processing'
	| 'success'
	| 'error';

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
	const [selectedAction, setSelectedAction] = useState<ActionInfo | null>(null);
	const [unfilledFiles, setUnfilledFiles] = useState<UnfilledFile[]>([]);
	const [outputFiles, setOutputFiles] = useState<OutputFile[]>([]);
	const [, setSelectedFile] = useState<UnfilledFile | OutputFile | null>(null);
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

	const handlePromptSelect = (prompt: PromptInfo) => {
		if (!prompt.hasToml) {
			setErrorMessage(
				`Selected prompt "${prompt.name}" does not have a prompt.toml file`,
			);
			setState('error');
			return;
		}

		setSelectedPrompt(prompt);
		setState('action-selecting');
	};

	const handleActionSelect = async (action: ActionInfo) => {
		setSelectedAction(action);

		if (action.id === 'create') {
			setState('topic-input');
		} else if (action.id === 'fill') {
			if (!selectedPrompt) {
				setErrorMessage('No prompt selected');
				setState('error');
				return;
			}

			setState('loading');

			// Detect unfilled files
			const unfilledResult = await detectUnfilledFiles(selectedPrompt.path);
			if (unfilledResult.isErr()) {
				setErrorMessage(unfilledResult.error.message);
				setState('error');
				return;
			}

			setUnfilledFiles(unfilledResult.value);
			setState('file-selecting');
		} else if (action.id === 'reset' || action.id === 'delete') {
			if (!selectedPrompt) {
				setErrorMessage('No prompt selected');
				setState('error');
				return;
			}

			setState('loading');

			// Detect all output files for clear/remove actions
			const outputResult = await detectAllOutputFiles(selectedPrompt.path);
			if (outputResult.isErr()) {
				setErrorMessage(outputResult.error.message);
				setState('error');
				return;
			}

			// Filter files based on action
			if (action.id === 'reset') {
				// For reset: only files with content
				const filesWithContent = outputResult.value.filter(
					(file) => file.hasContent,
				);
				setOutputFiles(filesWithContent);
			} else {
				// For delete: all files
				setOutputFiles(outputResult.value);
			}

			setState('file-selecting');
		}
	};

	const handleTopicSubmit = async (topic: string) => {
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
			const processedResult = processTopicTemplate(
				promptResult.value.content,
				topic,
			);
			if (processedResult.isErr()) {
				setErrorMessage(processedResult.error.message);
				setState('error');
				return;
			}

			// Create topic file
			const fileResult = await createTopicFile(
				selectedPrompt.path,
				topic,
				promptResult.value.version,
			);
			if (fileResult.isErr()) {
				setErrorMessage(fileResult.error.message);
				setState('error');
				return;
			}

			// Copy processed prompt to clipboard
			const clipboardResult = await setClipboardContent(
				processedResult.value.content,
			);
			if (clipboardResult.isErr()) {
				setErrorMessage(clipboardResult.error.message);
				setState('error');
				return;
			}

			setSuccessMessage(
				`Topic file created: ${fileResult.value}\nProcessed prompt copied to clipboard!`,
			);
			setState('success');

			setTimeout(() => {
				exit();
			}, 3000);
		} catch (error) {
			setErrorMessage(`Unexpected error: ${error}`);
			setState('error');
		}
	};

	const handleFileSelect = async (file: UnfilledFile | OutputFile) => {
		setSelectedFile(file);
		setState('processing');

		try {
			if (selectedAction?.id === 'fill') {
				// Get content from clipboard
				const clipboardResult = await getClipboardContent();
				if (clipboardResult.isErr()) {
					setErrorMessage(clipboardResult.error.message);
					setState('error');
					return;
				}

				// Update file with clipboard content
				const updateResult = await updateFileContent(
					file.path,
					clipboardResult.value.content,
				);
				if (updateResult.isErr()) {
					setErrorMessage(updateResult.error.message);
					setState('error');
					return;
				}

				setSuccessMessage(
					`Successfully filled file: ${file.fileName}\nContent added from clipboard!`,
				);
			} else if (selectedAction?.id === 'reset') {
				// Reset file content while preserving frontmatter
				const resetResult = await clearFileContent(file.path);
				if (resetResult.isErr()) {
					setErrorMessage(resetResult.error.message);
					setState('error');
					return;
				}

				setSuccessMessage(
					`Successfully reset file: ${file.fileName}\nFrontmatter preserved, content removed!`,
				);
			} else if (selectedAction?.id === 'delete') {
				// Delete file completely
				const deleteResult = await removeFile(file.path);
				if (deleteResult.isErr()) {
					setErrorMessage(deleteResult.error.message);
					setState('error');
					return;
				}

				setSuccessMessage(
					`Successfully deleted file: ${file.fileName}\nFile deleted completely!`,
				);
			}

			setState('success');

			setTimeout(() => {
				exit();
			}, 3000);
		} catch (error) {
			setErrorMessage(`Unexpected error: ${error}`);
			setState('error');
		}
	};

	const handleBackToPromptSelection = () => {
		setSelectedPrompt(null);
		setSelectedAction(null);
		setUnfilledFiles([]);
		setOutputFiles([]);
		setSelectedFile(null);
		setState('selecting');
	};

	const handleBackToActionSelection = () => {
		setSelectedAction(null);
		setUnfilledFiles([]);
		setOutputFiles([]);
		setSelectedFile(null);
		setState('action-selecting');
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

	if (state === 'action-selecting') {
		const actions: ActionInfo[] = [
			{ id: 'create', name: 'create', description: 'Create new topic file' },
			{ id: 'fill', name: 'fill', description: 'Fill existing empty file' },
			{
				id: 'reset',
				name: 'reset',
				description: 'Reset file to empty state (keep frontmatter)',
			},
			{ id: 'delete', name: 'delete', description: 'Delete file completely' },
		];

		return (
			<ActionList
				actions={actions}
				onSelect={handleActionSelect}
				onExit={handleBackToPromptSelection}
			/>
		);
	}

	if (state === 'topic-input') {
		return (
			<TopicInput
				onSubmit={handleTopicSubmit}
				onCancel={handleBackToActionSelection}
			/>
		);
	}

	if (state === 'file-selecting') {
		// Choose the appropriate file list based on selected action
		let files: (UnfilledFile | OutputFile)[] = [];

		if (selectedAction?.id === 'fill') {
			files = unfilledFiles;
		} else if (
			selectedAction?.id === 'reset' ||
			selectedAction?.id === 'delete'
		) {
			files = outputFiles;
		}

		return (
			<FileList
				files={files}
				onSelect={handleFileSelect}
				onExit={handleBackToActionSelection}
			/>
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
