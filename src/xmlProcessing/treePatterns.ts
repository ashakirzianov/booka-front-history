import { split } from "./parserCombinators";
import { throwExp } from "../utils";

// ---- TypeDefs

export type NodeFunc<TI, T> = {
    pattern: 'node',
    fn: (node: TI) => T | null,
};

type UnaryPattern<K extends string, I extends P> = {
    pattern: K,
    inside: I,
};

export type Capture<N extends string, I extends P> = UnaryPattern<'capture', I> & {
    name: N,
};

export type Some<I extends P> = UnaryPattern<'some', I>;
export type Not<I extends P> = UnaryPattern<'not', I>;

type BinaryPattern<K extends string, F extends Pattern, S extends Pattern> = {
    pattern: K,
    first: F,
    second: S,
};

export type Sequence<F extends P, S extends P> = BinaryPattern<'sequence', F, S>;
export type And<F extends P, S extends P> = BinaryPattern<'and', F, S>;
export type Choice<F extends P, S extends P> = BinaryPattern<'choice', F, S>;

type ValuePattern<T> = NodeFunc<any, T>;
type ProductPattern<F extends P, S extends P> = Sequence<F, S> | And<F, S>;
type SumPattern<F extends P, S extends P> = Choice<F, S>;
type AlgebraicPattern<F extends P, S extends P> = ProductPattern<F, S> | SumPattern<F, S>;
export type Pattern =
    | ValuePattern<any>
    | Capture<any, any> | Some<any> | Not<any>
    | AlgebraicPattern<any, any>
    ;
type P = Pattern;

export type Match<T extends Pattern> = Unwrap<DoMatch<T>>;
type DoMatch<T extends Pattern> =
    T extends ProductPattern<infer FP, infer SP> ? ReMatchIgnoreValue<FP> & ReMatchIgnoreValue<SP>
    : T extends SumPattern<infer FS, infer SS> ? ReMatch<FS> | ReMatch<SS>
    : T extends Some<infer I> ? Array<ReMatch<I>>
    : T extends Not<infer IN> ? {}
    : T extends Capture<infer Name, infer Value> ? { [k in Name]: Match<Value> }
    : T extends NodeFunc<any, infer Fn> ? Fn
    : never
    ;
type IgnoreValueMatch<T extends Pattern> = T extends ValuePattern<any> ? {} : Match<T>;

type SecretField = '@@secret_type_helper';
type Wrap<T> = { [k in SecretField]: T };
type Unwrap<T> = T extends Wrap<infer U> ? U
    : T extends Array<Wrap<infer A>> ? A[]
    : T;
type ReMatch<T extends Pattern> = { [k in SecretField]: Match<T> };
type ReMatchIgnoreValue<T extends Pattern> = { [k in SecretField]: IgnoreValueMatch<T> };

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

export function capture<N extends string, In extends P>(name: N, inside: In): Capture<N, In> {
    return {
        pattern: 'capture',
        name: name,
        inside: inside,
    };
}

function reducePairPatterns<Key extends AlgebraicPattern<any, any>['pattern']>(key: Key, ps: Pattern[]): Pattern {
    return ps.reduceRight((acc, p) => ({
        pattern: key,
        first: p,
        second: acc,
    } as any as Pattern)); // TODO: remove 'as any'?
}

export function sequence
    <T1 extends P, T2 extends P>(
        p1: T1, p2: T2):
    Sequence<T1, T2>;
export function sequence
    <T1 extends P, T2 extends P, T3 extends P>(
        p1: T1, p2: T2, p3: T3):
    Sequence<T1, Sequence<T2, T3>>;
export function sequence
    <T1 extends P, T2 extends P, T3 extends P, T4 extends P>(
        p1: T1, p2: T2, p3: T3, p4: T4):
    Sequence<T1, Sequence<T2, Sequence<T3, T4>>>;
export function sequence(...ps: Pattern[]): Pattern {
    return reducePairPatterns('sequence', ps);
}

export function and
    <T1 extends P, T2 extends P>(
        p1: T1, p2: T2,
): And<T1, T2>;
export function and
    <T1 extends P, T2 extends P, T3 extends P>(
        p1: T1, p2: T2, p3: T3,
): And<T1, And<T2, T3>>;
export function and
    <T1 extends P, T2 extends P, T3 extends P, T4 extends P>(
        p1: T1, p2: T2, p3: T3, p4: T4,
): And<T1, And<T2, And<T3, T4>>>;
export function and(...ps: Pattern[]): Pattern {
    return reducePairPatterns('and', ps);
}

export function choice
    <T1 extends P, T2 extends P>(
        p1: T1, p2: T2,
): Choice<T1, T2>;
export function choice
    <T1 extends P, T2 extends P, T3 extends P>(
        p1: T1, p2: T2, p3: T3,
): Choice<T1, Choice<T2, T3>>;
export function choice
    <T1 extends P, T2 extends P, T3 extends P, T4 extends P>(
        p1: T1, p2: T2, p3: T3, p4: T4,
): Choice<T1, Choice<T2, Choice<T3, T4>>>;
export function choice(...ps: Pattern[]): Pattern {
    return reducePairPatterns('choice', ps);
}

export function some<T extends P>(inside: T): Some<T> {
    return {
        pattern: 'some',
        inside: inside,
    };
}

export function not<T extends P>(inside: T): Not<T> {
    return {
        pattern: 'not',
        inside: inside,
    };
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

export function isChoice(p: Pattern): p is Choice<any, any> {
    return p.pattern === 'choice';
}

export function isSome(p: Pattern): p is Some<any> {
    return p.pattern === 'some';
}

export function isNot(p: Pattern): p is Not<any> {
    return p.pattern === 'not';
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

function matchChoice<TI>(choicePattern: Choice<any, any>, input: TI[]) {
    const first = matchPatternIgnoreValue(choicePattern.first, input);
    if (first.success) {
        return first;
    }

    const second = matchPatternIgnoreValue(choicePattern.second, input);
    if (second.success) {
        return second;
    }

    return fail(); // TODO: combine reasons
}

function matchSome<TI>(somePattern: Some<any>, input: TI[]) {
    const results = [];
    let currentInput = input;
    let currentResult: Result<TI, any>;
    do {
        currentResult = matchPattern(somePattern.inside, currentInput);
        if (currentResult.success) {
            results.push(currentResult.match);
            currentInput = currentResult.next;
        }
    } while (currentResult.success);

    return success(results, currentInput);
}

function matchNot<TI>(notPattern: Not<any>, input: TI[]) {
    const result = matchPattern(notPattern.inside, input);

    if (result.success) {
        return fail(); // TODO: report reason
    } else {
        return success({}, input);
    }
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
                    : isChoice(pattern) ? matchChoice(pattern, input)
                        : isSome(pattern) ? matchSome(pattern, input)
                            : isNot(pattern) ? matchNot(pattern, input)
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
