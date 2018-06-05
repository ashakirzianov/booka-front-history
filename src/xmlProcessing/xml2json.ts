import { XmlNode, hasChildren, XmlNodeType, isElement, isComment } from "./xmlNode";
import { caseInsensitiveEq } from "./xmlUtils";

export type Input = XmlNode[];
export type Parser<T = XmlNode> = (input: Input) => Result<T>;
export type Success<Out> = {
    value: Out,
    next: Input,
    success: true,
};
export type Fail = {
    success: false,
};
export type Result<Out> = Success<Out> | Fail;

export function fail(): Fail {
    return { success: false };
}

export function success<T>(value: T, next: Input): Success<T> {
    return { value, next, success: true };
}

export function split<T>(arr: T[]) {
    return {
        head: arr.length > 0 ? arr[0] : undefined,
        tail: arr.length > 1 ? arr.slice(1) : [],
    };
}

export function firstNode<T>(f: (n: XmlNode) => T | null): Parser<T> {
    return input => {
        const list = split(input);
        const result = list.head && f(list.head) || null;
        return result === null
            ? fail()
            : success(result, list.tail)
            ;
    };
}

export const firstNodePredicate = (p: (n: XmlNode) => boolean) => firstNode(n => p(n) ? n : null);

export const nodeAny = firstNode(x => x);
export const nodeType = (type: XmlNodeType) => firstNodePredicate(n => n.type === type);
export const nodeName = (name: string) => firstNodePredicate(n => isElement(n) && caseInsensitiveEq(n.name, name));
export const nodeComment = (content: string) => firstNodePredicate(n => isComment(n) && n.content === content);

export const elementChildren = <T>(name: string, parser: Parser<T>) => translate(
    and(nodeName(name), children(parser)),
    results => results[1]
);

export const textNode = <T>(f: (text: string) => T | null) => firstNode(node =>
    node.type === 'text'
        ? f(node.text)
        : null
);

export function children<T>(parser: Parser<T>): Parser<T> {
    return input => {
        const list = split(input);
        if (list.head && hasChildren(list.head)) {
            const result = parser(list.head.children);
            if (result.success) {
                return success(result.value, list.tail);
            }
        }
        return fail();
    };
}

export function not(parser: Parser<any>): Parser {
    return input => {
        const list = split(input);
        if (list.head) {
            const result = parser(input);
            if (!result.success) {
                return success(list.head, list.tail);
            }
        }
        return fail();
    };
}

export function and<T1, T2>(p1: Parser<T1>, p2: Parser<T2>): Parser<[T1, T2]>;
export function and<T1, T2, T3>(p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>): Parser<[T1, T2, T3]>;
export function and<T1, T2, T3, T4>(p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>, p4: Parser<T4>): Parser<[T1, T2, T3, T4]>;
export function and(...ps: Array<Parser<any>>): Parser<any[]> {
    return input => {
        const results = [];
        let lastInput = input;
        for (let i = 0; i < ps.length; i++) {
            const result = ps[i](input);
            if (!result.success) {
                return result;
            }
            results.push(result.value);
            lastInput = result.next;
        }

        return success(results, lastInput);
    };
}

export function seq<T1, T2>(p1: Parser<T1>, p2: Parser<T2>): Parser<[T1, T2]>;
export function seq<T1, T2, T3>(p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>): Parser<[T1, T2, T3]>;
export function seq<T1, T2, T3, T4>(p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>, p4: Parser<T4>): Parser<[T1, T2, T3, T4]>;
export function seq(...ps: Array<Parser<any>>): Parser<any[]> {
    return input => {
        let currentInput = input;
        const results = [];
        for (let i = 0; i < ps.length; i++) {
            const result = ps[i](currentInput);
            if (!result.success) {
                return result;
            }
            results.push(result.value);
            currentInput = result.next;
        }

        return success(results, currentInput);
    };
}

export function choice<T1, T2>(p1: Parser<T1>, p2: Parser<T2>): Parser<T1 | T2>;
export function choice<T1, T2, T3>(p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>): Parser<T1 | T2 | T3>;
export function choice<T1, T2, T3, T4>(p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>, p4: Parser<T4>): Parser<T1 | T2 | T3 | T4>;
export function choice(...ps: Array<Parser<any>>): Parser<any[]> {
    return input => {
        for (let i = 0; i < ps.length; i++) {
            const result = ps[i](input);
            if (result.success) {
                return result;
            }
        }

        return fail();
    };
}

export function some<T>(parser: Parser<T>): Parser<T[]> {
    return input => {
        const results: T[] = [];
        let currentInput = input;
        let currentResult: Result<T>;
        do {
            currentResult = parser(currentInput);
            if (currentResult.success) {
                results.push(currentResult.value);
                currentInput = currentResult.next;
            }
        } while (currentResult.success);

        return success(results, currentInput);
    };
}

export function translate<From, To>(parser: Parser<From>, f: (from: From) => To): Parser<To> {
    return input => {
        const from = parser(input);
        return from.success
            ? success(f(from.value), from.next)
            : from
            ;
    };
}

export function between<T>(left: Parser<any>, right: Parser<any>, inside: Parser<T>): Parser<T> {
    return input => {
        const result = seq(
            some(not(left)),
            left,
            some(not(right)),
            right,
        )(input);

        return result.success
            ? inside(result.value[2])
            : fail()
            ;
    };
}

export function skipToNode<T>(node: Parser<any>, then: Parser<T>): Parser<T> {
    return translate(
        seq(
            some(not(node)),
            and(node, then),
        ),
        ([pre, [n, result]]) => result,
    );
}

export function parsePath<T>(path: string[], then: Parser<T>): Parser<T> {
    return children(path.reduceRight((res, p) => skipToNode(nodeName(p), children(res)), then));
}
