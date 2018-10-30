import * as React from "react";
import { AnyAction, Reducer as ReducerRedux, combineReducers as combineReducersRedux } from "redux";
import { Dispatch, connect } from "react-redux";
import { mapObject, KeyRestriction, pick, ExcludeKeys } from "../utils";
import { ActionDispatchers, ActionCreators, Reducer, ReducerTemplate, buildPartialReducer, actionCreators, ActionDispatcher } from "./redux-utils";

export type TopComponent<Store, ActionsTemplate> = React.ComponentType<{
    store: Store,
    callbacks: ActionDispatchers<ActionsTemplate>,
}>;

export function buildConnectRedux<Store>() {
    // TODO: We're using currying to make it possible to infer generic arg (ActionsTemplate) from func arg (at). Consider NOT to use currying.
    return function f<AT>(at: AT) {
        return function ff<SK extends keyof Store, AK extends Exclude<keyof AT, SK> = never>(
            sk: SK[], ak: AK[] = []
        ) {
            type ComponentProps = Pick<Store, SK> & {
                [k in AK]: ActionDispatcher<AT[k]>;
            };
            return function fff<P extends ComponentProps>(Comp: React.ComponentType<P>): React.ComponentType<ExcludeKeys<P, SK | AK>> {
                function mapStateToProps(store: Store): Pick<Store, SK> {
                    return pick(store, ...sk);
                }

                const ac = actionCreators(pick(at, ...ak));
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
    };
}

export function connectRedux<Store, ActionsTemplate>(
    Comp: TopComponent<Store, ActionsTemplate>,
    ac: ActionCreators<ActionsTemplate>,
) {
    function mapStateToProps(store: Store) {
        return {
            store: store,
        };
    }

    function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
        function buildCallbacks<T>(creators: ActionCreators<T>): ActionDispatchers<T> {
            return mapObject(creators, (key, value) => (x: any) => dispatch(value(x)));
        }

        return {
            callbacks: buildCallbacks(ac),
        };
    }

    const connector = connect(mapStateToProps, mapDispatchToProps);

    const connected = connector(Comp);
    return connected;
}

export type ReducersMap<Store, ActionsTemplate> = {
    [k in keyof Store]: Reducer<Store[k], ActionsTemplate>;
};
export function combineReducers<Store, ActionsTemplate>(map: ReducersMap<Store, ActionsTemplate>): ReducerRedux<Store> {
    // This is workaround for issue in redux: https://github.com/reactjs/redux/issues/2709
    return combineReducersRedux<Store>(map as any) as any;
}

type NoNew<State> = KeyRestriction<State, "new">;
export type CombineReducersObject<Store extends NoNew<Store>, ActionTemplate> = {
    [k in keyof Store]: Partial<ReducerTemplate<Store, ActionTemplate>>;
};

export function combineReducersTemplate<Store extends NoNew<Store>, ActionsTemplate>(
    o: CombineReducersObject<Store, ActionsTemplate>) {
    return combineReducers(mapObject(o, (k, v) => buildPartialReducer(v) as any));
}

export type Test = {
    foo: number,
    bar: string,
    baz: boolean,
};

export type PickTest = Pick<Test, Exclude<keyof Test, 'foo'>>;
