import { XmlNode } from "./xmlNode";

// ---- TypeDefs

const wrapKey = 'wrap';
type Wrap<T> = { [wrapKey]: T };
type Unwrap<T> = T extends Wrap<infer In> ? In : T;

export type NodeFunc<T> = {
    pattern: 'node',
    fn: (node: XmlNode) => T | null,
};

export type Capture<Name extends string, T extends Pattern> = {
    pattern: 'capture',
    name: Name,
    inside: T,
};

export type Sequence<L extends Pattern, R extends Pattern> = {
    pattern: 'sequence',
    first: L,
    second: R,
};

type ValuePattern<T> = NodeFunc<T>;
export type Pattern = ValuePattern<any> | Capture<any, any> | Sequence<any, any>;

export type Match<T extends Pattern> = Unwrap<WrappedMatch<T>>;
type WrappedMatch<T extends Pattern> =
    T extends Sequence<infer L, infer R> ? { [wrapKey]: IgnoreValueMatch<L> & IgnoreValueMatch<R> }
    : T extends Capture<infer Name, infer Value> ? { [k in Name]: Match<Value> }
    : T extends NodeFunc<infer Fn> ? Fn
    : never
    ;
type IgnoreValueMatch<T extends Pattern> = T extends ValuePattern<any> ? {} : Match<T>;

// ---- Constructors

export function nodeFn<T>(fn: (node: XmlNode) => T | null): NodeFunc<T> {
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
