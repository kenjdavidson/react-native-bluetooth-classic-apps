# React Native Bluetooth Classic Apps

Development applications used for programing/testing react-native-bluetooth-classic

Originally the development and example apps were stored inside the library itself `react-native-blueooth-classic/BluetoothClassicExample` which caused two major issues:

1. There were issues writing tests (dependencies required for testing broke the Example app) 
2. With more apps being required (multiple React Native versions, functionality showcase, etc) the library would be polluted

### Contribution

Feel free to add your own sample application, either:

1) Within this project, specifically if help testing/debugging is required
2) Updating this `README.md` with a link to your showcase application

## Example Apps

### BluetoothClassicExample_0_60

The primary application used during development.

- Supports the lowest versions of React Native (0.60.0), Android (26) and IOS (9)
- Provides almost all functionality from the library
- Configured to use the locally installed `../../react-native-bluetooth-classic/` project.

> The `react-native-bluetooth-classic@0.60` stopped working with `react-native@0.73`

### BluetoothClassicExample_0_73

Application used for development of the `react-native-bluetooth-classic@0.73` library.

- Metro now supports local/symlinked libraries
- 0.73 completely changed how Native Modules are developed
