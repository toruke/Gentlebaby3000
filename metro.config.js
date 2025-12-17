// metro.config.js

const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require("nativewind/metro"); // <-- COMMENTEZ CETTE LIGNE

const config = getDefaultConfig(__dirname);

// module.exports = withNativeWind(config, { input: "./global.css" }); // <-- COMMENTEZ CETTE LIGNE

module.exports = config; // <-- UTILISEZ UNIQUEMENT LA CONFIG DE BASE EXPO