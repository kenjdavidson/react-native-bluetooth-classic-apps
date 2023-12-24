const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const reactNativeBluetoothClassicPath = path.resolve(
    __dirname,
    '../../react-native-bluetooth-classic',
  );

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    watchFolders: [
        reactNativeBluetoothClassicPath
    ]
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
