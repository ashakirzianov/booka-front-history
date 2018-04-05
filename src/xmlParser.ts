import * as parseXmlLib from '@rgrove/parse-xml';

export type XmlNodeBase<T extends string> = { type: T, parent: XmlNode };
export type XmlNode = XmlNodeDocument | XmlNodeElement | XmlNodeText | XmlNodeCData | XmlNodeComment;
export type XmlNodeWithParent<T extends string> = XmlNodeBase<T> & { parent: XmlNode };
export type XmlNodeDocument = { type: 'document', children: XmlNode };
export type XmlNodeElement = XmlNodeBase<'element'> & { children: XmlNode };
export type XmlNodeText = XmlNodeBase<'text'> & { text: string };
export type XmlNodeCData = XmlNodeBase<'cdata'> & { text: string };
export type XmlNodeComment = XmlNodeBase<'comment'> & { content: string };

export function parseXml(xml: string): XmlNode {
    const result = parseXmlLib(xml);
    return result;
}
