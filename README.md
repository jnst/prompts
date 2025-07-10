# Prompts - LLM Prompt Management CLI

A systematic CLI tool for managing LLM prompts and outputs, built with React Ink and TypeScript.

## Features

- **Interactive Prompt Selection**: Browse and select from organized prompt templates
- **Action-Oriented Workflow**: Create new files, fill existing files, or manage outputs
- **Template Variable Support**: Use `{{topic}}` placeholders for dynamic content
- **Version Management**: TOML-based prompt versioning with metadata
- **Clipboard Integration**: Seamless macOS clipboard input/output
- **File Management**: Create, fill, reset, and delete output files

## Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Make the binary executable
chmod +x bin/prompt
```

## Usage

### Basic Commands

```bash
# Launch interactive prompt selector
./bin/prompt

# Specify model (default: claude-sonnet-4)
./bin/prompt --model opus4
./bin/prompt -m opus4

# Show help
./bin/prompt --help

# Show version
./bin/prompt --version
```

### Workflow

1. **Prompt Selection**: Choose from available prompts in the `vault/` directory
2. **Action Selection**: Choose what to do with the selected prompt:
   - **create**: Generate a new topic-based file
   - **fill**: Fill an existing empty file with clipboard content
   - **reset**: Clear file content while preserving frontmatter
   - **delete**: Remove files completely

### Directory Structure

```
vault/                    # Prompt management directory
├── {prompt-name}/       # Individual prompt directories
│   ├── prompt.toml      # Prompt metadata and versions
│   └── outputs/         # Generated output files
```

### Prompt Template Format

Create `prompt.toml` files with this structure:

```toml
[metadata]
current_version = "1.0.0"
created_at = "2025-07-07T00:00:00Z"
updated_at = "2025-07-07T00:00:00Z"

[[prompts]]
version = "1.0.0"
content = """
Your prompt template here with {{topic}} placeholders
"""
created_at = "2025-07-07T00:00:00Z"
```

### Output File Formats

**Topic Files** (created by `create` action):
```markdown
---
topic: "example-topic"
prompt_version: "1.0.0"
timestamp: "2025-07-07T17:12:41Z"
---

[empty body for LLM responses]
```

**Standard Output Files** (created by `fill` action):
```markdown
---
version: "1.2.0"
model: "claude-sonnet-4"
timestamp: "2025-07-07T17:12:41Z"
---
[content from clipboard]
```

## Development

### Essential Commands

```bash
# After any code changes, always run:
pnpm run check

# Fix linting errors automatically:
pnpm run lint:fix
pnpm run check  # Re-verify

# Other development commands:
pnpm run build      # TypeScript compilation
pnpm run dev        # Development mode
pnpm run test       # Run tests
pnpm run test:watch # Watch mode for tests
```

### Project Structure

```
src/
├── components/          # React Ink UI components
├── utils/              # Core business logic
├── errors/             # Error handling with neverthrow
├── cli.tsx             # Main CLI component
└── index.tsx           # Entry point
```

## Requirements

- Node.js >= 18.0.0
- macOS (for clipboard integration)
- pnpm package manager

## License

MIT