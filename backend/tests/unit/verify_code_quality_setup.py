"""
Verification script for code quality tool configurations.
This script checks that all configuration files are present and valid.
"""

import os
import sys
from pathlib import Path


def check_file_exists(filepath, description):
    """Check if a file exists and report status."""
    if os.path.exists(filepath):
        print(f"✓ {description}: {filepath}")
        return True
    else:
        print(f"✗ {description} NOT FOUND: {filepath}")
        return False


def check_yaml_valid(filepath):
    """Check if YAML file is valid."""
    try:
        import yaml

        with open(filepath, "r") as f:
            yaml.safe_load(f)
        return True
    except ImportError:
        print("  ⚠ PyYAML not installed, skipping YAML validation")
        return True
    except Exception as e:
        print(f"  ✗ YAML validation failed: {e}")
        return False


def check_toml_valid(filepath):
    """Check if TOML file is valid."""
    try:
        import tomli

        with open(filepath, "rb") as f:
            tomli.load(f)
        return True
    except ImportError:
        # Try tomllib (Python 3.11+)
        try:
            import tomllib

            with open(filepath, "rb") as f:
                tomllib.load(f)
            return True
        except ImportError:
            print("  ⚠ tomli/tomllib not installed, skipping TOML validation")
            return True
    except Exception as e:
        print(f"  ✗ TOML validation failed: {e}")
        return False


def main():
    """Main verification function."""
    print("=" * 60)
    print("Code Quality Tools Configuration Verification")
    print("=" * 60)
    print()

    all_valid = True

    # Check configuration files
    print("Checking configuration files...")
    print("-" * 60)

    configs = [
        (".flake8", "Flake8 configuration"),
        ("pyproject.toml", "Black/isort/mypy/pylint configuration"),
        (".pre-commit-config.yaml", "Pre-commit hooks configuration"),
        ("Makefile", "Makefile for quality commands"),
        ("CODE_QUALITY.md", "Code quality documentation"),
    ]

    for filepath, description in configs:
        if not check_file_exists(filepath, description):
            all_valid = False

    print()

    # Validate YAML files
    if os.path.exists(".pre-commit-config.yaml"):
        print("Validating YAML configuration...")
        print("-" * 60)
        if not check_yaml_valid(".pre-commit-config.yaml"):
            all_valid = False
        print()

    # Validate TOML files
    if os.path.exists("pyproject.toml"):
        print("Validating TOML configuration...")
        print("-" * 60)
        if not check_toml_valid("pyproject.toml"):
            all_valid = False
        print()

    # Check if tools are installed
    print("Checking installed tools...")
    print("-" * 60)

    tools = [
        ("black", "Black code formatter"),
        ("flake8", "Flake8 linter"),
        ("isort", "isort import sorter"),
        ("pylint", "Pylint linter"),
        ("mypy", "MyPy type checker"),
        ("pre-commit", "Pre-commit hooks"),
        ("bandit", "Bandit security checker"),
    ]

    tools_installed = True
    for tool, description in tools:
        try:
            __import__(tool.replace("-", "_"))
            print(f"✓ {description} installed")
        except ImportError:
            print(f"✗ {description} NOT installed")
            tools_installed = False

    print()

    # Summary
    print("=" * 60)
    print("Summary")
    print("=" * 60)

    if all_valid and tools_installed:
        print("✓ All configuration files are present and valid")
        print("✓ All tools are installed")
        print()
        print("You can now use:")
        print("  - make format       : Format code")
        print("  - make lint         : Run linting")
        print("  - make check        : Run all checks")
        print("  - make pre-commit   : Install pre-commit hooks")
        return 0
    elif all_valid and not tools_installed:
        print("✓ All configuration files are present and valid")
        print("✗ Some tools are not installed")
        print()
        print("To install tools, run:")
        print("  pip install -r requirements/development.txt")
        print("  or")
        print("  setup_code_quality.bat")
        return 1
    else:
        print("✗ Some configuration files are missing or invalid")
        print()
        print("Please check the errors above and fix them.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
