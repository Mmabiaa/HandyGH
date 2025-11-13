# Pre-commit Hooks Setup

## Important Note

The pre-commit hooks are configured at the **repository root** (`.pre-commit-config.yaml` in the root directory), not in the `backend/` directory.

This is because pre-commit hooks must be installed at the Git repository root to work properly.

## Configuration Files Location

- **Pre-commit config**: `/.pre-commit-config.yaml` (root)
- **Code quality configs**: `/backend/pyproject.toml`, `/backend/.flake8` (backend directory)

The pre-commit hooks are configured to:
1. Only run on files in the `backend/` directory (`files: ^backend/`)
2. Reference configuration files in the `backend/` directory

## Installation

From the repository root:

```bash
# Install pre-commit hooks
pre-commit install

# Run on all files
pre-commit run --all-files
```

## How It Works

When you commit from anywhere in the repository:
1. Pre-commit runs from the Git root
2. It only checks files matching `^backend/` pattern
3. It uses config files from `backend/` directory
4. All Python code quality checks apply only to backend code

## Troubleshooting

If pre-commit hooks fail:

1. **Config file not found errors**: Make sure you're committing from the repository root, not from `backend/`
2. **Python version errors**: The hooks use `python3` (your system Python)
3. **Hook failures**: Run `pre-commit run --all-files` to see detailed errors

## Manual Commands

You can still run code quality tools manually from the `backend/` directory:

```bash
cd backend

# Format code
make format

# Run linting
make lint

# Run all checks
make check
```
