module.exports = {
  expo: {
    name: "HandyGH",
    slug: "handygh-mobile",
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.handygh.mobile",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.handygh.mobile",
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      // Set Kotlin version for EAS Build
      gradleProperties: {
        "kotlinVersion": "2.0.20"
      }
    },
    notification: {
      color: "#000000",
      androidMode: "default",
      androidCollapsedTitle: "{{unread_count}} new notifications"
    },
    plugins: [
      [
        "expo-notifications",
        {
          color: "#ffffff",
          sounds: []
        }
      ],
      "expo-secure-store"
    ],
    extra: {
      eas: {
        projectId: "8c013f0b-028f-48f3-90f2-92cc5eed7979"
      }
    },
    hooks: {
      postPublish: []
    }
  }
};
