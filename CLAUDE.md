# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CLI application for managing LLM prompts and outputs, built with React Ink and TypeScript. The application serves as a systematic way to store, version, and organize prompt templates alongside their corresponding LLM-generated outputs.

## Development Commands

**Essential Development Flow:**
```bash
# After any source code modification, ALWAYS run:
pnpm run check

# If lint errors need fixing:
pnpm run lint:fix
pnpm run check  # Re-verify

# Other commands:
pnpm run build      # TypeScript compilation to dist/
pnpm run dev        # Development mode with tsx
pnpm run typecheck  # Fast type checking (no compilation)
pnpm run format     # Code formatting with Biome
pnpm run test       # Run Vitest tests
pnpm run test:watch # Watch mode for tests
```

**Quality Assurance:**
- `pnpm run check` combines typecheck + lint for comprehensive validation
- Always run `pnpm run check` before committing changes
- Use `pnpm run lint:fix` for automatic corrections

## Architecture

### Tech Stack
- **CLI Framework**: React Ink for interactive terminal UI
- **Language**: TypeScript with strict configuration
- **Package Manager**: pnpm
- **Build Tools**: TypeScript compiler, tsx for development
- **Quality Tools**: Biome (formatting/linting) + Oxlint
- **Testing**: Vitest
- **TOML Parsing**: smol-toml library

### Directory Structure
```
vault/                    # User's prompt management directory
├── {prompt-name}/       # Individual prompt directories (supports Japanese)
│   ├── prompt.toml      # Template + version + changelog
│   └── outputs/         # Generated output files
src/
├── utils/               # Core business logic utilities
├── components/          # React Ink UI components
├── cli.tsx              # Main CLI application component
└── index.tsx            # Entry point with arg parsing
bin/prompts-cli          # Executable shim
```

### Data Flow Architecture

**1. Application Bootstrap (src/index.tsx):**
- Parses command-line arguments (--model, --help, --version, --vault)
- No external CLI library - uses process.argv directly
- Renders React Ink app with parsed configuration

**2. State Management (src/cli.tsx):**
- Uses React hooks for state: 'loading' | 'selecting' | 'processing' | 'success' | 'error'
- Manages vault scanning, prompt selection, and output generation flow
- Handles errors with user-friendly messages

**3. Core Utilities Pattern:**
- `promptManager`: Vault directory scanning and validation
- `tomlParser`: Parse prompt.toml with version extraction (latest = changelog[0])
- `clipboard`: macOS pbpaste/pbcopy integration
- `fileManager`: Output file generation with frontmatter

**4. UI Components (React Ink):**
- `PromptList`: Interactive selection with arrow keys and enter
- State-driven UI that responds to application state changes
- Graceful error handling and user feedback

### Critical Implementation Details

**TOML Version System:**
- Latest version is always changelog array index 0
- Each prompt.toml contains template + version + changelog array
- Output files use frontmatter with exact order: version, model, timestamp

**Output File Format:**
```markdown
---
version: "1.2.0"
model: "claude-sonnet-4"
timestamp: "2025-07-07T17:12:41Z"
---
[user content from clipboard]
```

**Model Handling:**
- Default: "claude-sonnet-4"
- Supports: "claude-opus-4"
- CLI accepts: --model opus4 or -m opus4 (normalized internally)

**Clipboard Integration:**
- Uses macOS pbpaste for input (macOS-specific dependency)
- Input content becomes output file body (after frontmatter)

**Type Safety Notes:**
- Uses Node.js standard APIs (node:fs/promises, node:path)
- Strict TypeScript configuration with noPropertyAccessFromIndexSignature
- Index signature access requires bracket notation for TOML parsing

**Build Configuration:**
- ESM modules (type: "module" in package.json)
- Biome excludes .claude/ directory to avoid linting development tools
- Executable bin/prompts-cli references compiled dist/index.js

## Project Management
- Implement tasks according to @TODO.md. Update the Tasklist in TODO.md as work progresses.
