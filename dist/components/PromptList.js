import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text, useInput, useStdin } from 'ink';
import { useEffect, useState } from 'react';
export function PromptList({ prompts, onSelect, onExit }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { isRawModeSupported } = useStdin();
    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex((prev) => Math.max(0, prev - 1));
        }
        else if (key.downArrow) {
            setSelectedIndex((prev) => Math.min(prompts.length - 1, prev + 1));
        }
        else if (key.return) {
            if (prompts[selectedIndex]) {
                onSelect(prompts[selectedIndex]);
            }
        }
        else if (key.escape || input === 'q') {
            onExit();
        }
    }, {
        isActive: isRawModeSupported,
    });
    useEffect(() => {
        // Reset selection if prompts change
        setSelectedIndex(0);
    }, []);
    if (prompts.length === 0) {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "red", children: "No prompts found in vault/ directory" }), _jsx(Text, { dimColor: true, children: "Make sure your vault directory exists and contains prompt directories with prompt.toml files" }), _jsx(Text, { dimColor: true, children: "Press ESC or 'q' to exit" })] }));
    }
    if (!isRawModeSupported) {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Interactive mode not supported in this environment" }), _jsx(Text, { children: "Available prompts:" }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: prompts.map((prompt, index) => (_jsx(Box, { paddingLeft: 2, children: _jsxs(Text, { children: [index + 1, ". ", prompt.name, !prompt.hasToml && (_jsx(Text, { color: "yellow", children: " (no prompt.toml)" }))] }) }, prompt.name))) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Run in a terminal that supports interactive input to use selection UI" }) })] }));
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, children: "Select a prompt template:" }), _jsx(Text, { dimColor: true, children: "Use \u2191/\u2193 arrows to navigate, Enter to select, ESC/q to exit" }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: prompts.map((prompt, index) => (_jsx(Box, { paddingLeft: 2, children: _jsxs(Text, { color: index === selectedIndex ? 'cyan' : 'white', children: [index === selectedIndex ? '▶ ' : '  ', prompt.name, !prompt.hasToml && _jsx(Text, { color: "yellow", children: " (no prompt.toml)" })] }) }, prompt.name))) })] }));
}
