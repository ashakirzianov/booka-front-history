import {
    XmlNode, hasChildren, XmlNodeType, isElement,
    isComment, XmlAttributes, XmlNodeElement,
} from "./xmlNode";
import { caseInsensitiveEq, isWhitespaces } from "./xmlUtils";
import {
    Parser, Result, success, fail,
    firstNodeGeneric, firstNodePredicate,
    split, seq, some, not, projectLast, report,
    translate, and,
} from "./parserCombinators";

export type XmlParser<TOut = XmlNode> = Parser<XmlNode, TOut>;

export const firstNodeXml = firstNodeGeneric<XmlNode>();

export const nodeAny = firstNodeXml(x => x);
export const nodeType = (type: XmlNodeType) => firstNodePredicate<XmlNode>(n => n.type === type);
export const nodeComment = (content: string) => firstNodeXml(n =>
    isComment(n) && n.content === content
        ? n : null
);

function nameCompare(n1: string, n2: string) {
    return caseInsensitiveEq(n1, n2);
}

function attrsCompare(attrs1: XmlAttributes, attrs2: XmlAttributes) {
    return Object.keys(attrs1).every(k =>
        (attrs1[k] === attrs2[k])
        || (!attrs1[k]) // TODO: consider implementing 'negative' comparison
    );
}

export const elementName = (name: string) => firstNodeXml(n =>
    isElement(n) && nameCompare(n.name, name)
        ? n : null
);
export const elementAttributes = (attrs: XmlAttributes) => firstNodeXml(n =>
    isElement(n) && attrsCompare(attrs, n.attributes)
        ? n : null
);
export const elementChildren = <T>(name: string, parser: XmlParser<T>) => translate(
    and(elementName(name), children(parser)),
    results => results[1]
);
export const projectElement = <T>(f: (e: XmlNodeElement) => T | null) =>
    firstNodeXml(n => isElement(n) ? f(n) : null);

type ElementParserArg =
    | string // match element name
    | ((node: XmlNodeElement) => boolean) // element predicate
    ;
export function element<T>(arg: ElementParserArg, ch: XmlParser<T>): XmlParser<T>;
export function element<T>(arg: ElementParserArg): XmlParser<XmlNodeElement>;
export function element<T>(arg: ElementParserArg, ch?: XmlParser<T>): XmlParser<T | XmlNodeElement> {
    return function f(input: XmlNode[]) {
        const list = split(input);
        if (!list.head) {
            return fail('element: empty input');
        }

        if (!isElement(list.head)) {
            return fail('element: head is not an element');
        }

        if (typeof arg === 'string') {
            if (!nameCompare(arg, list.head.name)) {
                return fail(`element: name ${list.head.name} does not match ${arg}`);
            }
        } else {
            if (!arg(list.head)) {
                return fail('element: predicate failed');
            }
        }

        if (ch) {
            const result = ch(list.head.children);
            if (!result.success) {
                return result;
            } else {
                return success(result.value, list.tail);
            }
        }

        return success(list.head, list.tail);
    };
}

export const textNode = <T>(f: (text: string) => T | null) => firstNodeXml(node =>
    node.type === 'text'
        ? f(node.text)
        : null
);

export const whitespaces = textNode(text => isWhitespaces(text) ? true : null);

export function afterWhitespaces<T>(parser: XmlParser<T>): XmlParser<T> {
    return translate(
        seq(whitespaces, parser),
        ([_, result]) => result,
    );
}

export function beforeWhitespaces<T>(parser: XmlParser<T>): XmlParser<T> {
    return translate(
        seq(parser, whitespaces),
        ([result, _]) => result,
    );
}

export function children<T>(parser: XmlParser<T>): XmlParser<T> {
    return input => {
        const list = split(input);
        if (!list.head) {
            return fail('children: empty input');
        }
        if (!hasChildren(list.head)) {
            return fail('children: no children');
        }

        const result = parser(list.head.children);
        if (result.success) {
            return success(result.value, list.tail);
        } else {
            return result;
        }
    };
}

export function parent<T>(parser: XmlParser<T>): XmlParser<T> {
    return input => {
        const list = split(input);
        if (!list.head) {
            return fail('parent: empty input');
        }
        if (!list.head.parent) {
            return fail('parent: no parent');
        }

        const result = parser([list.head.parent]);
        if (result.success) {
            return success(result.value, list.tail);
        } else {
            return result;
        }
    };
}

export function between<T>(left: XmlParser<any>, right: XmlParser<any>, inside: XmlParser<T>): XmlParser<T> {
    return input => {
        const result = seq(
            some(not(left)),
            left,
            some(not(right)),
            right,
        )(input);

        return result.success
            ? inside(result.value[2])
            : result
            ;
    };
}

// TODO: make universal and move to parserCombinators
export function skipToNode<T>(node: XmlParser<T>): XmlParser<T> {
    return projectLast(seq(
        some(not(node)),
        node,
    ));
}

// TODO: handle empty path scenario
function parsePathHelper<T>(paths: string[], then: XmlParser<T>, input: XmlNode[]): Result<XmlNode, T> {
    const path = paths[0];

    const childIndex = input.findIndex(ch =>
        ch.type === 'element' && nameCompare(ch.name, path));
    const child = input[childIndex];
    if (!child) {
        return fail(`parse path: ${path}: can't find child`);
    }

    if (paths.length < 2) {
        return report('parse path: then', then)(input.slice(childIndex));
    }

    const nextInput = hasChildren(child) ? child.children : []; // TODO: rethink

    return parsePathHelper(paths.slice(1), then, nextInput);
}

export function parsePath<T>(paths: string[], then: XmlParser<T>): XmlParser<T> {
    return (input: XmlNode[]) => parsePathHelper(paths, then, input);
}
