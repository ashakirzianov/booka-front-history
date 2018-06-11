import { success, Input, skipToNode, elementName, parsePath, children, and } from "./xml2json";
import { xmlElement } from "./xmlNode";

export const trueParser = <T>(result: T) => (input: Input) => success(result, input);
export const falseParser = (input: Input) => fail();

it('skipToNode', () => {
    const input = [
        xmlElement('a'),
        xmlElement('b'),
        xmlElement('c', [
            xmlElement('ca'),
        ]),
        xmlElement('b'),
    ];

    const parser = skipToNode(and(elementName('c'), children(elementName('ca'))));

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

    const parser = parsePath(['c', 'cb', 'cba'], elementName('cba'));

    const result = parser(input);

    expect(result.success).toBeTruthy();
});