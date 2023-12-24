import React, {PropsWithChildren, ReactNode} from 'react';
import {Box, Container, HStack} from 'native-base';
import {StatusBar} from 'react-native';

export interface ScreenProps extends PropsWithChildren {
  renderBody: ReactNode;
  renderLeft?: ReactNode;
  renderRight?: ReactNode;
}

/**
 * Builds a consistent screen, native-base <Header> was replaced with the AppBar recipe:
 * https://docs.nativebase.io/building-app-bar
 */
export default ({
  renderLeft,
  renderBody,
  renderRight,
  children,
}: ScreenProps) => (
  <Container>
    <StatusBar translucent />
    <Box safeAreaTop bg="blue.600" />
    <HStack
      bg="blue.800"
      px="1"
      py="3"
      justifyContent="space-between"
      alignItems="center"
      w="100%"
      maxW="350">
      <HStack alignItems="center">
        {renderLeft && renderLeft}
        {renderBody}
      </HStack>
      <HStack>{renderRight && renderRight}</HStack>
    </HStack>
    {children}
  </Container>
);
