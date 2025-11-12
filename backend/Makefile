# Makefile for HandyGH Backend

.PHONY: help install test coverage lint format check clean run migrate

# Default target
help:
	@echo "Available commands:"
	@echo "  make install       - Install dependencies"
	@echo "  make test          - Run tests"
	@echo "  make coverage      - Run tests with coverage report"
	@echo "  make lint          - Run linting checks (flake8, pylint)"
	@echo "  make format        - Format code with black and isort"
	@echo "  make check         - Run all quality checks (format, lint, test)"
	@echo "  make clean         - Remove generated files"
	@echo "  make run           - Run development server"
	@echo "  make migrate       - Run database migrations"
	@echo "  make pre-commit    - Install pre-commit hooks"

# Install dependencies
install:
	pip install -r requirements/development.txt

# Run tests
test:
	pytest

# Run tests with coverage
coverage:
	pytest --cov=apps --cov=core --cov-report=html --cov-report=term-missing

# Run linting
lint:
	@echo "Running flake8..."
	flake8 apps core handygh
	@echo "Running pylint..."
	pylint apps core handygh --rcfile=pyproject.toml || true

# Format code
format:
	@echo "Running black..."
	black apps core handygh
	@echo "Running isort..."
	isort apps core handygh

# Check code formatting without making changes
format-check:
	@echo "Checking black formatting..."
	black --check apps core handygh
	@echo "Checking isort..."
	isort --check-only apps core handygh

# Run all quality checks
check: format-check lint test

# Clean generated files
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	rm -rf htmlcov .coverage .pytest_cache
	rm -rf build dist

# Run development server
run:
	python manage.py runserver

# Run database migrations
migrate:
	python manage.py migrate

# Create new migrations
makemigrations:
	python manage.py makemigrations

# Install pre-commit hooks
pre-commit:
	pre-commit install
	@echo "Pre-commit hooks installed successfully!"

# Run pre-commit on all files
pre-commit-all:
	pre-commit run --all-files

# Security check with bandit
security:
	bandit -r apps core -c pyproject.toml

# Type checking with mypy
typecheck:
	mypy apps core

# Run all checks (comprehensive)
check-all: format-check lint typecheck security test
	@echo "All checks passed!"
