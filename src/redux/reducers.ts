import { buildPartialReducer } from "./redux-utils";
import { ActionsTemplate } from "../model/actions";
import { combineReducers } from "./react-redux-utils";
import { App } from "../model/app";
import { string2book } from "../xmlProcessing/azLibRu";
import { loadText } from "../samples/warAndPeace";
import { loadBook } from "../loader/bookLoad";

const book = buildPartialReducer<App['book'], ActionsTemplate>({
    setBook: (s, p) => {
        return p;
    },
});

const visual = buildPartialReducer<App['visual'], ActionsTemplate>({
    loadBook: {
        loop: {
            sync: (s, p) => {
                return { loading: true };
            },
            args: {
                loadString: loadText,
                string2book: string2book,
            },
            async: loadBook,
            success: 'setBook',
            fail: 'bookLoadFail',
        },
    },
    setBook: (s, p) => ({ loading: false }),
    bookLoadFail: (s, p) => {
        return { loading: false };
    },
});

export const reducer = combineReducers<App, ActionsTemplate>({
    book,
    visual,
});
