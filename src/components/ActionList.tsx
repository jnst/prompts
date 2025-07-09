import { Box, Text, useInput } from 'ink';
import { useEffect, useState } from 'react';

export interface ActionInfo {
	id: string;
	name: string;
	description: string;
}

interface ActionListProps {
	actions: ActionInfo[];
	onSelect: (action: ActionInfo) => void;
	onExit: () => void;
}

export function ActionList({ actions, onSelect, onExit }: ActionListProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	useInput((input, key) => {
		if (key.upArrow) {
			setSelectedIndex((prev) => (prev > 0 ? prev - 1 : actions.length - 1));
		} else if (key.downArrow) {
			setSelectedIndex((prev) => (prev < actions.length - 1 ? prev + 1 : 0));
		} else if (key.return) {
			const selectedAction = actions[selectedIndex];
			if (selectedAction) {
				onSelect(selectedAction);
			}
		} else if (key.escape || input === 'q') {
			onExit();
		}
	});

	useEffect(() => {
		setSelectedIndex(0);
	}, []);

	if (actions.length === 0) {
		return (
			<Box flexDirection="column">
				<Text color="red">No actions available</Text>
				<Text dimColor>Press ESC or 'q' to exit</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Text bold>Select an action:</Text>
			<Text dimColor>
				Use ↑/↓ arrows to navigate, Enter to select, ESC/q to exit
			</Text>
			<Box marginTop={1} flexDirection="column">
				{actions.map((action, index) => (
					<Box key={action.id} paddingLeft={2}>
						<Text color={index === selectedIndex ? 'cyan' : 'white'}>
							{index === selectedIndex ? '▶ ' : '  '}
							{action.name}
							<Text dimColor> - {action.description}</Text>
						</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
}
