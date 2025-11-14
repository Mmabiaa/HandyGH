const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration for Expo
 * https://docs.expo.dev/guides/customizing-metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Disable package exports to avoid runtime errors with Hermes
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
