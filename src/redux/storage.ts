import * as store from "store";
import { App } from "../model/app";

export type Store = App;
export function storeState(state: Store) {
    store.set("state", state);
}

export function restoreState(): Store | undefined {
    return store.get("state") as Store;
}
