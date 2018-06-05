import { text as shortText } from '../samples/warAndPeaceShort';
import { throwExp } from '../utils';
import { tree2book, html2xml, nonParagraphStart, paragraph, title } from './azLibRu';
import { string2tree, xmlText, xmlElement } from './xmlNode';
import { skipToNode } from './xml2json';

it('War and Peace short parsing', () => {
    const xmlString = html2xml(shortText);
    const xmlTree = string2tree(xmlString);
    expect(xmlTree).toBeDefined();
    expect(xmlTree.type).toBe('document');

    const bookResult = tree2book([xmlTree]);
    expect(bookResult.success).toBeTruthy();
    const book = bookResult.success ? bookResult.value : throwExp(new Error("Failed to parse book"));
    expect(book.title).toBe('Лев Николаевич Толстой. Война и мир. Том 1');
    expect(book.content.every(n => n !== undefined));
});

it('nonParagraphStart', () => {
    const notStart = nonParagraphStart([xmlText('Not a paragraph start')]);
    expect(notStart.success).toBeTruthy();
    expect(notStart.success && notStart.value).toBe('Not a paragraph start');

    const start = nonParagraphStart([xmlText('    Paragraph start')]);
    expect(start.success).toBeFalsy();
});

it('paragraph', () => {
    const p = paragraph([
        xmlText('     One '),
        xmlElement('dd'),
        xmlText('Two'),
        xmlElement('dd'),
        xmlText('  Three'),
        xmlText('   Four'),
    ]);
    expect(p.success).toBeTruthy();
    expect(p.success && p.value)
        .toBe('One Two Three Four ');
});

it('title', () => {
    const input = [
        xmlElement('a'),
        xmlElement('b'),
        xmlElement('ul', [
            xmlElement('a', [], { name: '0' }),
            xmlElement('h2', [
                xmlText('Hello'),
            ]),
        ]),
    ];

    const result = skipToNode(title)(input);

    expect(result.success).toBeTruthy();
    expect(result.success && result.value).toBe('Hello');
});
