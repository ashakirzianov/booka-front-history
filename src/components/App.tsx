import * as React from "react";
import { App } from "../model/app";
import { ActionsTemplate } from "../model/actions";
import { Callbacks } from "./comp-utils";
import { TopComp } from "./BookComp";
import { Router } from "react-router-dom";
import { dispatchHistoryEvent, history } from "../redux/store";

export class AppComp extends React.Component<{
    store: App,
    callbacks: Callbacks<ActionsTemplate>,
}> {
    componentWillMount() {
        // TODO: this doesn't feel right. Think of another way.
        dispatchHistoryEvent(history.location);
        history.listen((location, action) => {
            dispatchHistoryEvent(location, action);
        });
    }

    render() {
        const { book } = this.props.store;
        return <Router history={history}>
            <TopComp {...book} />
        </Router>;
    }
}
