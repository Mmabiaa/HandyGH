# Code Quality Guidelines

This document describes the code quality tools and standards used in the HandyGH backend project.

## Tools

### 1. Black - Code Formatter
Black is an opinionated code formatter that ensures consistent code style.

**Configuration**: `pyproject.toml`

**Usage**:
```bash
# Format all code
make format

# Check formatting without changes
make format-check

# Or directly
black apps core handygh
```

**Settings**:
- Line length: 100 characters
- Target Python versions: 3.11, 3.12, 3.13

### 2. isort - Import Sorter
isort automatically sorts and organizes imports.

**Configuration**: `pyproject.toml`

**Usage**:
```bash
# Sort imports (included in make format)
isort apps core handygh

# Check import sorting
isort --check-only apps core handygh
```

**Import Order**:
1. Future imports
2. Standard library
3. Django
4. Third-party packages
5. First-party (apps, core, handygh)
6. Local folder imports

### 3. Flake8 - Linter
Flake8 checks for code style issues and potential bugs.

**Configuration**: `.flake8`

**Usage**:
```bash
# Run linting
make lint

# Or directly
flake8 apps core handygh
```

**Key Rules**:
- Max line length: 100
- Max complexity: 10
- Compatible with Black formatting

### 4. Pylint - Advanced Linter
Pylint provides additional code quality checks.

**Configuration**: `pyproject.toml`

**Usage**:
```bash
# Run pylint (included in make lint)
pylint apps core handygh --rcfile=pyproject.toml
```

### 5. MyPy - Type Checker
MyPy performs static type checking (optional but recommended).

**Configuration**: `pyproject.toml`

**Usage**:
```bash
# Run type checking
make typecheck

# Or directly
mypy apps core
```

### 6. Bandit - Security Checker
Bandit finds common security issues in Python code.

**Configuration**: `pyproject.toml`

**Usage**:
```bash
# Run security checks
make security

# Or directly
bandit -r apps core -c pyproject.toml
```

### 7. Pre-commit Hooks
Pre-commit automatically runs checks before each commit.

**Configuration**: `.pre-commit-config.yaml`

**Setup**:
```bash
# Install hooks
make pre-commit

# Or directly
pre-commit install
```

**Run manually**:
```bash
# Run on all files
make pre-commit-all

# Or directly
pre-commit run --all-files
```

## Quick Commands

### Daily Development
```bash
# Format code before committing
make format

# Run all checks
make check

# Run comprehensive checks
make check-all
```

### Before Committing
```bash
# Format and check everything
make format
make check
```

### CI/CD Pipeline
```bash
# Run in CI
make format-check  # Verify formatting
make lint          # Check code quality
make test          # Run tests
make coverage      # Generate coverage report
```

## Code Style Guidelines

### General Rules
1. **Line Length**: Maximum 100 characters
2. **Imports**: Organized by isort, grouped logically
3. **Docstrings**: Use for all public modules, classes, and functions
4. **Type Hints**: Encouraged but not required
5. **Naming Conventions**:
   - Classes: `PascalCase`
   - Functions/Variables: `snake_case`
   - Constants: `UPPER_SNAKE_CASE`
   - Private methods: `_leading_underscore`

### Django-Specific
1. **Models**: One model per file when complex, or group related models
2. **Views**: Use class-based views for consistency
3. **Serializers**: Keep validation logic in serializers
4. **Services**: Business logic goes in service classes
5. **Tests**: Organize by type (unit, integration, api)

### Example Code Structure
```python
"""
Module docstring explaining purpose.
"""
from typing import Optional

from django.db import models
from rest_framework import serializers

from apps.users.models import User


class MyService:
    """Service class for handling business logic."""

    @staticmethod
    def process_data(user: User, data: dict) -> Optional[dict]:
        """
        Process user data.

        Args:
            user: The user instance
            data: Dictionary of data to process

        Returns:
            Processed data dictionary or None if invalid

        Raises:
            ValidationError: If data is invalid
        """
        # Implementation here
        pass
```

## Continuous Integration

The following checks run automatically on every pull request:

1. **Code Formatting**: Black and isort
2. **Linting**: Flake8 and Pylint
3. **Type Checking**: MyPy (warnings only)
4. **Security**: Bandit
5. **Tests**: Full test suite with coverage
6. **Coverage**: Must maintain ≥70% coverage

## Troubleshooting

### Black and Flake8 Conflicts
The configuration is set up to avoid conflicts. If you see issues:
- Ensure you're using the latest versions
- Check that `.flake8` ignores E203, W503, E501

### Import Sorting Issues
If isort produces unexpected results:
```bash
# Show what would change
isort --diff apps core handygh

# Check configuration
isort --show-files
```

### Pre-commit Hook Failures
If pre-commit hooks fail:
```bash
# Skip hooks temporarily (not recommended)
git commit --no-verify

# Fix issues and try again
make format
git add .
git commit
```

### Performance Issues
If tools are slow:
```bash
# Run on specific files only
black apps/users/
flake8 apps/users/

# Use parallel processing
black --fast apps core handygh
```

## Editor Integration

### VS Code
Install extensions:
- Python (Microsoft)
- Pylance
- Black Formatter
- isort

Add to `.vscode/settings.json`:
```json
{
    "python.formatting.provider": "black",
    "python.linting.enabled": true,
    "python.linting.flake8Enabled": true,
    "python.linting.pylintEnabled": true,
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    }
}
```

### PyCharm
1. Go to Settings → Tools → Black
2. Enable "On save"
3. Go to Settings → Tools → External Tools
4. Add flake8, isort, pylint

## Resources

- [Black Documentation](https://black.readthedocs.io/)
- [isort Documentation](https://pycqa.github.io/isort/)
- [Flake8 Documentation](https://flake8.pycqa.org/)
- [Pylint Documentation](https://pylint.pycqa.org/)
- [MyPy Documentation](https://mypy.readthedocs.io/)
- [Bandit Documentation](https://bandit.readthedocs.io/)
- [Pre-commit Documentation](https://pre-commit.com/)
