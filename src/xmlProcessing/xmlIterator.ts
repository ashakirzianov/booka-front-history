import { Thunk } from "../utils";
import { XmlNode, XmlNodeDocument, XmlNodeWithChildren, hasChildren } from "./xmlNode";

export type XmlIteratorValue = {
    prevSibling: Thunk<XmlIterator>,
    nextSibling: Thunk<XmlIterator>,
    children: Thunk<XmlIterator>,
    node: XmlNode,
    parent: Thunk<XmlIterator>,
};
export type XmlIterator = { value: XmlIteratorValue, done: false } | { done: true };

const doneIterator: XmlIterator = { done: true };
const nullIterator: Thunk<XmlIterator> = () => doneIterator;
function make(value: XmlIteratorValue): XmlIterator {
    return {
        value,
        done: false,
    };
}

export function rootIterator(root: XmlNodeDocument): XmlIterator {
    return make({
        prevSibling: nullIterator,
        nextSibling: nullIterator,
        parent: nullIterator,
        children: buildChildIteratorThunk(root.children),
        node: root,
    });
}

function buildIteratorThunk(node: XmlNode | undefined): Thunk<XmlIterator> {
    if (!node) {
        return nullIterator;
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
        prevSibling: index > 0 ? buildChildIteratorThunk(siblings, index - 1) : nullIterator,
        nextSibling: index < siblings.length - 1 ? buildChildIteratorThunk(siblings, index + 1) : nullIterator,
        children: hasChildren(node) ? buildChildIteratorThunk(node.children) : buildChildIteratorThunk([]),
        parent: buildIteratorThunk(node.parent),
        node: node,
    });
}
