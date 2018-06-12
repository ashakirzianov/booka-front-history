import { mapObject, KeyRestriction } from "../utils";

type NoNew<State> = KeyRestriction<State, 'new'>;

// Actions:

export type ActionType<Type extends PropertyKey, Payload> = {
    type: Type,
    payload: Payload,
};
export type ActionTypes<Templates> =
    ({ [k in keyof Templates]: ActionType<k, Templates[k]> })[keyof Templates];

export type ActionCreator<Type extends PropertyKey, Payload> = (payload: Payload) => ActionType<Type, Payload>;
export type ActionCreators<Template> = { [k in keyof Template]: ActionCreator<k, Template[k]> };
export type ActionDispatcher<Payload> = (payload: Payload) => void;
export type ActionDispatchers<Template> = { [k in keyof Template]: ActionDispatcher<Template[k]> };

function actionCreator<T extends PropertyKey>(type: T, payload?: any): ActionCreator<T, any> {
    return p => ({
        type: type,
        payload: p,
    });
}

export function actionCreators<Template>(actionTemplate: Template): ActionCreators<Template> {
    return mapObject(actionTemplate, actionCreator) as any;
}

// Reducers:

type Update<State extends NoNew<State>> = Partial<State> | { new: State };
type SimpleReducer<State extends NoNew<State>, Payload = {}> =
    (state: State, payload: Payload) => Update<State>;
type PromiseReducer<State extends NoNew<State>, Payload = {}> = {
    pending?: SimpleReducer<State, {}>,
    rejected?: SimpleReducer<State, any>,
    fulfilled?: SimpleReducer<State, Payload>,
};
type SingleReducer<State extends NoNew<State>, Payload = {}> = Payload extends Promise<infer Fulfilled>
    ? PromiseReducer<State, Fulfilled>
    : SimpleReducer<State, Payload>;
export type ReducerTemplate<State extends NoNew<State>, Template> = {
    [k in keyof Template]: SingleReducer<State, Template[k]>;
};

export type Reducer<State, Template> =
    (state: State | undefined, action: ActionTypes<Template>) => State;

export function buildReducer<State extends NoNew<State>, Template>(
    reducerTemplate: ReducerTemplate<State, Template>,
    initial?: State,
): Reducer<State, Template> {
    return buildPartialReducer(reducerTemplate, initial);
}

export function buildPartialReducer<State extends NoNew<State>, Template>(
    reducerTemplate: Partial<ReducerTemplate<State, Template>>,
    initial?: State,
): Reducer<State, Template> {
    return function reducer(state: State = null as any, action: ActionTypes<Template>): State {
        if (state === undefined) { // Redux send undefined state on init
            return initial === undefined ? null as any : initial; // ...need to return initial state or "null"
        }

        const single = findReducer(reducerTemplate, action.type as string);

        if (single === undefined) {
            return state; // Always return current state if action type is not supported
        }

        const updates = single(state, action.payload);
        return updates === state ? state // no need to copy
            : updates.new !== undefined ? updates.new // "new" means we returned whole new state
                : { // returned updates -- copy them
                    // Need to cast due ts bug: https://github.com/Microsoft/TypeScript/issues/14409
                    ...(state as any),
                    ...(updates as any),
                };
    };
}

function findReducer<State extends NoNew<State>, Template>(
    reducerTemplate: Partial<ReducerTemplate<State, Template>>,
    actionType: string,
): SimpleReducer<State, any> {
    const promiseTemplate = reducerTemplate as { [k: string]: PromiseReducer<State, any> };
    const simpleTemplate = reducerTemplate as { [k: string]: SimpleReducer<State, any> };
    return stringEndCondition(actionType, '_PENDING', actual => promiseTemplate[actual].pending)
        || stringEndCondition(actionType, '_REJECTED', actual => promiseTemplate[actual].rejected)
        || stringEndCondition(actionType, '_FULFILLED', actual => promiseTemplate[actual].fulfilled)
        || simpleTemplate[actionType]
        ;
}

function stringEndCondition<T>(str: string, toTrim: string, f: (trimmed: string) => T): T | undefined {
    return str.endsWith(toTrim)
        ? f(str.substring(0, str.length - toTrim.length))
        : undefined
        ;
}

export function bugWorkaround<State, Template>(
    reducer: Reducer<State, Template>
): (state: State | undefined, action: { type: string }) => State {
    // This is workaround for issue in redux: https://github.com/reactjs/redux/issues/2709
    return reducer as any;
}
