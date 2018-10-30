// NOTE: this file contains lots of crypto code. I'm sorry, future Anton, but you have to deal with it!
import { mapObject, KeyRestriction } from "../utils";

// TODO: consider remove restriction ?
export type NoNew<State> = KeyRestriction<State, 'new'>;

// Actions:

export type ActionType<Type extends PropertyKey, Payload> = {
    type: Type,
    payload: Payload,
};
export type ActionsType<Templates> =
    ({ [k in keyof Templates]: ActionType<k, Templates[k]> })[keyof Templates];

export type ActionCreator<Type extends PropertyKey, Payload> = (payload: Payload) => ActionType<Type, Payload>;
export type ActionCreators<Template> = { [k in keyof Template]: ActionCreator<k, Template[k]> };
export type ActionDispatcher<Payload> = (payload: Payload) => void;
export type ActionDispatchers<Template> = { [k in keyof Template]: ActionDispatcher<Template[k]> };

function buildActionCreator<T extends PropertyKey>(type: T): ActionCreator<T, any> {
    return p => ({
        type: type,
        payload: p,
    });
}

export function buildActionCreators<Template>(actionTemplate: Template): ActionCreators<Template> {
    return mapObject(actionTemplate, buildActionCreator) as ActionCreators<Template>;
}

// Reducers:

type Update<State extends NoNew<State>> = Partial<State> | { new: State };
type SimpleReducerT<State extends NoNew<State>, Payload = {}> =
    (state: State, payload: Payload) => Update<State>;
type PromiseReducerT<State extends NoNew<State>, Payload = {}> = {
    pending?: SimpleReducerT<State, {}>,
    rejected?: SimpleReducerT<State, any>,
    fulfilled?: SimpleReducerT<State, Payload>,
};
type SingleReducerT<State extends NoNew<State>, ActionsT, Key extends keyof ActionsT> = ActionsT[Key] extends Promise<infer Fulfilled>
    ? PromiseReducerT<State, Fulfilled>
    : SimpleReducerT<State, ActionsT[Key]>
    ;

type ReducerTs<State extends NoNew<State>, ActionsT> = {
    [k in keyof ActionsT]: SingleReducerT<State, ActionsT, k>;
};

export type Reducer<State extends NoNew<State>, Template> =
    (state: State | undefined, action: ActionsType<Template>) => State;

export function buildReducer<State extends NoNew<State>, Template>(
    reducerTemplate: ReducerTs<State, Template>,
    initial?: State,
): Reducer<State, Template> {
    return buildPartialReducer(reducerTemplate, initial);
}

export function buildPartialReducer<State extends NoNew<State>, Template>(
    reducerTemplate: Partial<ReducerTs<State, Template>>,
    initial?: State,
): Reducer<State, Template> {
    return function reducer(state: State = null as any, action: ActionsType<Template>): State {
        if (state === undefined) { // Redux send undefined state on init
            return initial === undefined ? null as any : initial; // ...need to return initial state or "null"
        }

        const single = findReducerT(reducerTemplate, action.type as Extract<keyof Template, string>);

        if (single === undefined) {
            return state; // Always return current state if action type is not supported
        }

        const updates = single(state, action.payload);
        return buildState(updates, state);
    };
}

function buildState<State extends NoNew<State>>(updates: Update<State>, state: State): State {
    if (updates === state) { // no need to copy
        return state;
    } else if (updates.new !== undefined) { // "new" means we returned whole new state
        return updates.new;
    } else {
        return { // returned updates -- copy them
            // Need to cast due ts bug: https://github.com/Microsoft/TypeScript/issues/14409
            ...(state as any),
            ...(updates as any),
        };
    }
}

function findReducerT<State extends NoNew<State>, Template, Key extends keyof Template>(
    reducerTs: Partial<ReducerTs<State, Template>>,
    actionType: Extract<keyof Template, string>,
): SimpleReducerT<State, any> | undefined {

    const reducer = reducerTs[actionType] as any;
    if (reducer && typeof reducer === 'function') {
        return reducer as SimpleReducerT<State, any>;
    }

    const promiseTemplate = reducerTs as { [k: string]: PromiseReducerT<State, any> };
    const promiseReducer = stringEndCondition(actionType, '_PENDING', actual => promiseTemplate[actual].pending)
        || stringEndCondition(actionType, '_REJECTED', actual => promiseTemplate[actual].rejected)
        || stringEndCondition(actionType, '_FULFILLED', actual => promiseTemplate[actual].fulfilled);

    if (promiseReducer) {
        return promiseReducer;
    }

    return undefined;
}

function stringEndCondition<T>(str: string, toTrim: string, f: (trimmed: string) => T): T | undefined {
    return str.endsWith(toTrim)
        ? f(str.substring(0, str.length - toTrim.length))
        : undefined
        ;
}
