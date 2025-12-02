module.exports = {
  preset: "jest-expo",
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|expo|expo-router|@expo|@react-navigation|nativewind)"
  ],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}"
  ],
};
