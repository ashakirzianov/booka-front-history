import * as React from "react";
import { App } from "../model/app";
import { ActionsTemplate } from "../model/actions";
import { Callbacks } from "./comp-utils";
import { BookComp } from "./BookComp";

const AppComp: React.SFC<{
    store: App,
    callbacks: Callbacks<ActionsTemplate>,
}> = props =>
    <BookComp { ...props.store.book } />;

export { AppComp };
