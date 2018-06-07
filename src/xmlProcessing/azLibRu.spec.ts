import { text as shortText } from '../samples/warAndPeaceShort';
import { throwExp } from '../utils';
import { tree2book, html2xml, nonParagraphStart, paragraph, bookInfo, junkAtTheBeginning } from './azLibRu';
import { string2tree, xmlText, xmlElement } from './xmlNode';
import { skipToNode } from './xml2json';
import { htmlFragmentToNodes } from './xmlUtils';

it('War and Peace short parsing', () => {
    const xmlString = html2xml(shortText);
    const xmlTree = string2tree(xmlString);
    expect(xmlTree).toBeDefined();
    expect(xmlTree.type).toBe('document');

    const bookResult = tree2book([xmlTree]);
    expect(bookResult.success).toBeTruthy();
    const book = bookResult.success ? bookResult.value : throwExp(new Error("Failed to parse book"));
    expect(book.title).toBe('Война и мир. Том 1');
    expect(book.author).toBe('Лев Николаевич Толстой');
    expect(book.content.every(n => n !== undefined));
});

it('nonParagraphStart', () => {
    const notStart = nonParagraphStart([xmlText('Not a paragraph start')]);
    expect(notStart.success).toBeTruthy();
    expect(notStart.success && notStart.value).toBe('Not a paragraph start');

    const start = nonParagraphStart([xmlText('    Paragraph start')]);
    expect(start.success).toBeFalsy();
});

it('junkAtTheBeginning', () => {
    const junkStr = `
    <dd>&nbsp;&nbsp;---------------------------------------------------------------
    <dd>&nbsp;&nbsp;     <a href=http://www.magister.msk.ru/library/library.htm>OCR: Олег Колесников, http://www.magister.msk.ru</a>
    <dd>&nbsp;&nbsp;---------------------------------------------------------------
    `;
    const junkXml = htmlFragmentToNodes(junkStr, html2xml);

    const result = junkAtTheBeginning(junkXml);
    expect(result.success);
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

it('bookInfo', () => {
    const input = [
        xmlElement('a'),
        xmlElement('b'),
        xmlElement('ul', [
            xmlElement('a', [], { name: '0' }),
            xmlElement('h2', [
                xmlText('John Smith. Hello'),
            ]),
        ]),
    ];

    const result = skipToNode(bookInfo)(input);

    expect(result.success).toBeTruthy();
    expect(result.success && result.value).toEqual({ title: 'Hello', author: 'John Smith' });
});
