import { createStore, applyMiddleware } from "redux";
import { throttle } from "lodash";
import { reducer } from "./reducers";
import { storeState, initialState } from "./storage";
import promiseMiddleware from 'redux-promise-middleware';

const initial = initialState();
export const store = createStore(reducer, initial, applyMiddleware(
    promiseMiddleware(),
));

store.subscribe(throttle(() => {
    storeState(store.getState());
}, 1000));
