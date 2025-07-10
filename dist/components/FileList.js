import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text, useInput } from 'ink';
import { useEffect, useState } from 'react';
export function FileList({ files, onSelect, onExit }) {
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
        }
        else if (key.downArrow) {
            setSelectedIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
        }
        else if (key.return) {
            if (files[selectedIndex]) {
                onSelect(files[selectedIndex]);
            }
        }
        else if (key.escape || input === 'q') {
            onExit();
        }
    });
    if (files.length === 0) {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, children: "No unfilled files found" }), _jsx(Text, { dimColor: true, children: "Create some topic files first using the 'create' action" }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Press ESC or 'q' to go back" }) })] }));
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, children: "Select a file:" }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: files.map((file, index) => (_jsx(Box, { children: _jsxs(Text, { ...(index === selectedIndex ? { color: 'cyan' } : {}), children: [index === selectedIndex ? '➤ ' : '  ', 'topic' in file
                                ? `${file.topic} (${file.fileName})`
                                : 'metadata' in file && file.metadata?.topic
                                    ? `${file.metadata.topic} (${file.fileName})`
                                    : file.fileName] }) }, file.path))) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Use \u2191/\u2193 arrows to navigate, Enter to select, ESC/q to exit" }) })] }));
}
