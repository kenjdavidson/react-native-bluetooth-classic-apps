import React, {useCallback, useEffect, useMemo, useState} from 'react';
import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothDeviceReadEvent,
  BluetoothEventSubscription,
  BluetoothEventType,
} from 'react-native-bluetooth-classic';
import {Text, Icon, VStack, IconButton, HStack} from 'native-base';
import {
  FlatList,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Screen from '../common-screen/Screen';
import * as Ionicons from 'react-native-vector-icons/Ionicons';

export interface ConnectionScreenProps {
  device: BluetoothDevice;
  onBackPress: () => void;
}

type DeviceData = {
  data: string;
  timestamp: Date;
  type: string;
};

export const ConnectionScreen = ({
  device,
  onBackPress,
}: ConnectionScreenProps) => {
  const [text, setText] = useState<string>('');
  const [data, setData] = useState<DeviceData[]>([]);
  const [polling] = useState<boolean>(false);
  const [connection, setConnection] = useState<boolean>();
  const [delimiter] = useState('\n');
  const [_, setDisconnectSubscription] = useState<BluetoothEventSubscription>();
  const [readSubscription, setReadSubscription] =
    useState<BluetoothEventSubscription>();
  const [readInterval, setReadInterval] = useState<
    NodeJS.Timeout | undefined
  >();

  const addData = (newData: DeviceData) => setData([newData, ...data]);

  const initializeRead = async () => {
    setDisconnectSubscription(
      RNBluetoothClassic.onDeviceDisconnected(() => disconnect(true)),
    );

    if (polling) {
      setReadInterval(global.setInterval(() => performRead(), 5000));
    } else {
      setReadSubscription(device.onDataReceived(data => onReceivedData(data)));
    }
  };

  const uninitializeRead = async () => {
    readInterval && clearInterval(readInterval);
    readSubscription && readSubscription.remove();
    setReadSubscription(undefined);
  };

  const connect = async () => {
    try {
      let connected = await device.isConnected();
      if (!connected) {
        addData({
          data: `Attempting connection to ${device.address}`,
          timestamp: new Date(),
          type: 'error',
        });

        connected = await device.connect();

        addData({
          data: 'Connection successful',
          timestamp: new Date(),
          type: 'info',
        });
      } else {
        addData({
          data: `Connected to ${device.address}`,
          timestamp: new Date(),
          type: 'error',
        });
      }

      await initializeRead();

      setConnection(connected);
    } catch (error) {
      console.log(error);
      addData({
        data: `Connection failed`,
        timestamp: new Date(),
        type: 'error',
      });
    }
  };

  const disconnect = async (disconnected: boolean) => {
    try {
      if (!disconnected) {
        disconnected = await device.disconnect();
      }

      addData({
        data: 'Disconnected',
        timestamp: new Date(),
        type: 'info',
      });

      setConnection(!disconnected);
    } catch (error) {
      console.log(error);
      addData({
        data: `Disconnect failed`,
        timestamp: new Date(),
        type: 'error',
      });
    }

    // Clear the reads, so that they don't get duplicated
    await uninitializeRead();
  };

  const onReceivedData = async (event: BluetoothDeviceReadEvent) => {
    addData({
      data: event.data,
      timestamp: new Date(),
      type: 'receive',
    });
  };

  const sendData = async () => {
    try {
      console.log(`Attempting to send data ${text}`);
      const message = text + delimiter;
      await device.write(message);

      addData({
        timestamp: new Date(),
        data: text,
        type: 'sent',
      });

      // let data = Buffer.alloc(10, 0xef);
      // await this.props.device.write(data);

      // addData({
      //   timestamp: new Date(),
      //   data: `Byte array: ${data.toString()}`,
      //   type: 'sent',
      // });

      setText('');
    } catch (error) {
      console.log(error);
    }
  };

  const performRead = async () => {
    try {
      console.log('Polling for available messages');
      let available = await device.available();
      console.log(`There is data available [${available}], attempting read`);

      if (available > 0) {
        for (let i = 0; i < available; i++) {
          console.log(`reading ${i}th time`);
          const readData = await device.read();

          console.log(`Read data ${readData}`);
          console.log(readData);
          onReceivedData({
            data: readData.toString(),
            device: device,
            eventType: BluetoothEventType.DEVICE_READ,
            timestamp: new Date().toDateString(),
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    async function startConnection() {
      await device.connect();
    }

    startConnection();

    return () => {
      async function endConnection() {
        await device.disconnect();
        await uninitializeRead();
      }

      endConnection();
    };
  });

  const toggleConnection = useCallback(async () => {
    return connection ? disconnect : connect;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);
  const connectionIcon = useMemo(() => {
    return connection ? 'radio-button-on' : 'radio-button-off';
  }, [connection]);

  return (
    <Screen
      renderBody={
        <VStack>
          <Text fontSize="md">{device.name}</Text>
          <Text fontSize="xs">{device.address}</Text>
        </VStack>
      }
      renderLeft={
        <IconButton
          variant="unstyled"
          onPress={onBackPress}
          icon={<Icon as={Ionicons} name="arrow-back" />}
        />
      }
      renderRight={
        <IconButton
          variant="unstyled"
          onPress={toggleConnection}
          icon={<Icon as={Ionicons} name={connectionIcon} />}
        />
      }>
      <HStack>
        <FlatList
          style={styles.connectionScreenOutput}
          contentContainerStyle={{justifyContent: 'flex-end'}}
          inverted
          ref="scannedDataList"
          data={data}
          keyExtractor={item => item.timestamp.toISOString()}
          renderItem={({item}) => (
            <HStack id={item.timestamp.toISOString()}>
              <Text>{item.timestamp.toLocaleDateString()}</Text>
              <Text>{item.type === 'sent' ? ' < ' : ' > '}</Text>
              <Text flexShrink={1}>{item.data.trim()}</Text>
            </HStack>
          )}
        />
        <InputArea
          text={text}
          onChangeText={text => setText(text)}
          onSend={() => sendData()}
          disabled={!connection}
        />
      </HStack>
    </Screen>
  );
};

const InputArea = ({
  text,
  onChangeText,
  onSend,
  disabled,
}: {
  text: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
}) => {
  let style = disabled ? styles.inputArea : styles.inputAreaConnected;
  return (
    <View style={style}>
      <TextInput
        style={styles.inputAreaTextInput}
        placeholder={'Command/Text'}
        value={text}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={onSend}
        returnKeyType="send"
        readOnly={disabled}
      />
      <TouchableOpacity
        style={styles.inputAreaSendButton}
        onPress={() => onSend()}
        disabled={disabled}>
        <Text>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * TextInput and Button for sending
 */
const styles = StyleSheet.create({
  connectionScreenWrapper: {
    flex: 1,
  },
  connectionScreenOutput: {
    flex: 1,
    paddingHorizontal: 8,
  },
  inputArea: {
    flexDirection: 'row',
    alignContent: 'stretch',
    backgroundColor: '#ccc',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  inputAreaConnected: {
    flexDirection: 'row',
    alignContent: 'stretch',
    backgroundColor: '#90EE90',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  inputAreaTextInput: {
    flex: 1,
    height: 40,
  },
  inputAreaSendButton: {
    justifyContent: 'center',
    flexShrink: 1,
  },
});
