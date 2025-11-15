#!/usr/bin/env bash

# This script runs before npm install on EAS Build
# It ensures the android folder doesn't exist so Expo generates it fresh

echo "🧹 Cleaning android folder if it exists..."
rm -rf android

echo "✅ Pre-install cleanup complete"
