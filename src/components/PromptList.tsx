import { Box, Text, useInput, useStdin } from 'ink';
import { useEffect, useState } from 'react';
import type { PromptInfo } from '../utils/promptManager.js';

interface PromptListProps {
	prompts: PromptInfo[];
	onSelect: (prompt: PromptInfo) => void;
	onExit: () => void;
}

export function PromptList({ prompts, onSelect, onExit }: PromptListProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const { isRawModeSupported } = useStdin();

	useInput(
		(input, key) => {
			if (key.upArrow) {
				setSelectedIndex((prev) => Math.max(0, prev - 1));
			} else if (key.downArrow) {
				setSelectedIndex((prev) => Math.min(prompts.length - 1, prev + 1));
			} else if (key.return) {
				if (prompts[selectedIndex]) {
					onSelect(prompts[selectedIndex]);
				}
			} else if (key.escape || input === 'q') {
				onExit();
			}
		},
		{
			isActive: isRawModeSupported,
		},
	);

	useEffect(() => {
		// Reset selection if prompts change
		setSelectedIndex(0);
	}, []);

	if (prompts.length === 0) {
		return (
			<Box flexDirection="column">
				<Text color="red">No prompts found in vault/ directory</Text>
				<Text dimColor>
					Make sure your vault directory exists and contains prompt directories
					with prompt.toml files
				</Text>
				<Text dimColor>Press ESC or 'q' to exit</Text>
			</Box>
		);
	}

	if (!isRawModeSupported) {
		return (
			<Box flexDirection="column">
				<Text color="yellow">
					Interactive mode not supported in this environment
				</Text>
				<Text>Available prompts:</Text>
				<Box marginTop={1} flexDirection="column">
					{prompts.map((prompt, index) => (
						<Box key={`non-interactive-${prompt.path}`} paddingLeft={2}>
							<Text>
								{index + 1}. {prompt.name}
								{!prompt.hasToml && (
									<Text color="yellow"> (no prompt.toml)</Text>
								)}
							</Text>
						</Box>
					))}
				</Box>
				<Box marginTop={1}>
					<Text dimColor>
						Run in a terminal that supports interactive input to use selection
						UI
					</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Text bold>Select a prompt template:</Text>
			<Text dimColor>
				Use ↑/↓ arrows to navigate, Enter to select, ESC/q to exit
			</Text>
			<Box marginTop={1} flexDirection="column">
				{prompts.map((prompt, index) => (
					<Box key={`interactive-${prompt.path}`} paddingLeft={2}>
						<Text color={index === selectedIndex ? 'cyan' : 'white'}>
							{index === selectedIndex ? '▶ ' : '  '}
							{prompt.name}
							{!prompt.hasToml && <Text color="yellow"> (no prompt.toml)</Text>}
						</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
}
