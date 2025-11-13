# Testing and Code Quality Guide

This document provides a comprehensive guide to testing and code quality practices for the HandyGH backend project.

## Table of Contents

1. [Code Quality Tools](#code-quality-tools)
2. [Testing Framework](#testing-framework)
3. [Running Tests](#running-tests)
4. [Code Coverage](#code-coverage)
5. [Pre-commit Hooks](#pre-commit-hooks)
6. [Continuous Integration](#continuous-integration)
7. [Best Practices](#best-practices)

## Code Quality Tools

### Installed Tools

All code quality tools are configured and ready to use:

- **Black** (24.1.1) - Code formatter
- **isort** (5.13.2) - Import sorter
- **Flake8** (7.0.0) - Linter with plugins:
  - flake8-bugbear - Additional bug detection
  - flake8-comprehensions - Comprehension improvements
  - flake8-simplify - Code simplification suggestions
- **Pylint** (3.0.3) - Advanced linter
- **MyPy** (1.8.0) - Type checker
- **Bandit** (1.7.6) - Security checker
- **Pre-commit** (3.6.0) - Git hooks manager

### Quick Commands

```bash
# Format code
make format

# Check formatting without changes
make format-check

# Run linting
make lint

# Run all quality checks
make check

# Run comprehensive checks (includes type checking and security)
make check-all

# Install pre-commit hooks
make pre-commit

# Run pre-commit on all files
make pre-commit-all
```

### Configuration Files

- `.flake8` - Flake8 configuration
- `pyproject.toml` - Black, isort, mypy, pylint, bandit configuration
- `.pre-commit-config.yaml` - Pre-commit hooks configuration
- `Makefile` - Convenient command shortcuts

## Testing Framework

### Test Structure

```
tests/
├── unit/                    # Unit tests for services and business logic
│   ├── test_otp_service.py
│   ├── test_jwt_service.py
│   ├── test_booking_service.py
│   └── ...
├── integration/             # Integration tests for workflows
│   ├── test_auth_flow.py
│   └── test_payment_flow.py
├── api/                     # API endpoint tests
│   ├── test_auth_endpoints.py
│   ├── test_booking_endpoints.py
│   └── ...
└── conftest.py             # Shared fixtures and configuration
```

### Test Tools

- **pytest** - Test framework
- **pytest-django** - Django integration
- **pytest-cov** - Coverage reporting
- **pytest-mock** - Mocking utilities
- **factory-boy** - Test data factories
- **faker** - Realistic test data generation

## Running Tests

### Basic Test Commands

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/unit/test_otp_service.py

# Run specific test
pytest tests/unit/test_otp_service.py::test_generate_otp

# Run tests matching pattern
pytest -k "otp"

# Run with verbose output
pytest -v

# Run with print statements
pytest -s
```

### Using Make Commands

```bash
# Run all tests
make test

# Run with coverage
make coverage
```

## Code Coverage

### Generating Coverage Reports

```bash
# Generate HTML coverage report
pytest --cov=apps --cov=core --cov-report=html --cov-report=term-missing

# View HTML report
# Open htmlcov/index.html in browser

# Generate terminal report only
pytest --cov=apps --cov=core --cov-report=term-missing
```

### Coverage Goals

- **Core business logic**: ≥70% coverage
- **API endpoints**: ≥80% coverage
- **Critical services**: ≥90% coverage (auth, payments, bookings)

### Coverage Configuration

Coverage settings are in `pyproject.toml`:

```toml
[tool.coverage.run]
source = ["apps", "core"]
omit = [
    "*/migrations/*",
    "*/tests/*",
    "*/test_*.py",
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise AssertionError",
    "raise NotImplementedError",
]
```

## Pre-commit Hooks

### What Are Pre-commit Hooks?

Pre-commit hooks automatically run checks before each commit to ensure code quality.

### Installation

**Important**: Pre-commit hooks must be installed from the repository root, not from the `backend/` directory.

```bash
# From repository root
cd ..  # if you're in backend/
pre-commit install

# Or from backend/ directory
cd backend
make pre-commit  # This will install from root
```

### What Gets Checked

1. **File checks**: Trailing whitespace, end-of-file, large files
2. **Code formatting**: Black, isort
3. **Linting**: Flake8 with plugins
4. **Django checks**: Django-upgrade
5. **Security**: Bandit

### Running Manually

```bash
# Run on all files
make pre-commit-all

# Or directly
pre-commit run --all-files

# Run specific hook
pre-commit run black --all-files
```

### Skipping Hooks (Not Recommended)

```bash
# Skip hooks for a commit (use sparingly)
git commit --no-verify
```

## Continuous Integration

### CI Pipeline

The following checks run automatically on every pull request:

1. **Code Formatting**
   - Black formatting check
   - isort import sorting check

2. **Linting**
   - Flake8 with all plugins
   - Pylint (warnings only)

3. **Type Checking**
   - MyPy static type analysis

4. **Security**
   - Bandit security scan

5. **Tests**
   - Full test suite
   - Coverage report (must maintain ≥70%)

### Local CI Simulation

Run the same checks locally before pushing:

```bash
# Run all checks
make check-all

# This runs:
# - Format check (black, isort)
# - Linting (flake8, pylint)
# - Type checking (mypy)
# - Security (bandit)
# - Tests with coverage
```

## Best Practices

### Code Style

1. **Line Length**: Maximum 100 characters
2. **Imports**: Organized by isort (stdlib → django → third-party → first-party)
3. **Docstrings**: Use for all public modules, classes, and functions
4. **Type Hints**: Encouraged for function signatures
5. **Naming**:
   - Classes: `PascalCase`
   - Functions/Variables: `snake_case`
   - Constants: `UPPER_SNAKE_CASE`
   - Private: `_leading_underscore`

### Testing Best Practices

1. **Test Organization**
   - Unit tests for individual functions/methods
   - Integration tests for workflows
   - API tests for endpoints

2. **Test Naming**
   - Use descriptive names: `test_create_booking_with_valid_data`
   - Follow pattern: `test_<what>_<condition>_<expected_result>`

3. **Test Structure** (AAA Pattern)
   ```python
   def test_something():
       # Arrange - Set up test data
       user = UserFactory()
       
       # Act - Perform the action
       result = some_function(user)
       
       # Assert - Verify the result
       assert result.status == "success"
   ```

4. **Fixtures**
   - Use fixtures for common setup
   - Keep fixtures in `conftest.py`
   - Use factory-boy for test data

5. **Mocking**
   - Mock external services (SMS, payment gateways)
   - Don't mock what you're testing
   - Use pytest-mock for mocking

### Common Issues and Solutions

#### Black and Flake8 Conflicts

The configuration is set up to avoid conflicts. If issues arise:
- Ensure `.flake8` ignores E203, W503, E501
- Run `black` before `flake8`

#### Import Sorting Issues

```bash
# Check what would change
isort --diff apps core handygh

# Apply changes
isort apps core handygh
```

#### Pre-commit Hook Failures

```bash
# See what failed
pre-commit run --all-files

# Fix issues
make format
make lint

# Try commit again
git add .
git commit
```

#### Test Failures

```bash
# Run with verbose output
pytest -v

# Run with print statements
pytest -s

# Run specific failing test
pytest tests/unit/test_something.py::test_specific_case -v
```

### Editor Integration

#### VS Code

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
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    }
}
```

#### PyCharm

1. Settings → Tools → Black → Enable "On save"
2. Settings → Tools → External Tools → Add flake8, isort
3. Settings → Editor → Code Style → Python → Set line length to 100

## Verification

To verify your code quality setup:

```bash
# Run verification script
python verify_code_quality_setup.py

# Should output:
# ✓ All configuration files are present and valid
# ✓ All tools are installed
```

## Resources

- [Black Documentation](https://black.readthedocs.io/)
- [isort Documentation](https://pycqa.github.io/isort/)
- [Flake8 Documentation](https://flake8.pycqa.org/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Pre-commit Documentation](https://pre-commit.com/)
- [CODE_QUALITY.md](CODE_QUALITY.md) - Detailed code quality guidelines

## Summary

The HandyGH backend has a comprehensive code quality and testing setup:

✅ Code formatting with Black and isort
✅ Linting with Flake8 and Pylint
✅ Type checking with MyPy
✅ Security scanning with Bandit
✅ Automated pre-commit hooks
✅ Comprehensive test suite with pytest
✅ Code coverage reporting
✅ CI/CD integration ready

Use `make check-all` before committing to ensure all checks pass!
