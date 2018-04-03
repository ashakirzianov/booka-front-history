import { applyMiddleware, createStore } from "redux";
// import { logger } from "redux-logger";
import { throttle } from "lodash";
import { reducer } from "./reducers";
import { Store, storeState, restoreState } from "./storage";
import { book } from "../samples/loremIpsum";

const middleware = applyMiddleware(
    // logger,
);

function validateStore(restored: Store | undefined) {
    return undefined;
}

function createNewStore(): Store {
    return {
        book: book,
    };
}

const initial: Store = validateStore(restoreState()) || createNewStore();
export const store = createStore(reducer, initial, middleware);

store.subscribe(throttle(() => {
    storeState(store.getState());
}, 1000));
