import { ActionsTemplate } from "../model/actions";
import { App } from "../model/app";
import { loadingStub, errorBook } from "../model/book";
import { buildPartialReducers } from "./redux-utils";

export const reducer = buildPartialReducers<App, ActionsTemplate>({
    book: {
        setBook: {
            pending: s => loadingStub(),
            fulfilled: (_, p) => p,
            rejected: (s, p) => errorBook(p && p.toString && p.toString()),
        },
    },
});
