export type XmlAttributes = { [key: string]: string | undefined };
export type XmlNodeBase<T extends string> = { type: T, parent: XmlNodeWithChildren };
export type XmlNode = XmlNodeDocument | XmlNodeElement | XmlNodeText | XmlNodeCData | XmlNodeComment;
export type XmlNodeWithParent<T extends string> = XmlNodeBase<T> & { parent: XmlNodeWithChildren };
export type XmlNodeDocument = { type: 'document', children: XmlNode[], parent: undefined };
export type XmlNodeElement = XmlNodeBase<'element'> & {
    name: string,
    attributes: XmlAttributes,
    children: XmlNode[],
};
export type XmlNodeText = XmlNodeBase<'text'> & { text: string };
export type XmlNodeCData = XmlNodeBase<'cdata'> & { text: string };
export type XmlNodeComment = XmlNodeBase<'comment'> & { content: string };

export type XmlNodeType = XmlNode['type'];

export type XmlNodeWithChildren = XmlNodeDocument | XmlNodeElement;
export function hasChildren(node: XmlNode): node is XmlNodeWithChildren {
    return (node.type === 'document' || node.type === 'element') && node.children !== undefined;
}

export function isElement(node: XmlNode): node is XmlNodeElement {
    return node.type === 'element';
}
