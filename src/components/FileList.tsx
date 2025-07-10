import { Box, Text, useInput } from 'ink';
import { useEffect, useState } from 'react';
import type { OutputFile, UnfilledFile } from '../utils/fileManager.js';

type FileType = UnfilledFile | OutputFile;

export interface FileListProps {
	files: FileType[];
	onSelect: (file: FileType) => void;
	onExit: () => void;
}

export function FileList({ files, onSelect, onExit }: FileListProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Reset selection when files array changes
	useEffect(() => {
		if (selectedIndex >= files.length) {
			setSelectedIndex(0);
		}
	}, [files.length, selectedIndex]);

	useInput((input, key) => {
		if (key.upArrow) {
			setSelectedIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
		} else if (key.downArrow) {
			setSelectedIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
		} else if (key.return) {
			if (files[selectedIndex]) {
				onSelect(files[selectedIndex]);
			}
		} else if (key.escape || input === 'q') {
			onExit();
		}
	});

	if (files.length === 0) {
		return (
			<Box flexDirection="column">
				<Text bold>No unfilled files found</Text>
				<Text dimColor>
					Create some topic files first using the 'create' action
				</Text>
				<Box marginTop={1}>
					<Text dimColor>Press ESC or 'q' to go back</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Text bold>Select a file:</Text>
			<Box marginTop={1} flexDirection="column">
				{files.map((file, index) => (
					<Box key={file.path}>
						<Text {...(index === selectedIndex ? { color: 'cyan' } : {})}>
							{index === selectedIndex ? '➤ ' : '  '}
							{'topic' in file
								? `${file.topic} (${file.fileName})`
								: 'metadata' in file && file.metadata?.topic
									? `${file.metadata.topic} (${file.fileName})`
									: file.fileName}
						</Text>
					</Box>
				))}
			</Box>
			<Box marginTop={1}>
				<Text dimColor>
					Use ↑/↓ arrows to navigate, Enter to select, ESC/q to exit
				</Text>
			</Box>
		</Box>
	);
}
