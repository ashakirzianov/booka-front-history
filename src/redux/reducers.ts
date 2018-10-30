import { buildPartialReducer } from "./redux-utils";
import { ActionsTemplate } from "../model/actions";
import { combineReducers } from "./react-redux-utils";
import { App } from "../model/app";
import { loadingStub, errorBook } from "../model/book";

const book = buildPartialReducer<App['book'], ActionsTemplate>({
    setBook: {
        pending: s => loadingStub(),
        fulfilled: (_, p) => p,
        rejected: (s, p) => errorBook(p && p.toString && p.toString()),
    },
});

export const reducer = combineReducers<App, ActionsTemplate>({
    book,
});
