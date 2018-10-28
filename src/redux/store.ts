import { createStore, compose, applyMiddleware } from "redux";
import { install } from 'redux-loop';
// import { logger } from "redux-logger";
import { throttle } from "lodash";
import { reducer } from "./reducers";
import { Store, storeState, restoreState } from "./storage";
import promiseMiddleware from 'redux-promise-middleware';
import { createBrowserHistory, Location, Action } from "history";
import { BookLocator, staticBookLocator } from "../model/bookLocator";

// TODO: hide this preparations behind some interface?

const enhancer = compose(
    applyMiddleware(
        promiseMiddleware(), // TODO: consider removing promise support?
    ),
    install(),
) as any; // TODO: find out what are expected types

function validateStore(restored: Store | undefined) {
    return undefined;
}

function createNewStore(): Store {
    return {
        book: { book: 'no-book' },
        currentBL: { bl: 'no-book' },
    };
}

const initial: Store = validateStore(restoreState()) || createNewStore();
export const store = createStore(reducer, initial, enhancer);

store.subscribe(throttle(() => {
    storeState(store.getState());
}, 1000));

const history = createBrowserHistory();

history.listen((location, action) => {
    dispatchHistoryEvent(location, action);
    // tslint:disable-next-line:no-console
    console.log('hello!!!!');
});

dispatchHistoryEvent(history.location);

export function dispatchHistoryEvent(location: Location, action?: Action) {
    dispatchLoadBLAction(staticBookLocator(location.pathname));
}

export function dispatchLoadBLAction(bl: BookLocator) {
    store.dispatch({
        type: 'loadBL',
        payload: bl,
    });
}
