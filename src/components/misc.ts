import { createBrowserHistory, Location, Action } from "history";
import { fetchBL } from "../api/fetch";
import { store } from "../redux/store";
import { buildActionCreators } from "../redux/redux-utils";
import { staticBookLocator, BookLocator } from "../model/bookLocator";
import { actionsTemplate } from "../model/actions";
import { App } from '../model/app';
import { buildConnectRedux } from '../redux/react-redux-utils';

export const history = createBrowserHistory();

export function dispatchHistoryEvent(location: Location, action?: Action) {
    dispatchLoadBLAction(staticBookLocator(location.pathname));
}

const actionCreators = buildActionCreators(actionsTemplate);
export function dispatchLoadBLAction(bl: BookLocator) {
    store.dispatch(actionCreators.setBook(fetchBL(bl)));
}

export const connect = buildConnectRedux<App, typeof actionsTemplate>(actionsTemplate);
