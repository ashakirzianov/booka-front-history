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
    setBook: (s, p) => p,
});

const visual = buildPartialReducer<App['visual'], ActionsTemplate>({
    loadBook: {
        loop: {
            sync: (s, p) => ({ loading: true }),
            args: {},
            async: loadBook,
            success: 'setBook',
            fail: 'bookLoadFail',
        },
    },
    bookLoadFail: (s, p) => ({ loading: false }),
});

export const reducer = combineReducers<App, ActionsTemplate>({
    book,
    visual,
});
