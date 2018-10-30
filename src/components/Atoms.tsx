// TODO: find a better place for this ?
import { App } from '../model/app';
import { actionsTemplate } from '../model/actions';
import { buildConnectRedux } from '../redux/react-redux-utils';
export const connect = buildConnectRedux<App, typeof actionsTemplate>(actionsTemplate);

// export * from 'react-native';
export { Text, View } from 'react-native';
export { Route, Redirect, Switch } from 'react-router-dom';
