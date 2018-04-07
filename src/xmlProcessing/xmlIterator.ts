import { Thunk } from "../utils";
import { XmlNode, XmlNodeDocument, hasChildren, isElement } from "./xmlNode";

export type XmlIterator = {
    prevSibling: Thunk<XmlIterator>,
    nextSibling: Thunk<XmlIterator>,
    child: Thunk<XmlIterator>,
    node: XmlNode,
    parent: Thunk<XmlIterator>,
} | undefined;

export const nullIteratorThunk: Thunk<XmlIterator> = () => undefined;

function make(value: XmlIterator): XmlIterator {
    return value;
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
