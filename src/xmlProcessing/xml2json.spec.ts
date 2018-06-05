import { success, Input, skipToNode, elementName, parsePath, children } from "./xml2json";
import { makeElementNode } from "./xmlNode";

export const trueParser = <T>(result: T) => (input: Input) => success(result, input);
export const falseParser = (input: Input) => fail();

it('skipToNode', () => {
    const input = [
        makeElementNode('a'),
        makeElementNode('b'),
        makeElementNode('c', [
            makeElementNode('ca'),
        ]),
        makeElementNode('b'),
    ];

    const parser = skipToNode(elementName('c'), children(elementName('ca')));

    const result = parser(input);
    expect(result.success).toBeTruthy();
    expect((result as any).value.name).toBe('ca');
});

it('pathParser', () => {
    const input = [
        makeElementNode('a'),
        makeElementNode('b'),
        makeElementNode('c', [
            makeElementNode('ca'),
            makeElementNode('cb', [
                makeElementNode('cba'),
            ]),
        ]),
    ];

    const parser = parsePath(['c'], nodes => success({}, nodes));

    const result = parser(input);

    expect(result.success).toBeTruthy();
});
