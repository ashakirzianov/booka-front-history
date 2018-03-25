import * as React from 'react';
import { View, Text } from 'react-native';
import { Comp } from './comp-utils';

export const Test: Comp = props =>
    <View style={{ flexDirection: 'column' }}>
        <Text>Secret!!</Text>
        <Text>Text</Text>
    </View>;
