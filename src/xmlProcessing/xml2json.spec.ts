import { skipToNode, elementName, parsePath, children, element } from "./xml2json";
import { xmlElement, XmlNode } from "./xmlNode";
import { htmlFragmentToNodes } from "./xmlUtils";
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

    const parser = parsePath(['root', 'c', 'cb', 'cba'], elementName('cba'));

    const result = parser(input);

    expectSuccess(result);
});

it('element', () => {
    const xml = `<div class="title2">
    <h2>Author</h2>
    <h2>Line 2</h2>
    <h2>Book Title</h2>
  </div>`;
    const input = htmlFragmentToNodes(xml);
    const parser = element({
        name: 'div',
        attrs: { class: 'title2' },
    });
    const result = parser(input);

    expect(result.success).toBeTruthy();
});
