import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";

import { store } from "./redux/store";
import { AppComp } from "./components/App";
import { connectRedux } from "./redux/react-redux-utils";
import { actionCreators } from "./redux/redux-utils";
import { actionsTemplate } from "./model/actions";
import { connectDnd } from "./dnd/dnd-utils";

const allActionCreators = actionCreators(actionsTemplate);
export const App = connectDnd(connectRedux(AppComp, allActionCreators));

ReactDOM.render(
    <Provider store={store}><App /></Provider>,
    document.getElementById("root"),
);
