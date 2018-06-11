import { buildReducer } from "./redux-utils";
import { ActionsTemplate } from "../model/actions";
import { combineReducers } from "./react-redux-utils";
import { App } from "../model/app";
import { Book } from "../model/book";

const book = buildReducer<Book, ActionsTemplate>({
    loadBook: {
        fulfilled: (s, p) => ({ new: p }),
    },
});

export const reducer = combineReducers<App, ActionsTemplate>({
    book,
});
