import { skipToNode, path, children, element } from "./xml2json";
import { xmlElement, XmlNode } from "./xmlNode";
import { expectSuccess } from "../testUtils";
import { success, and } from "./parserCombinators";

export const trueParser = <T>(result: T) => (input: XmlNode[]) => success(result, input);
export const falseParser = (input: XmlNode[]) => fail();

it('skipToNode', () => {
    const input = [
        xmlElement('a'),
        xmlElement('b'),
        xmlElement('c', [
            xmlElement('ca'),
        ]),
        xmlElement('b'),
    ];

    const parser = skipToNode(and(element('c'), children(element('ca'))));

    const result = parser(input);
    expect(result.success).toBeTruthy();
    expect((result as any).value[1].name).toBe('ca');
});

it('pathParser', () => {
    const input = [xmlElement('root', [
        xmlElement('a'),
        xmlElement('b'),
        xmlElement('c', [
            xmlElement('ca'),
            xmlElement('cb', [
                xmlElement('cba'),
            ]),
        ]),
    ])];

    const parser = path(['root', 'c', 'cb', 'cba'], element('cba'));

    const result = parser(input);

    expectSuccess(result);
});
