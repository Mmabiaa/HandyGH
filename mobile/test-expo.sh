#!/bin/bash

# Script to test the app on Expo Go
# This clears cache and starts Expo with tunnel mode

echo "🧹 Clearing Metro bundler cache..."
rm -rf .expo
rm -rf node_modules/.cache

echo "🚀 Starting Expo with tunnel mode..."
npx expo start --clear --tunnel

# Alternative commands if the above doesn't work:
# npx expo start --clear --go
# npm start -- --reset-cache --tunnel
