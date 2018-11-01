import { ActionsTemplate, App, loadingStub, errorBook } from "../model";
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
