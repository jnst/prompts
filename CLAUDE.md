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

# Run specific tests:
pnpm run test src/utils/fileManager.test.ts     # Single test file
pnpm run test src/utils/                        # All tests in directory
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
- **Error Handling**: neverthrow Result types for functional error handling

### Directory Structure
```
vault/                    # User's prompt management directory
├── {prompt-name}/       # Individual prompt directories (supports Japanese)
│   ├── prompt.toml      # Metadata + prompts array with version history
│   └── outputs/         # Generated output files
src/
├── errors/              # Custom error types and neverthrow integration
├── utils/               # Core business logic utilities
├── components/          # React Ink UI components
├── cli.tsx              # Main CLI application component
└── index.tsx            # Entry point with arg parsing
bin/prompt               # Executable shim
ERROR_SPECIFICATION.md   # Comprehensive error handling documentation
```

### Data Flow Architecture

**1. Application Bootstrap (src/index.tsx):**
- Parses command-line arguments (--model, --help, --version, --vault)
- No external CLI library - uses process.argv directly
- Renders React Ink app with parsed configuration

**2. State Management (src/cli.tsx):**
- Uses React hooks for state: 'loading' | 'selecting' | 'action-selecting' | 'topic-input' | 'processing' | 'success' | 'error'
- Manages vault scanning, prompt selection, action selection, and output generation flow
- Action-oriented workflow: prompt selection → action selection → topic input (for create) → processing
- Handles errors with user-friendly messages

**3. Core Utilities Pattern (Result-based Error Handling):**
- `promptManager`: Vault directory scanning and validation → Result<PromptInfo[], VaultError>
- `tomlParser`: Parse prompt.toml with metadata/prompts structure → Result<PromptTemplate, TomlError>
- `clipboard`: macOS pbpaste/pbcopy integration → Result<{content, warnings}, ClipboardError>
- `fileManager`: Output file generation with frontmatter → Result<string, OutputError>
- `promptProcessor`: Template variable replacement ({{topic}} → actual values) → Result<ProcessedPrompt, ValidationError>

**4. UI Components (React Ink):**
- `PromptList`: Interactive selection with arrow keys and enter
- `ActionList`: Action selection UI (create/fill) with keyboard navigation
- `TopicInput`: Text input component for topic entry with validation
- State-driven UI that responds to application state changes
- Graceful error handling and user feedback
- Raw mode detection with fallback UI for non-interactive environments
- React keys use stable identifiers (not array indices)

### Error Handling Architecture

**neverthrow Result Types:**
- All async operations return `Result<T, E>` instead of throwing exceptions
- Error types defined in `src/errors/index.ts` with specific categories:
  - **Filesystem**: VaultNotFoundError, VaultAccessError, OutputWriteError
  - **Configuration**: TomlSyntaxError, TomlStructureError, TomlVersionFormatError
  - **Input**: ClipboardEmptyError, ClipboardBinaryError, ClipboardTooLargeError
  - **Validation**: ModelValidationError, ValidationError
- Warnings (non-fatal) handled separately from errors using PromptsWarning class
- CLI layer (cli.tsx) processes Results with `.isErr()` and `.value` pattern

**Error Message Design:**
- Two-line format: `[Problem description]\n[Solution/example]`
- Context-aware with file paths and specific guidance
- Detailed specification in `ERROR_SPECIFICATION.md`

### Critical Implementation Details

**TOML Version System:**
- New structure with [metadata] section and [[prompts]] array
- current_version in metadata points to the active version
- Each prompt.toml contains metadata + prompts array with version history
- Output files use frontmatter with exact order: version, model, timestamp

**TOML Structure Format:**
```toml
[metadata]
current_version = "1.0.0"
created_at = "2025-07-07T00:00:00Z"
updated_at = "2025-07-07T00:00:00Z"

[[prompts]]
version = "1.0.0"
content = """
Your prompt template here with {{placeholders}}
"""
created_at = "2025-07-07T00:00:00Z"
```

**Output File Formats:**

*Standard Output (from clipboard):*
```markdown
---
version: "1.2.0"
model: "claude-sonnet-4"
timestamp: "2025-07-07T17:12:41Z"
---
[user content from clipboard]
```

*Topic File (create action):*
```markdown
---
topic: "example-topic"
prompt_version: "1.0.0"
timestamp: "2025-07-07T17:12:41Z"
---

[empty body for user to fill]
```

**Model Handling:**
- Default: "claude-sonnet-4"
- Supports: "claude-opus-4"
- CLI accepts: --model opus4 or -m opus4 (normalized internally)
- Model validation occurs at CLI entry point and fails fast for invalid models
- `normalizeModelName()` returns original input for unknown models (no silent defaults)

**Clipboard Integration:**
- Uses macOS pbpaste for input and pbcopy for output (macOS-specific dependency)
- Input content becomes output file body (after frontmatter)
- Output: processed prompt templates copied to clipboard for LLM usage

**Type Safety Notes:**
- Uses Node.js standard APIs (node:fs/promises, node:path)
- Strict TypeScript configuration with noPropertyAccessFromIndexSignature
- Index signature access requires bracket notation for TOML parsing
- neverthrow Result types provide compile-time error handling safety
- All utility functions use functional error handling patterns

**Build Configuration:**
- ESM modules (type: "module" in package.json)
- Biome excludes .claude/ directory to avoid linting development tools
- Executable bin/prompt references compiled dist/index.js

## Development Patterns

**Error Handling Requirements:**
- ALWAYS use neverthrow Result types for functions that can fail
- Define custom error classes extending PromptsError in `src/errors/index.ts`
- Process Results in CLI layer with proper `.isErr()` checks
- Use PromptsWarning for non-fatal issues that don't stop execution
- Follow ERROR_SPEC.md for consistent error message format

**Code Quality Standards:**
- Run `pnpm run check` after ANY code changes before committing
- All async utilities must return Result<T, E> instead of throwing
- Import neverthrow types as: `import { type Result, ok, err } from 'neverthrow'`
- Use biome/oxlint auto-fixes via `pnpm run lint:fix`

**Testing Patterns:**
- All tests must handle neverthrow Result types properly:
  - Use `result.isOk()` and `result.isErr()` for validation
  - Access values with `result.value` after confirming `result.isOk()`
  - Access errors with `result.error` after confirming `result.isErr()`
  - Add TypeScript type guards: `if (result.isErr()) return;`
- Test file naming: `*.test.ts` in same directory as source
- 31 comprehensive tests cover all utilities (clipboard, tomlParser, fileManager, promptManager)

## Action-Oriented Workflow

**Core User Flow:**
1. **Prompt Selection**: User selects a prompt from vault directory
2. **Action Selection**: Choose between 'create' (topic-based file) or 'fill' (existing file)
3. **Topic Input**: For 'create' action, user enters topic name
4. **Processing**: Template variables ({{topic}}) replaced with actual values
5. **Output**: Topic file created + processed prompt copied to clipboard

**Template Variable System:**
- Prompts can contain `{{topic}}` placeholders
- `promptProcessor.ts` extracts and replaces template variables
- `extractVariables()` finds all `{{variable}}` patterns in templates
- `processTemplate()` performs variable substitution with validation
- `processTopicTemplate()` convenience function for single topic replacement

**File Management:**
- `createTopicFile()` generates topic-specific files with custom frontmatter
- Topic files use different frontmatter format (topic, prompt_version, timestamp)
- Files created with empty body for user to fill with LLM responses

## Project Management
- Implement tasks according to @TODO.md. Update the Tasklist in TODO.md as work progresses.
