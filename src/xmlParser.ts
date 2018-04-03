import { parseString } from 'xml2js';

export type XmlObject = {
    [key in string]?: XmlObject;
};

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
    let result: XmlObject = {};
    parseXml(xml)
        .then(res => { result = res; })
        .catch(err => { throw err; });

    return result; // rely on the fact that xml2js is implemented synchronously
}
