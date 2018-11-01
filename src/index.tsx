import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { store } from "./redux";
import { AppComp } from './components/App';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux';

ReactDOM.render(
  <Provider store={store}><AppComp /></Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
