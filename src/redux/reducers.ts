import { buildPartialReducer } from "./redux-utils";
import { ActionsTemplate } from "../model/actions";
import { combineReducers } from "./react-redux-utils";
import { App } from "../model/app";

export function loadBoolean(x: number): Promise<{ helloBaz: boolean}> {
    return new Promise((res, rej) => res({ helloBaz: true }));
}

const book = buildPartialReducer<App['book'], ActionsTemplate>({
    loadBook: {
        fulfilled: (s, p) => ({ new: p }),
    },
    foo: (s, p) => s,
    bar: {
        loop: {
            sync: null as any,
            args: false,
            async: loadBoolean,
            success: 'foo',
            fail: 'bar',
        },
    },
});

const visual = buildPartialReducer<App['visual'], ActionsTemplate>({
    loadBook: {
        pending: s => ({ loading: true }),
        fulfilled: (s, p) => ({ loading: false }),
        rejected: s => ({ loading: false }),
    },
});

export const reducer = combineReducers<App, ActionsTemplate>({
    book,
    visual,
});
