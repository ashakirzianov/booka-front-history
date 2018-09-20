import { buildPartialReducer } from "./redux-utils";
import { ActionsTemplate } from "../model/actions";
import { combineReducers } from "./react-redux-utils";
import { App } from "../model/app";
import { loadStaticEpub } from '../loader/epubLoad';
import { Book } from "../model/book";
// import { url } from "../samples/warAndPeace";

export function testLoader(): Promise<Book> {
    return loadStaticEpub('wap.epub');
}

const book = buildPartialReducer<App['book'], ActionsTemplate>({
    loadBook: {
        loop: {
            sync: (s, p) => {
                return s;
            },
            async: testLoader,
            success: 'setBook',
            fail: 'bookLoadFail',
        },
    },
    setBook: (s, p) => {
        return p;
    },
});

export const reducer = combineReducers<App, ActionsTemplate>({
    book,
});
