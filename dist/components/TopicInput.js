import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
export function TopicInput({ onSubmit, onCancel }) {
    const [input, setInput] = useState('');
    useInput((inputChar, key) => {
        if (key.return) {
            const trimmed = input.trim();
            if (trimmed.length > 0) {
                onSubmit(trimmed);
            }
        }
        else if (key.escape) {
            onCancel();
        }
        else if (key.backspace || key.delete) {
            setInput((prev) => prev.slice(0, -1));
        }
        else if (inputChar && !key.ctrl) {
            setInput((prev) => prev + inputChar);
        }
    });
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, children: "Create new topic file" }), _jsx(Text, { dimColor: true, children: "Enter topic name (press Enter to confirm, ESC to cancel):" }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { color: "cyan", children: "Topic: " }), _jsxs(Text, { children: [input, _jsx(Text, { backgroundColor: "white", color: "black", children: ' ' })] })] }), input.trim().length === 0 && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Please enter a topic name" }) }))] }));
}
