import { buildPartialReducer } from "./redux-utils";
import { ActionsTemplate } from "../model/actions";
import { combineReducers } from "./react-redux-utils";
import { App } from "../model/app";
import { string2book } from "../xmlProcessing/azLibRu";
import { loadBook } from "../loader/bookLoad";
import { timeouted } from "../utils";
import { loadStaticString } from "../loader/htmlLoad";
import { loadStaticEpub } from '../loader/epubLoad';
// import { url } from "../samples/warAndPeace";

export function testLoader(): Promise<string> {
    return loadStaticEpub('wap.epub')
        .then(epub => {
            return loadStaticString('warAndPeace.html');
        });
}

const book = buildPartialReducer<App['book'], ActionsTemplate>({
    loadBook: {
        loop: {
            sync: (s, p) => {
                return s;
            },
            async: () => loadBook({
                loadString: testLoader,
                string2book: timeouted(string2book),
            }),
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
