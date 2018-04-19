import { Input, Parser, Success, Fail, anyNumberOf, ifNotStarts, builder } from "pegts";
import { XmlNode, XmlNodeType, hasChildren } from "./xmlNode";
import { fparser } from "./pegtsExtensions";

export type XmlInput = Input<XmlNode[]>;
export type XmlTreeParser<T = XmlNode> = Parser<XmlNode[], T>;

class XmlInputImpl implements Input<XmlNode[]> {
    constructor(readonly stream: XmlNode[]) { }

    bite(n: number) {
        return n > this.stream.length
            ? new XmlInputImpl([])
            : new XmlInputImpl(this.stream.slice(n))
            ;
    }
}

export function xmlInput(nodes: XmlNode[]) {
    return new XmlInputImpl(nodes);
}

function firstNode(nodes: XmlNode[]): XmlNode | undefined {
    return nodes.length > 0
        ? nodes[0]
        : undefined
        ;
}

abstract class XmlNodeParser implements XmlTreeParser {
    parse(input: XmlInput) {
        const node = firstNode(input.stream);
        return node
            ? new Success(node, input.bite(1), 1)
            : new Fail(1)
            ;
    }

    abstract match(node: XmlNode): boolean;
}

class XmlNodeTypeParser extends XmlNodeParser {
    constructor(readonly type: XmlNodeType) { super(); }

    match(node: XmlNode) {
        return node.type === this.type;
    }
}

export function nodeType(type: XmlNodeType) {
    return builder(new XmlNodeTypeParser(type));
}

class XmlNodeNameParser extends XmlNodeParser {
    constructor(readonly name: string) { super(); }

    match(node: XmlNode) {
        return node.type === 'element' && node.name === this.name;
    }
}

export function nodeName(name: string) {
    return builder(new XmlNodeNameParser(name));
}

class XmlChildrenParser<T> implements XmlTreeParser<T> {
    constructor(readonly childrenParser: XmlTreeParser<T>) { }

    parse(input: XmlInput) {
        const node = firstNode(input.stream);
        return node && hasChildren(node)
            ? this.childrenParser.parse(xmlInput(node.children))
            : new Fail(1)
            ;
    }
}

export function children<T>(childrenParser: XmlTreeParser<T>) {
    return builder(new XmlChildrenParser(childrenParser));
}

class XmlNodeAnyParser extends XmlNodeParser {
    match(node: XmlNode) {
        return true;
    }
}

export function anyNode() {
    return builder(new XmlNodeAnyParser());
}

class XmlNodeFuncParser<T> implements XmlTreeParser<T> {
    constructor(readonly f: (node: XmlNode) => T | null) {}

    parse(input: XmlInput) {
        const node = firstNode(input.stream);
        const result = node ? this.f(node) : null;
        return result !== null
            ? new Success(result, input.bite(1), 1)
            : new Fail(1)
            ;
    }
}

export function nodeFunc<T>(f: (node: XmlNode) => T | null) {
    return builder(new XmlNodeFuncParser(f));
}

export function notNode(parser: XmlTreeParser) {
    return ifNotStarts(parser).followedBy(anyNode()).map((ignore, actual) => actual);
}

export function between<T>(left: XmlTreeParser, right: XmlTreeParser, inside: XmlTreeParser<T>): XmlTreeParser<T> {
    return builder(fparser<XmlNode[], T>(input => {
        const result = anyNumberOf(notNode(left))
            .followedBy(left)
            .followedBy(anyNumberOf(notNode(right)))
            .followedBy(right)
            .map((pre, l, i, r) => inside.parse(xmlInput(i))).parse(input);

        return result.success ? result.value : result;
    }));
}
