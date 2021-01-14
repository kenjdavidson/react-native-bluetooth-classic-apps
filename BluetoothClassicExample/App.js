import React from 'react';
import {
  Root,
  StyleProvider,
} from 'native-base';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import getTheme from './native-base-theme/components';
import platform from './native-base-theme/variables/platform';
import ConnectionScreen from './src/connection/ConnectionScreen';
import DeviceListScreen from './src/device-list/DeviceListScreen';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      device: undefined,
      bluetoothEnabled: true,
    };
  }

  /**
   * Sets the current device to the application state.  This is super basic 
   * and should be updated to allow for things like:
   * - multiple devices
   * - more advanced state management (redux)
   * - etc
   *
   * @param device the BluetoothDevice selected or connected
   */
  selectDevice = (device) => {
    console.log('App::selectDevice() called with: ', device);
    this.setState({ device });
  }

  /**
   * On mount:
   *
   * - setup the connect and disconnect listeners
   * - determine if bluetooth is enabled (may be redundant with listener)
   */
  async componentDidMount() {
    console.log('App::componentDidMount adding listeners: onBluetoothEnabled and onBluetoothDistabled');
    console.log('App::componentDidMount alternatively could use onStateChanged');
    this.enabledSubscription = RNBluetoothClassic
      .onBluetoothEnabled((event) => this.onStateChanged(event));
    this.disabledSubscription = RNBluetoothClassic
      .onBluetoothDisabled((event) => this.onStateChanged(event));

    this.checkBluetootEnabled();
  }

  /**
   * Performs check on bluetooth being enabled.  This removes the `setState()`
   * from `componentDidMount()` and clears up lint issues.
   */
  async checkBluetootEnabled() {
    try {
      console.log('App::componentDidMount Checking bluetooth status');
      let enabled = await RNBluetoothClassic.isBluetoothEnabled();

      console.log(`App::componentDidMount Status: ${enabled}`);
      this.setState({ bluetoothEnabled: enabled });
    } catch (error) {
      console.log('App::componentDidMount Status Error: ', error);
      this.setState({ bluetoothEnabled: false });
    }
  }

  /**
   * Clear subscriptions
   */
  componentWillUnmount() {
    console.log('App:componentWillUnmount removing subscriptions: enabled and distabled');
    console.log('App:componentWillUnmount alternatively could have used stateChanged');
    this.enabledSubscription.remove();
    this.disabledSubscription.remove();
  }

  /**
   * Handle state change events.
   *
   * @param stateChangedEvent event sent from Native side during state change
   */
  onStateChanged(stateChangedEvent) {
    console.log('App::onStateChanged event used for onBluetoothEnabled and onBluetoothDisabled');

    this.setState({
      bluetoothEnabled: stateChangedEvent.enabled,
      device: stateChangedEvent.enabled ? this.state.device : undefined,
    });
  }

  render() {
    return (
      <StyleProvider style={getTheme(platform)}>
        <Root>
          {!this.state.device ? (
            <DeviceListScreen
              bluetoothEnabled={this.state.bluetoothEnabled}
              selectDevice={this.selectDevice} />
          ) : (
              <ConnectionScreen
                device={this.state.device}
                onBack={() => this.setState({ device: undefined })} />
            )}
        </Root>
      </StyleProvider>
    );
  }
}
