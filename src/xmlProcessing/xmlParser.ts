import * as parseXmlLib from '@rgrove/parse-xml';
import { XmlNode } from './xmlNode';

export function parseXml(xml: string): XmlNode {
    return parseXmlLib(xml);
}
