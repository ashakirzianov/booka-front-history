import { createBrowserHistory, Location, Action } from "history";
import { fetchBL } from "../api/fetch";
import { store, buildActionCreators, buildConnectRedux } from '../redux';
import { staticBookLocator, BookLocator, actionsTemplate, App } from "../model";

export const history = createBrowserHistory();

export function dispatchHistoryEvent(location: Location, action?: Action) {
    dispatchLoadBLAction(staticBookLocator(location.pathname));
}

const actionCreators = buildActionCreators(actionsTemplate);
export function dispatchLoadBLAction(bl: BookLocator) {
    store.dispatch(actionCreators.setBook(fetchBL(bl)));
}

export const connect = buildConnectRedux<App, typeof actionsTemplate>(actionsTemplate);
