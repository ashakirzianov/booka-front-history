import { xmlElement } from "./xmlNode";
import { skipTo, and } from "./parserCombinators";
import { element, children } from "./xml2json";

it('skipTo', () => {
    const input = [
        xmlElement('a'),
        xmlElement('b'),
        xmlElement('c', [
            xmlElement('ca'),
        ]),
        xmlElement('b'),
    ];

    const parser = skipTo(and(element('c'), children(element('ca'))));

    const result = parser(input);
    expect(result.success).toBeTruthy();
    expect((result as any).value[1].name).toBe('ca');
});
