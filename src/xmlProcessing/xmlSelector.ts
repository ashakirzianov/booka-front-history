import * as Iterators from "./xmlIterator";
import { XmlIterator } from "./xmlIterator";
import { letExp, combineF } from "../utils";
import { isElement, XmlAttributes } from "./xmlNode";

export type XmlSelector<T> = (iterator: XmlIterator) => T | undefined;
export type ChainSelector = XmlSelector<XmlIterator>;
export type ChainSelectorCons<T> = (x: T) => ChainSelector;

export const name: XmlSelector<string> = xi => xi && isElement(xi.node) ? xi.node.name : undefined;
export const attributes: XmlSelector<XmlAttributes> = xi => xi && isElement(xi.node) ? xi.node.attributes : undefined;
export const child: ChainSelector = xi => xi && xi.child();
export const next: ChainSelector = xi => xi && xi.nextSibling();
export const prev: ChainSelector = xi => xi && xi.prevSibling();
export const path: ChainSelector = xi => xi;
export const siblingByName: ChainSelectorCons<string> = n => function f(xi: XmlIterator): XmlIterator {
    return xi ?
        (name(xi) === n ? xi : f(next(xi)))
        : undefined;
};
export const childrenByName: ChainSelectorCons<string> = n => combineF(child, siblingByName(n));
