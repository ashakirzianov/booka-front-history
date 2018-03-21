import { buildReducer, buildPartialReducer } from "./redux-utils";
import { ActionsTemplate } from "../model/actions";
import { combineReducers } from "./react-redux-utils";
import { App, HelloWorld } from "../model/app";

const hello = buildReducer<HelloWorld, ActionsTemplate>({
    click: (s, p) => ({
        text: s.text + "!",
    }),
});

export const reducer = combineReducers<App, ActionsTemplate>({
    hello,
});
