import * as parseXmlLib from '@rgrove/parse-xml';

export type XmlObject = any;

export function parseXml(xml: string): XmlObject {
    const result = parseXmlLib(xml);
    return result;
}
