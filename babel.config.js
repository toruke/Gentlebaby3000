module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel"
    ],
    plugins: [
      // 🔹 MUST: react-native-reanimated plugin en dernier
      "react-native-reanimated/plugin"
    ],
  };
};
