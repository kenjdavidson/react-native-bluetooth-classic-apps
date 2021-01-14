import React from 'react';
import { Container, Header } from 'native-base';
import { StatusBar } from 'react-native';

export default props => (
    <Container>
        <StatusBar translucent />
        <Header iosBarStyle="light-content">
            {props.headerLeft && props.headerLeft}
            {props.headerBody && props.headerBody}
            {props.headerRight && props.headerRight}
        </Header>
        { props.children}
    </Container>
);
