import * as React from "react";
import { App } from "../model/app";
import { ActionsTemplate } from "../model/actions";
import { Callbacks } from "./comp-utils";

const AppComp: React.SFC<{
    store: App,
    callbacks: Callbacks<ActionsTemplate>,
}> = props =>
        <div>
            {props.store.hello.text}
            <button onClick={() => { props.callbacks.click({}); }}>!</button>
        </div>;

export { AppComp };
