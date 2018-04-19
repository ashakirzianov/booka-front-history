import * as parseXmlLib from '@rgrove/parse-xml';
import { XmlNodeDocument } from './xmlNode';

export function parseXml(xml: string): XmlNodeDocument {
    return parseXmlLib(xml, { preserveComments: true });
}
