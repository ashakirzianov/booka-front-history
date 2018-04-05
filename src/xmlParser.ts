import { parseString } from 'xml2js';

export type XmlObject = any;

export async function parseXml(xml: string): Promise<XmlObject> {
    return new Promise((resolve, reject) => {
        parseString(xml, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

export function parseXmlSync(xml: string): XmlObject {
    let result: XmlObject;

    parseString(xml, { async: false }, (err, res) => {
        if (err) {
            throw err;
        } else {
            result = res;
        }
    });

    return result; // rely on the fact that xml2js is implemented synchronously
}
