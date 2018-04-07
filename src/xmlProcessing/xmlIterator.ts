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
        children: buildIterator(root.children, 0),
        node: root,
    });
}

function buildParentIterator(parent: XmlNodeWithChildren | undefined): Thunk<XmlIterator> {
    if (!parent) {
        return nullIterator;
    }

    if (parent.type === 'document') {
        return () => rootIterator(parent);
    }

    const indexInParent = parent.parent.children.indexOf(parent);
    return () => make({
        ...buildSiblingIterators(parent.parent.children, indexInParent),
        children: buildIterator(parent.children),
        parent: buildParentIterator(parent.parent),
        node: parent,
    });
}

function buildIterator(siblings: XmlNode[], index: number = 0): Thunk<XmlIterator> {
    const node = siblings[index];
    return () => make({
        ...buildSiblingIterators(siblings, index),
        children: hasChildren(node) ? buildIterator(node.children) : buildIterator([]),
        parent: buildParentIterator(node.parent),
        node: node,
    });
}

function buildSiblingIterators(siblings: XmlNode[], index: number = 0) {
    return {
        prevSibling: index > 0 ? buildIterator(siblings, index - 1) : nullIterator,
        nextSibling: index < siblings.length - 1 ? buildIterator(siblings, index + 1) : nullIterator,
    };
}
