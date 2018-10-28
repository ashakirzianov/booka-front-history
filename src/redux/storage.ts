import * as store from "store";
import { App } from "../model/app";

export type State = App;
export function storeState(state: State) {
    store.set("state", state);
}

export function restoreState(): State | undefined {
    return store.get("state") as State;
}
