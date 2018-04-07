import * as parseXmlLib from '@rgrove/parse-xml';
import { XmlNode } from './xmlTraversing';

export function parseXml(xml: string): XmlNode {
    return parseXmlLib(xml);
}
