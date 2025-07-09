import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text, useInput } from 'ink';
import { useEffect, useState } from 'react';
export function ActionList({ actions, onSelect, onExit }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : actions.length - 1));
        }
        else if (key.downArrow) {
            setSelectedIndex((prev) => (prev < actions.length - 1 ? prev + 1 : 0));
        }
        else if (key.return) {
            const selectedAction = actions[selectedIndex];
            if (selectedAction) {
                onSelect(selectedAction);
            }
        }
        else if (key.escape || input === 'q') {
            onExit();
        }
    });
    useEffect(() => {
        setSelectedIndex(0);
    }, []);
    if (actions.length === 0) {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "red", children: "No actions available" }), _jsx(Text, { dimColor: true, children: "Press ESC or 'q' to exit" })] }));
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, children: "Select an action:" }), _jsx(Text, { dimColor: true, children: "Use \u2191/\u2193 arrows to navigate, Enter to select, ESC/q to exit" }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: actions.map((action, index) => (_jsx(Box, { paddingLeft: 2, children: _jsxs(Text, { color: index === selectedIndex ? 'cyan' : 'white', children: [index === selectedIndex ? '▶ ' : '  ', action.name, _jsxs(Text, { dimColor: true, children: [" - ", action.description] })] }) }, action.id))) })] }));
}
