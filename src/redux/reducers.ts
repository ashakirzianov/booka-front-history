import { buildReducer, buildPartialReducer } from "./redux-utils";
import { ActionsTemplate } from "../model/actions";
import { combineReducers } from "./react-redux-utils";
import { App } from "../model/app";

const book = buildReducer<App['book'], ActionsTemplate>({
    loadBook: {
        fulfilled: (s, p) => ({ new: p }),
    },
});

const visual = buildPartialReducer<App['visual'], ActionsTemplate>({
    loadBook: {
        pending: s => ({ loading: true }),
        fulfilled: (s, p) => ({ loading: false }),
        rejected: s => ({ loading: false }),
    },
});

export const reducer = combineReducers<App, ActionsTemplate>({
    book,
    visual,
});
