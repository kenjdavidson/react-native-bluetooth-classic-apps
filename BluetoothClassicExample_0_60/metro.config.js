/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

// Original file contents
// module.exports = {
//   transformer: {
//     getTransformOptions: async () => ({
//       transform: {
//         experimentalImportSupport: false,
//         inlineRequires: false,
//       },
//     }),
//   },
// };

// Resolution decribed in the following comment, which as the same configuration with folder
// strcuture as this.
// https://github.com/facebook/metro/issues/1#issuecomment-501143843
const path = require('path');

// Update to metro allowing react-native devDependency without breaking Metro/Hast
// https://medium.com/@charpeni/setting-up-an-example-app-for-your-react-native-library-d940c5cf31e4
const blacklist = require('metro-config/src/defaults/blacklist');
const bluetoothLib = path.resolve(
  __dirname,
  '../../react-native-bluetooth-classic',
);

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    /* This configuration allows you to build React-Native modules and
     * test them without having to publish the module. Any exports provided
     * by your source should be added to the "target" parameter. Any import
     * not matched by a key in target will have to be located in the embedded
     * app's node_modules directory.
     */
    extraNodeModules: new Proxy(
      /* The first argument to the Proxy constructor is passed as
       * "target" to the "get" method below.
       * Put the names of the libraries included in your reusable
       * module as they would be imported when the module is actually used.
       */
      {
        'react-native-bluetooth-classic': bluetoothLib,
      },
      {
        get: (target, name) => {
          if (target.hasOwnProperty(name)) {
            return target[name];
          }
          return path.join(process.cwd(), `node_modules/${name}`);
        },
      },
    ),
    blacklistRE: blacklist([
      new RegExp(`${bluetoothLib}/node_modules/react-native/.*`),
    ]),
  },
  projectRoot: path.resolve(__dirname),
  watchFolders: [bluetoothLib],
};
