module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // "nativewind/babel", // <-- COMMENTEZ CETTE LIGNE
      "react-native-reanimated/plugin", 
    ],
  };
};