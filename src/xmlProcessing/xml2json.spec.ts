import { success, Input, skipToNode, elementName, parsePath, children, and } from "./xml2json";
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

    const parser = skipToNode(and(elementName('c'), children(elementName('ca'))));

    const result = parser(input);
    expect(result.success).toBeTruthy();
    expect((result as any).value[1].name).toBe('ca');
});

it('pathParser', () => {
    const input = [makeElementNode('root', [
        makeElementNode('a'),
        makeElementNode('b'),
        makeElementNode('c', [
            makeElementNode('ca'),
            makeElementNode('cb', [
                makeElementNode('cba'),
            ]),
        ]),
    ])];

    const parser = parsePath(['c', 'cb', 'cba'], elementName('cba'));

    const result = parser(input);

    expect(result.success).toBeTruthy();
});
