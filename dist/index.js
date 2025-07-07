#!/usr/bin/env node
import { jsx as _jsx } from "react/jsx-runtime";
import { render } from 'ink';
import { Cli } from './cli.js';
// Parse command line arguments
const args = process.argv.slice(2);
let model = 'claude-sonnet-4';
let vaultPath = 'vault';
let showHelp = false;
let showVersion = false;
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
        showHelp = true;
    }
    else if (arg === '--version' || arg === '-v') {
        showVersion = true;
    }
    else if (arg === '--model' || arg === '-m') {
        const nextArg = args[i + 1];
        if (nextArg) {
            model = nextArg;
            i++; // Skip next argument as it's the model value
        }
    }
    else if (arg === '--vault') {
        const nextArg = args[i + 1];
        if (nextArg) {
            vaultPath = nextArg;
            i++; // Skip next argument as it's the vault path
        }
    }
}
if (showHelp) {
    console.log(`
prompts-cli - LLM Prompt Management CLI

Usage: prompts-cli [options]

Options:
  -m, --model <model>    Model to use (sonnet4, opus4) [default: sonnet4]
  -v, --version          Show version number
  -h, --help            Show this help message
  --vault <path>        Vault directory path [default: vault]

Examples:
  prompts-cli                    # Use default model (sonnet4)
  prompts-cli -m opus4          # Use opus4 model
  prompts-cli --vault ./my-vault # Use custom vault directory
`);
    process.exit(0);
}
if (showVersion) {
    // Read version from package.json
    try {
        const packageJson = await import('../package.json', {
            assert: { type: 'json' },
        });
        console.log(packageJson.default.version);
    }
    catch {
        console.log('1.0.0');
    }
    process.exit(0);
}
// Render the CLI app
const renderOptions = {
    exitOnCtrlC: false,
    ...(process.stdin.isTTY === true ? { stdin: process.stdin } : {}),
};
render(_jsx(Cli, { model: model, vaultPath: vaultPath }), renderOptions);
