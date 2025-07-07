# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CLI application for managing LLM prompts and outputs, built with React Ink and TypeScript. The application serves as a systematic way to store, version, and organize prompt templates alongside their corresponding LLM-generated outputs.

## Architecture

### Directory Structure
- `vault/` - Prompt template management directory
  - Each prompt has its own subdirectory (supports Japanese names)
  - `prompt.toml` - Contains prompt template, version history, and changelog
  - `outputs/` - Stores LLM-generated outputs for each prompt
- `src/` - React Ink CLI application source code (to be implemented)

### Prompt Versioning System
- Version management is handled via `prompt.toml` with a changelog array
- CLI reads the latest version (array index 0) from the TOML file
- Each output file contains version information in frontmatter

### Output File Format
All output files use frontmatter with this exact order:
```markdown
---
version: "1.2.0"
model: "claude-sonnet-4"
timestamp: "2025-07-07T17:12:41"
---
```

### Model Selection
- Default: `claude-sonnet-4`
- Alternative: `claude-opus-4` (via CLI option)
- CLI should accept `--model opus4` or `-m opus4` flags

## CLI Workflow
1. Scan `vault/` directory for prompt templates
2. Display interactive prompt selection list
3. Read latest version from selected `prompt.toml`
4. Accept input from clipboard (via pbcopy)
5. Save to corresponding `outputs/` directory with proper frontmatter

## Development Commands

This project uses a modern, lightweight tech stack:
- React Ink for CLI interface
- TypeScript for type safety  
- pnpm for package management
- Biome for formatting and linting
- Oxlint for additional linting
- Vitest for testing
- tsx for development execution
- smol-toml for TOML parsing

Key dependencies:
- Runtime: `ink`, `react`, `smol-toml`
- Dev: `@biomejs/biome`, `oxlint`, `vitest`, `tsx`
- Note: No CLI argument library needed (React Ink handles this via process.argv)

Standard commands (to be implemented):
- `pnpm run build` - Build the CLI application
- `pnpm run dev` - Development mode with tsx
- `pnpm run lint` - Code linting (Biome + Oxlint)
- `pnpm run format` - Code formatting (Biome)
- `pnpm run test` - Run tests (Vitest)

## Key Implementation Notes

- Support for Japanese directory names and content
- Clipboard integration for input (pbcopy/pbpaste)
- Proper timestamp formatting in ISO format
- Version extraction from TOML changelog arrays (index 0 = latest)
- Interactive prompt selection interface using React Ink
- Use Node.js standard APIs (node:fs/promises, node:path) instead of fs-extra
- CLI argument parsing via process.argv, no external library needed

## Implementation Structure

Core utilities:
- `src/utils/promptManager.ts` - Scan vault/ directory for prompts
- `src/utils/tomlParser.ts` - Parse prompt.toml files with smol-toml
- `src/utils/clipboard.ts` - Handle pbpaste command execution
- `src/utils/fileManager.ts` - Generate frontmatter and save output files

React Ink components:
- `src/components/PromptList.tsx` - Interactive prompt selection
- `src/components/ModelSelector.tsx` - Model selection (optional)
- `src/cli.tsx` - Main CLI application component

The application follows a three-phase implementation:
1. MVP: Basic prompt selection and file output
2. Feature expansion: Model selection, error handling, TOML version management
3. Quality: Testing, documentation, performance optimization