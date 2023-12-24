import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Platform} from 'react-native';
import {Button, Text, Icon, useToast, IconButton, VStack} from 'native-base';
import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';
import {PermissionsAndroid} from 'react-native';
import Screen from '../common-screen/Screen';
import * as Ionicons from 'react-native-vector-icons/Ionicons';
import {DeviceList} from './DeviceList';

/**
 * See https://reactnative.dev/docs/permissionsandroid for more information
 * on why this is required (dangerous permissions).
 */
const requestAccessFineLocationPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Access fine location required for discovery',
      message:
        'In order to perform discovery, you must enable/allow ' +
        'fine location access.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export interface DeviceListScreenProps {
  onDeviceSelected: (device: BluetoothDevice) => void;
}

/**
 * Displays the device list and manages user interaction.  Initially
 * the NativeDevice[] contains a list of the bonded devices.  By using
 * the Discover Devices action the list will be updated with unpaired
 * devices.
 *
 * From here:
 * - unpaired devices can be paired
 * - paired devices can be connected
 *
 * @author kendavidson
 */
export const DeviceListScreen = ({onDeviceSelected}: DeviceListScreenProps) => {
  const [bluetoothEnabled] = useState(true);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [accepting, setAccepting] = useState<boolean>(false);
  const [discovering, setDiscovering] = useState<boolean>(false);
  const [delimiter] = useState('\n');
  const toaster = useToast();

  /**
   * Gets the currently bonded devices.
   */
  const getBondedDevices = async (unloading: boolean) => {
    console.log('DeviceListScreen::getBondedDevices');
    try {
      let bonded: BluetoothDevice[] =
        await RNBluetoothClassic.getBondedDevices();
      console.log('DeviceListScreen::getBondedDevices found', bonded);

      if (!unloading) {
        setDevices(bonded);
      }
    } catch (error) {
      console.error(error);
      setDevices([]);

      toaster.show({
        description: 'Error while attempting to get bonded devices',
        duration: 5000,
      });
    }
  };

  const startDiscovery = async () => {
    try {
      let granted = await requestAccessFineLocationPermission();

      if (!granted) {
        throw new Error('Access fine location was not granted');
      }

      setDiscovering(true);

      const updatedDevices = [...devices];

      try {
        let unpaired = await RNBluetoothClassic.startDiscovery();

        let index = updatedDevices.findIndex(d => !d.bonded);
        if (index >= 0) {
          updatedDevices.splice(
            index,
            updatedDevices.length - index,
            ...unpaired,
          );
        } else {
          updatedDevices.push(...unpaired);
        }

        toaster.show({
          description: `Found ${unpaired.length} unpaired devices.`,
          duration: 2000,
        });
      } finally {
        setDevices(updatedDevices);
        setDiscovering(false);
      }
    } catch (err) {
      console.error(err);
      toaster.show({
        description: 'Error while attempting to start discovery',
        duration: 2000,
      });
    }
  };

  const cancelDiscovery = async () => {
    try {
      // TODO implement this
    } catch (error) {
      console.error(error);
      toaster.show({
        description:
          'Error occurred while attempting to cancel discover devices',
        duration: 2000,
      });
    }
  };

  /**
   * Starts attempting to accept a connection.  If a device was accepted it will
   * be passed to the application context as the current device.
   */
  const acceptConnections = async () => {
    if (accepting) {
      toaster.show({
        description: 'Already accepting connections',
        duration: 5000,
      });

      return;
    }

    setAccepting(true);

    try {
      // @ts-expect-error need to fix the bluetooth library types
      let device = await RNBluetoothClassic.accept({delimiter: delimiter});
      if (device) {
        onDeviceSelected(device);
      }
    } catch (error) {
      console.error(error);
      // If we're not in an accepting state, then chances are we actually
      // requested the cancellation.  This could be managed on the native
      // side but for now this gives more options.
      if (!accepting) {
        toaster.show({
          description: 'Attempt to accept connection failed.',
          duration: 5000,
        });
      }
    } finally {
      setAccepting(false);
    }
  };

  /**
   * Cancels the current accept - might be wise to check accepting state prior
   * to attempting.
   */
  const cancelAcceptConnections = async () => {
    if (accepting) {
      try {
        let cancelled = await RNBluetoothClassic.cancelAccept();
        setAccepting(!cancelled);
      } catch (error) {
        console.error(error);
        toaster.show({
          description: 'Unable to cancel accept connection',
          duration: 2000,
        });
      }
    }
  };

  /**
   * Request to enable bluetooth.
   */
  const requestEnabled = async () => {
    try {
      // TODO implement this
    } catch (error) {
      console.error(error);
      toaster.show({
        description: 'Error occurred while enabling bluetooth',
        duration: 200,
      });
    }
  };

  useEffect(() => {
    getBondedDevices(false);

    return () => {
      async function closeAll() {
        accepting && (await cancelAcceptConnections());
        discovering && (await cancelDiscovery());
      }

      closeAll();
    };
  });

  const toggleAccept = useCallback(
    () =>
      accepting ? () => cancelAcceptConnections() : () => acceptConnections(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accepting],
  );
  const toggleDiscovery = useCallback(
    () => (discovering ? () => cancelDiscovery() : () => startDiscovery()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [discovering],
  );
  const BluetoothIcon = useMemo<ReactNode>(
    () =>
      bluetoothEnabled ? (
        <IconButton
          variant="unstyled"
          icon={<Icon as={Ionicons} name="md-sync" />}
        />
      ) : undefined,
    [bluetoothEnabled],
  );

  return (
    <Screen
      renderBody={
        <Text size="1" bold={true}>
          Devices
        </Text>
      }
      renderRight={BluetoothIcon}>
      {bluetoothEnabled ? (
        <DeviceList devices={devices} onPress={onDeviceSelected}>
          {Platform.OS !== 'ios' ? (
            <VStack>
              <Button variant="solid" onPress={toggleAccept}>
                <Text>
                  {accepting ? 'Accepting (cancel)...' : 'Accept Connection'}
                </Text>
              </Button>
              <Button variant="solid" onPress={toggleDiscovery}>
                <Text>
                  {discovering ? 'Discovering (cancel)...' : 'Discover Devices'}
                </Text>
              </Button>
            </VStack>
          ) : undefined}
        </DeviceList>
      ) : (
        <VStack>
          <Text>Bluetooth is OFF</Text>
          <Button onPress={() => requestEnabled()}>
            <Text>Enable Bluetooth</Text>
          </Button>
        </VStack>
      )}
    </Screen>
  );
};
