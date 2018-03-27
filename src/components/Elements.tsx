import * as React from 'react';
import * as Atoms from './Atoms';
import { Comp } from './comp-utils';

export const TextBlock: Comp<{ text: string }> = props =>
    <Atoms.Text>{props.text}</Atoms.Text>;

export const Column: Comp = props =>
    <Atoms.View style={{ flexDirection: 'column' }}>{props.children}</Atoms.View>;

export const Title: Comp<{ text: string }> = props =>
    <Atoms.Text>{props.text}</Atoms.Text>;

export {
    Text,
} from './Atoms';
