"""
Settings package for HandyGH.

This package contains environment-specific settings:
- base.py: Common settings shared across all environments
- development.py: Development-specific settings (SQLite, DEBUG=True)
- production.py: Production settings (PostgreSQL, DEBUG=False)
- test.py: Test environment settings (in-memory SQLite)
"""
