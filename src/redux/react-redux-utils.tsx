import * as React from "react";
import { connect } from "react-redux";
import { Dispatch, Action } from "redux";
import { mapObject, pick, ExcludeKeys } from "../utils";
import {
    ActionDispatchers, ActionCreators,
    buildActionCreators, ActionDispatcher,
} from "./redux-utils";

export function buildConnectRedux<S, AT>(at: AT) {
    return function f<SK extends keyof S, AK extends Exclude<keyof AT, SK> = never>(
        sk: SK[], ak: AK[] = [],
    ) {
        type ComponentProps = Pick<S, SK> & {
            [k in AK]: ActionDispatcher<AT[k]>;
        };
        return function ff<P extends ComponentProps>(Comp: React.ComponentType<P>): React.ComponentType<ExcludeKeys<P, SK | AK>> {
            function mapStateToProps(store: S): Pick<S, SK> {
                return pick(store, ...sk);
            }

            const ac = buildActionCreators(pick(at, ...ak));
            function mapDispatchToProps(dispatch: Dispatch<Action<any>>) {
                function buildCallbacks<T>(creators: ActionCreators<T>): ActionDispatchers<T> {
                    return mapObject(creators, (key, value) => (x: any) => dispatch(value(x) as any));
                }

                const callbacks = buildCallbacks(ac);
                return callbacks;
            }

            const connector = connect(mapStateToProps, mapDispatchToProps);

            const connected = connector(Comp as any); // TODO: try not to use 'as any'
            return connected as any; // TODO: try not to use 'as any'
        };
    };
}
