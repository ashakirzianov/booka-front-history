import { createStore, applyMiddleware } from "redux";
import { throttle } from "lodash";
import { reducer } from "./reducers";
import { State, storeState, restoreState } from "./storage";
import promiseMiddleware from 'redux-promise-middleware';
import { createBrowserHistory, Location, Action } from "history";
import { BookLocator, staticBookLocator } from "../model/bookLocator";
import { loadBL } from "./api";

function validateState(restored: State | undefined) {
    return undefined;
}

function createNewState(): State {
    return {
        book: { book: 'no-book' },
    };
}

const initial: State = validateState(restoreState()) || createNewState();
export const store = createStore(reducer, initial, applyMiddleware(
    promiseMiddleware(),
));

store.subscribe(throttle(() => {
    storeState(store.getState());
}, 1000));

export const history = createBrowserHistory();

export function dispatchHistoryEvent(location: Location, action?: Action) {
    dispatchLoadBLAction(staticBookLocator(location.pathname));
}

export function dispatchLoadBLAction(bl: BookLocator) {
    store.dispatch({
        type: 'setBook',
        payload: loadBL(bl),
    });
}
