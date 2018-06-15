import { buildPartialReducer } from "./redux-utils";
import { ActionsTemplate } from "../model/actions";
import { combineReducers } from "./react-redux-utils";
import { App } from "../model/app";
import { string2book } from "../xmlProcessing/azLibRu";
import { text } from "../samples/warAndPeaceShort";
import { Book } from "../model/book";

export function loadBoolean(x: number): Promise<{ helloBaz: boolean}> {
    return new Promise((res, rej) => res({ helloBaz: true }));
}

export function loadBook(): Promise<Book> {
    return new Promise((res, rej) => {
        setTimeout(() => {
            const b = string2book(text);
            res(b);
        });
    });
}

const book = buildPartialReducer<App['book'], ActionsTemplate>({
    loadBook: {
        fulfilled: (s, p) => ({ new: p }),
    },
    foo: (s, p) => s,
    bar: {
        loop: {
            sync: (s, p) => s,
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
