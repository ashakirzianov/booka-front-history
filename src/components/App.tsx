import * as React from "react";
import { App } from "../model/app";
import { ActionsTemplate } from "../model/actions";
import { Callbacks } from "./comp-utils";
import { BookComp } from "./Reader";
import { lorem } from "../samples/loremIpsum";

const AppComp: React.SFC<{
    store: App,
    callbacks: Callbacks<ActionsTemplate>,
}> = props =>
    <BookComp {...lorem} />;

export { AppComp };
