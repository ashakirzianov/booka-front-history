import { split } from "./parserCombinators";
import { throwExp } from "../utils";

// ---- TypeDefs

export type NodeFunc<TI, T> = {
    pattern: 'node',
    fn: (node: TI) => T | null,
};

export type Capture<Name extends string, T extends Pattern> = {
    pattern: 'capture',
    name: Name,
    inside: T,
};

export type Sequence<F extends Pattern, S extends Pattern> = {
    pattern: 'sequence',
    first: F,
    second: S,
};

export type And<F extends Pattern, S extends Pattern> = {
    pattern: 'and',
    first: F,
    second: S,
};

type ValuePattern<T> = NodeFunc<any, T>;
export type Pattern =
    | ValuePattern<any>
    | Capture<any, any>
    | Sequence<any, any> | And<any, any>
    ;

export type Match<T extends Pattern> = Unwrap<DoMatch<T>>;
type DoMatch<T extends Pattern> =
    T extends Sequence<infer F, infer S> ? ReMatch<F> & ReMatch<S>
    : T extends And<infer FA, infer SA> ? ReMatch<FA> & ReMatch<SA>
    : T extends Capture<infer Name, infer Value> ? { [k in Name]: Match<Value> }
    : T extends NodeFunc<any, infer Fn> ? Fn
    : never
    ;
type IgnoreValueMatch<T extends Pattern> = T extends ValuePattern<any> ? {} : Match<T>;

type SecretField = '@@secret_type_helper';
type Wrap<T> = { [k in SecretField]: T };
type Unwrap<T> = T extends Wrap<infer U> ? U : T;
// type WrapMatch<T extends Pattern> = { [k in SecretField]: Match<T> };
type ReMatch<T extends Pattern> = { [k in SecretField]: IgnoreValueMatch<T> };

export type Success<TI, T> = {
    success: true,
    match: T,
    next: TI[],
};
export type Fail = {
    success: false,
};
export type Result<TI, T> = Success<TI, T> | Fail;

// ---- Constructors

export function success<TI, T>(match: T, next: TI[]): Success<TI, T> {
    return {
        success: true,
        match: match,
        next: next,
    };
}

export function fail(): Fail {
    return {
        success: false,
    };
}

export function nodeFn<TI, T>(fn: (node: TI) => T | null): NodeFunc<TI, T> {
    return {
        pattern: 'node',
        fn: fn,
    };
}

export function capture<N extends string, P extends Pattern>(name: N, inside: P): Capture<N, P> {
    return {
        pattern: 'capture',
        name: name,
        inside: inside,
    };
}

export function sequence
    <T1 extends Pattern, T2 extends Pattern>(
        p1: T1, p2: T2):
    Sequence<T1, T2>;
export function sequence
    <T1 extends Pattern, T2 extends Pattern, T3 extends Pattern>(
        p1: T1, p2: T2, p3: T3):
    Sequence<T1, Sequence<T2, T3>>;
export function sequence
    <T1 extends Pattern, T2 extends Pattern, T3 extends Pattern, T4 extends Pattern>(
        p1: T1, p2: T2, p3: T3, p4: T4):
    Sequence<T1, Sequence<T2, Sequence<T3, T4>>>;
export function sequence(...ps: Pattern[]): Pattern {
    return ps.reduceRight((acc, p) => ({
        pattern: 'sequence',
        first: p,
        second: acc,
    }));
}

export function and
    <T1 extends Pattern, T2 extends Pattern>(
        p1: T1, p2: T2,
): And<T1, T2>;
export function and
    <T1 extends Pattern, T2 extends Pattern, T3 extends Pattern>(
        p1: T1, p2: T2, p3: T3,
): And<T1, And<T2, T3>>;
export function and
    <T1 extends Pattern, T2 extends Pattern, T3 extends Pattern, T4 extends Pattern>(
        p1: T1, p2: T2, p3: T3, p4: T4,
): And<T1, And<T2, And<T3, T4>>>;
export function and(...ps: Pattern[]): Pattern {
    return ps.reduceRight((acc, p) => ({
        pattern: 'and',
        first: p,
        second: acc,
    }));
}

// ---- Type predicates

export function isValuePattern(p: Pattern): p is ValuePattern<any> {
    return isNodeFunc(p);
}

export function isNodeFunc(p: Pattern): p is NodeFunc<any, any> {
    return p.pattern === 'node';
}

export function isCapture(p: Pattern): p is Capture<any, any> {
    return p.pattern === 'capture';
}

export function isSequence(p: Pattern): p is Sequence<any, any> {
    return p.pattern === 'sequence';
}

export function isAnd(p: Pattern): p is And<any, any> {
    return p.pattern === 'and';
}

// ---- Matcher

function matchNode<TI>(nodePattern: NodeFunc<TI, any>, input: TI[]) {
    const list = split(input);
    if (!list.head) {
        return fail();
    }

    const result = nodePattern.fn(list.head);
    return result === null ? fail() : success(result, list.tail);
}

function matchCapture<TI>(capturePattern: Capture<any, any>, input: TI[]) {
    const result = matchPattern(capturePattern.inside, input);

    return result.success ?
        success({ [capturePattern.name]: result.match }, result.next)
        : result;
}

function matchSequence<TI>(sequencePattern: Sequence<any, any>, input: TI[]) {
    const first = matchPatternIgnoreValue(sequencePattern.first, input);
    if (!first.success) {
        return first;
    }

    const second = matchPatternIgnoreValue(sequencePattern.second, first.next);
    if (!second.success) {
        return second;
    }

    return success({
        ...first.match,
        ...second.match,
    }, second.next);
}

function matchAnd<TI>(andPattern: And<any, any>, input: TI[]) {
    const first = matchPatternIgnoreValue(andPattern.first, input);
    if (!first.success) {
        return first;
    }

    const second = matchPatternIgnoreValue(andPattern.second, input);
    if (!second.success) {
        return second;
    }

    return success({
        ...first.match,
        ...second.match,
    }, second.next);
}

function matchPatternIgnoreValue<TI>(pattern: Pattern, input: TI[]) {
    const result = matchPattern(pattern, input);
    return result.success ?
        (isValuePattern(pattern) ? success({}, result.next) : result)
        : result;
}

export function matchPattern<TI, T extends Pattern>(pattern: T, input: TI[]): Result<TI, Match<T>> {
    return isNodeFunc(pattern) ? matchNode(pattern, input)
        : isCapture(pattern) ? matchCapture(pattern, input)
            : isSequence(pattern) ? matchSequence(pattern, input)
                : isAnd(pattern) ? matchAnd(pattern, input)
                    : throwExp({ cantHandlePattern: pattern }); // : assertNever(pattern);
}

// ---- Example

export const sequenceE = sequence(
    capture('foo', nodeFn(x => true)),
    sequence(
        sequence(
            nodeFn(x => 42),
            capture('baz', nodeFn(x => undefined)),
            capture('boo', nodeFn(x => 42)),
        ),
        capture('bar', nodeFn(x => 'hello')),
    ),
);

export type Test = Match<typeof sequenceE>;
export const tttt: Test = null as any;
