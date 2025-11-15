#!/usr/bin/env bash

# This script runs after npm install on EAS Build
# It sets the Kotlin version in gradle.properties after prebuild generates the android folder

echo "⚙️  Configuring Kotlin version..."

# Run expo prebuild to generate android folder
npx expo prebuild --platform android --no-install

# Add Kotlin version override to gradle.properties
if [ -f "android/gradle.properties" ]; then
  echo "" >> android/gradle.properties
  echo "# Override Kotlin version to fix KSP compatibility" >> android/gradle.properties
  echo "kotlinVersion=2.0.20" >> android/gradle.properties
  echo "✅ Kotlin version set to 2.0.20"
else
  echo "⚠️  Warning: android/gradle.properties not found"
fi

# Remove enableBundleCompression from app/build.gradle if it exists
if [ -f "android/app/build.gradle" ]; then
  sed -i '/enableBundleCompression/d' android/app/build.gradle
  echo "✅ Removed enableBundleCompression from app/build.gradle"
fi

echo "✅ Post-install configuration complete"
