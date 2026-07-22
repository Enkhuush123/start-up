const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo so Metro can find hoisted dependencies
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// If using NativeWind v4, wrap the config:
// const { withNativeWind } = require("nativewind/metro");
// module.exports = withNativeWind(config, { input: "./global.css" });
module.exports = config;
