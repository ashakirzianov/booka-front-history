import * as React from "react";
import { App } from "../model/app";
import { ActionsTemplate } from "../model/actions";
import { Callbacks } from "./comp-utils";
import { BookComp } from "./BookComp";

class AppComp extends React.PureComponent<{
    store: App,
    callbacks: Callbacks<ActionsTemplate>,
}> {
    componentWillMount() {
        this.props.callbacks.loadBook(undefined);
    }

    render() {
        const store = this.props.store;
        if (store.visual.loading) {
            return <div>Loading...</div>;
        } else if (store.book.kind === 'bookStub') {
            return <div>No book loaded</div>;
        } else {
            return <BookComp {...store.book} />;
        }
    }
}

export { AppComp };
