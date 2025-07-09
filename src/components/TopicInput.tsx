import { Box, Text, useInput } from 'ink';
import { useState } from 'react';

interface TopicInputProps {
	onSubmit: (topic: string) => void;
	onCancel: () => void;
}

export function TopicInput({ onSubmit, onCancel }: TopicInputProps) {
	const [input, setInput] = useState('');

	useInput((inputChar, key) => {
		if (key.return) {
			const trimmed = input.trim();
			if (trimmed.length > 0) {
				onSubmit(trimmed);
			}
		} else if (key.escape) {
			onCancel();
		} else if (key.backspace || key.delete) {
			setInput((prev) => prev.slice(0, -1));
		} else if (inputChar && !key.ctrl) {
			setInput((prev) => prev + inputChar);
		}
	});

	return (
		<Box flexDirection="column">
			<Text bold>Create new topic file</Text>
			<Text dimColor>
				Enter topic name (press Enter to confirm, ESC to cancel):
			</Text>
			<Box marginTop={1}>
				<Text color="cyan">Topic: </Text>
				<Text>
					{input}
					<Text backgroundColor="white" color="black">
						{' '}
					</Text>
				</Text>
			</Box>
			{input.trim().length === 0 && (
				<Box marginTop={1}>
					<Text dimColor>Please enter a topic name</Text>
				</Box>
			)}
		</Box>
	);
}
