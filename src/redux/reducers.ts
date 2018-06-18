import { buildPartialReducer } from "./redux-utils";
import { ActionsTemplate } from "../model/actions";
import { combineReducers } from "./react-redux-utils";
import { App } from "../model/app";
import { string2book } from "../xmlProcessing/azLibRu";
import { loadText } from "../samples/warAndPeaceShort";
import { loadBook } from "../loader/bookLoad";

const book = buildPartialReducer<App['book'], ActionsTemplate>({
    loadBook: {
        loop: {
            sync: (s, p) => {
                return s;
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
    setBook: (s, p) => {
        return p;
    },
});

export const reducer = combineReducers<App, ActionsTemplate>({
    book,
});
