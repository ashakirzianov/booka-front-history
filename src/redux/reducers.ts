import { buildPartialReducer } from "./redux-utils";
import { ActionsTemplate } from "../model/actions";
import { combineReducers } from "./react-redux-utils";
import { App } from "../model/app";
import { loadStaticEpub } from '../loader/epubLoad';
import { Book, loadingStub, noBook } from "../model/book";
import { BookLocator } from "../model/bookLocator";

export function testLoader(): Promise<Book> {
    return loadStaticEpub('wap.epub');
}

export function loadBL(bookLocator: BookLocator): Promise<Book> {
    switch (bookLocator.bl) {
        case 'no-book':
            return Promise.resolve(noBook());
        case 'static-book':
            return loadStaticEpub(bookLocator.name + '.epub');
        default:
            return Promise.resolve(noBook());
    }
}

const book = buildPartialReducer<App['book'], ActionsTemplate>({
    loadBL: {
        loop: {
            sync: (s, p) => loadingStub(),
            async: loadBL,
            success: 'setBook',
            fail: 'bookLoadFail',
            args: p => p,
        },
    },
    setBook: (s, p) => {
        return p;
    },
});

const currentBL = buildPartialReducer<App['currentBL'], ActionsTemplate>({
    loadBL: (s, p) => p,
});

export const reducer = combineReducers<App, ActionsTemplate>({
    book,
    currentBL,
});
