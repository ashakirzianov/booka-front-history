import * as React from "react";
import { AnyAction, Reducer as ReducerRedux, combineReducers as combineReducersRedux } from "redux";
import { Dispatch, connect } from "react-redux";
import { mapObject, pick, ExcludeKeys } from "../utils";
import {
    ActionDispatchers, ActionCreators, Reducer,
    buildActionCreators, ActionDispatcher, NoNew,
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
            function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
                function buildCallbacks<T>(creators: ActionCreators<T>): ActionDispatchers<T> {
                    return mapObject(creators, (key, value) => (x: any) => dispatch(value(x)));
                }

                const callbacks = buildCallbacks(ac);
                return callbacks;
            }

            const connector = connect(mapStateToProps, mapDispatchToProps);

            const connected = connector(Comp);
            return connected as any; // TODO: try not to use 'as any'
        };
    };
}

export type ReducersMap<Store, ActionsTemplate> = {
    [k in keyof Store]: Reducer<Store[k], ActionsTemplate>;
};
export function combineReducers<Store extends NoNew<Store>, ActionsTemplate>(map: ReducersMap<Store, ActionsTemplate>): ReducerRedux<Store> {
    // This is workaround for issue in redux: https://github.com/reactjs/redux/issues/2709
    return combineReducersRedux<Store>(map as any) as any;
}
