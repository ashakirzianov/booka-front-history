import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { store } from "./redux/store";
import { AppComp } from './components/App';
import registerServiceWorker from './registerServiceWorker';
import { actionCreators } from './redux/redux-utils';
import { actionsTemplate } from './model/actions';
import { connectRedux } from './redux/react-redux-utils';
import { Provider } from 'react-redux';

const allActionCreators = actionCreators(actionsTemplate);
export const App = connectRedux(AppComp as any, allActionCreators); // TODO: remove cast

ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
