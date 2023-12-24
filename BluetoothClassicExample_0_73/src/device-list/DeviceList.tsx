import {FlatList, HStack, Icon, Pressable, Text, VStack} from 'native-base';
import React, {PropsWithChildren} from 'react';
import {BluetoothDevice} from 'react-native-bluetooth-classic';
import * as Ionicon from 'react-native-vector-icons/Ionicons';

export interface DeviceListProps {
  devices: BluetoothDevice[];
  onPress: (device: BluetoothDevice) => void;
  onLongPress?: (device: BluetoothDevice) => void;
}

/**
 * Displays a list of Bluetooth devices.
 *
 * @param {NativeDevice[]} devices
 * @param {function} onPress
 * @param {function} onLongPress
 */
export const DeviceList = ({
  devices,
  onPress,
  onLongPress,
}: PropsWithChildren<DeviceListProps>) => {
  return (
    <FlatList
      data={devices}
      renderItem={({item}) => {
        return (
          <DeviceListItem
            device={item}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      }}
      keyExtractor={item => item.address}
    />
  );
};

export interface DeviceListItemProps {
  device: BluetoothDevice;
  onPress: (device: BluetoothDevice) => void;
  onLongPress?: (device: BluetoothDevice) => void;
}

export const DeviceListItem = ({
  device,
  onPress,
  onLongPress,
}: DeviceListItemProps) => {
  // const bgColor = device.isConnected() ? '#0f0' : '#fff';
  const bgColour = '#0f0';
  const icon = device.bonded ? 'ios-bluetooth' : 'ios-cellular';

  return (
    <Pressable
      onPress={() => onPress(device)}
      onLongPress={() => onLongPress && onLongPress(device)}>
      <HStack justifyContent="space-between">
        <Icon as={Ionicon} name={icon} color={bgColour} />
        <VStack>
          <Text>{device.name}</Text>
          <Text size="0.5">{device.address}</Text>
        </VStack>
      </HStack>
    </Pressable>
  );
};
