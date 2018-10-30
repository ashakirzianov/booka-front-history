import { createBrowserHistory, Location, Action } from "history";
import { loadBL } from "./api";
import { store } from "./store";
import { buildActionCreators } from "./redux-utils";
import { staticBookLocator, BookLocator } from "../model/bookLocator";
import { actionsTemplate } from "../model/actions";

export const history = createBrowserHistory();

export function dispatchHistoryEvent(location: Location, action?: Action) {
    dispatchLoadBLAction(staticBookLocator(location.pathname));
}

const actionCreators = buildActionCreators(actionsTemplate);
export function dispatchLoadBLAction(bl: BookLocator) {
    store.dispatch(actionCreators.setBook(loadBL(bl)));
}
