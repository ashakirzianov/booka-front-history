import * as React from "react";
import { App } from "../model/app";
import { ActionsTemplate } from "../model/actions";
import { Callbacks } from "./comp-utils";
import { TopComp } from "./BookComp";

class AppComp extends React.Component<{
    store: App,
    callbacks: Callbacks<ActionsTemplate>,
}> {
    componentWillMount() {
        this.props.callbacks.loadBook(undefined);
    }

    render() {
        const store = this.props.store;
        return <TopComp {...store.book} />;
    }
}

export { AppComp };
