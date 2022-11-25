// react-native.config.js
module.exports = {
  dependencies: {
    'RNBluetoothClassicPackage': {
      platforms: {
        android: null, // disable Android platform, other platforms will still autolink if provided
      },
    },
  },
};
