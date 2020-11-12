# react-native-bluetooth-classic-apps

Development applications used for programing/testing react-native-bluetooth-classic

Originally the development and example apps were stored inside the library itself `react-native-blueooth-classic/BluetoothClassicExample` which caused two major issues:

1. There were issues writing tests (dependencies required for testing broke the Example app) 
2. With more apps being required (multiple React Native versions, functionality showcase, etc) the library would be polluted

All these apps will be configured to use the locally installed `../../react-native-bluetooth-classic/` project.

## Example Apps

### BluetoothClassicExample

The primary application used during development.

- Supports the lowest versions of React Native (0.60.0), Android (26) and IOS (9)
- Provides almost all functionality from the library
