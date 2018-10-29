// NOTE: this file contains lots of crypto code. I'm sorry, future Anton, but you have to deal with it!
import { mapObject, KeyRestriction } from "../utils";
import { Cmd, loop } from 'redux-loop';

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

export type SomeValue = string | number | boolean | undefined | null | object;
export type SameKeys<T> = { [k in keyof T]: SomeValue };

type Update<State extends NoNew<State>> = Partial<State> | { new: State };
type SimpleReducer<State extends NoNew<State>, Payload = {}> =
    (state: State, payload: Payload) => Update<State>;
type PromiseReducer<State extends NoNew<State>, Payload = {}> = {
    pending?: SimpleReducer<State, {}>,
    rejected?: SimpleReducer<State, any>,
    fulfilled?: SimpleReducer<State, Payload>,
};
type LoopReducerForm<
    State extends NoNew<State>,
    ActionsT,
    Key extends keyof ActionsT,
    Succ extends keyof ActionsT,
    Fail extends keyof ActionsT,
    Args
    > = {
        loop: {
            sync: SimpleReducer<State, ActionsT[Key]>,
            args?: (payload: ActionsT[Key]) => Args,
            async: (x: Args) => Promise<ActionsT[Succ]>,
            success: Succ,
            fail: Fail,
        },
    };
type LoopReducer<State extends NoNew<State>, ActionsT, Key extends keyof ActionsT> =
    LoopReducerForm<State, ActionsT, Key, keyof ActionsT, keyof ActionsT, any>;
type SingleReducer<State extends NoNew<State>, ActionsT, Key extends keyof ActionsT> = ActionsT[Key] extends Promise<infer Fulfilled>
    ? PromiseReducer<State, Fulfilled>
    : SimpleReducer<State, ActionsT[Key]>
    | LoopReducer<State, ActionsT, Key>
    ;
export type ReducerTemplate<State extends NoNew<State>, ActionsT> = {
    [k in keyof ActionsT]: SingleReducer<State, ActionsT, k>;
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

        const single = findReducer(reducerTemplate, action.type as Extract<keyof Template, string>);

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

function findReducer<State extends NoNew<State>, Template, Key extends keyof Template>(
    reducerTemplate: Partial<ReducerTemplate<State, Template>>,
    actionType: Extract<keyof Template, string>,
): SimpleReducer<State, any> | undefined {

    const reducer = reducerTemplate[actionType] as any;
    if (reducer && typeof reducer === 'function') {
        return reducer as SimpleReducer<State, any>;
    }

    if (reducer && reducer.loop) {
        return buildLoopReducer(reducer);
    }

    const promiseTemplate = reducerTemplate as { [k: string]: PromiseReducer<State, any> };
    const promiseReducer = stringEndCondition(actionType, '_PENDING', actual => promiseTemplate[actual].pending)
        || stringEndCondition(actionType, '_REJECTED', actual => promiseTemplate[actual].rejected)
        || stringEndCondition(actionType, '_FULFILLED', actual => promiseTemplate[actual].fulfilled);

    if (promiseReducer) {
        return promiseReducer;
    }

    return undefined;
}

export function buildLoopReducer<State extends NoNew<State>, ActionsT, Key extends keyof ActionsT>(
    loopReducerTemplate: LoopReducer<State, ActionsT, Key>
) {
    return function loopReducer(s: State, payload: any) {
        return {
            new: loop(
                buildState(loopReducerTemplate.loop.sync(s, payload), s),
                Cmd.run(loopReducerTemplate.loop.async, {
                    successActionCreator: makeActionCreator(loopReducerTemplate.loop.success),
                    failActionCreator: makeActionCreator(loopReducerTemplate.loop.fail),
                    args: loopReducerTemplate.loop.args && [loopReducerTemplate.loop.args(payload)],
                }),
            ) as any, // loop function returns special Loop thing. Proper typing does not worth an effort in this case.
        };
    };
}

function makeActionCreator(actionType: PropertyKey) {
    return (p: any) => {
        return {
            type: actionType as string,
            payload: p,
        };
    };
}

function stringEndCondition<T>(str: string, toTrim: string, f: (trimmed: string) => T): T | undefined {
    return str.endsWith(toTrim)
        ? f(str.substring(0, str.length - toTrim.length))
        : undefined
        ;
}
