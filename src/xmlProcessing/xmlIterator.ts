import { Thunk } from "../utils";
import { XmlNode, XmlNodeDocument, hasChildren, isElement } from "./xmlNode";

export type XmlIteratorValue = {
    prevSibling: Thunk<XmlIterator>,
    nextSibling: Thunk<XmlIterator>,
    child: Thunk<XmlIterator>,
    node: XmlNode,
    parent: Thunk<XmlIterator>,
};
export type XmlIterator = { value: XmlIteratorValue, done: false } | { done: true };

export const doneIterator: XmlIterator = { done: true };
export const nullIteratorThunk: Thunk<XmlIterator> = () => doneIterator;

export function name(xi: XmlIterator) {
    return !xi.done && isElement(xi.value.node) ? xi.value.node.name : undefined;
}

export function attributes(xi: XmlIterator) {
    return !xi.done && isElement(xi.value.node) ? xi.value.node.attributes : undefined;
}

export function child(xi: XmlIterator) {
    const children = !xi.done ? xi.value.child() : undefined;
    return children && !children.done ? children : undefined;
}

function make(value: XmlIteratorValue): XmlIterator {
    return {
        value,
        done: false,
    };
}

export function rootIterator(root: XmlNodeDocument): XmlIterator {
    return make({
        prevSibling: nullIteratorThunk,
        nextSibling: nullIteratorThunk,
        parent: nullIteratorThunk,
        child: buildChildIteratorThunk(root.children),
        node: root,
    });
}

function buildIteratorThunk(node: XmlNode | undefined): Thunk<XmlIterator> {
    if (!node) {
        return nullIteratorThunk;
    }

    if (node.type === 'document') {
        return () => rootIterator(node);
    }

    const indexInParent = node.parent.children.indexOf(node);
    return buildChildIteratorThunk(node.parent.children, indexInParent);
}

function buildChildIteratorThunk(siblings: XmlNode[], index: number = 0): Thunk<XmlIterator> {
    const node = siblings[index];
    return () => make({
        prevSibling: index > 0 ? buildChildIteratorThunk(siblings, index - 1) : nullIteratorThunk,
        nextSibling: index < siblings.length - 1 ? buildChildIteratorThunk(siblings, index + 1) : nullIteratorThunk,
        child: hasChildren(node) ? buildChildIteratorThunk(node.children) : buildChildIteratorThunk([]),
        parent: buildIteratorThunk(node.parent),
        node: node,
    });
}
