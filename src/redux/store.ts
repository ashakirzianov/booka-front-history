import { applyMiddleware, createStore, compose } from "redux";
import { install } from 'redux-loop';
// import { logger } from "redux-logger";
import { throttle } from "lodash";
import { reducer } from "./reducers";
import { Store, storeState, restoreState } from "./storage";
import { text } from "../samples/warAndPeace";
import { string2book } from "../xmlProcessing/azLibRu";

const enhancer = compose(
    applyMiddleware(
        // logger,
    ),
    install(),
) as any; // TODO: find out what are expected types

function validateStore(restored: Store | undefined) {
    return undefined;
}

function createNewStore(): Store {
    return {
        book: string2book(text),
        visual: {
            loading: false,
        },
    };
}

const initial: Store = validateStore(restoreState()) || createNewStore();
export const store = createStore(reducer, initial, enhancer);

store.subscribe(throttle(() => {
    storeState(store.getState());
}, 1000));
