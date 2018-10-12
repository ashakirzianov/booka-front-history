import { loadText as shortTextLoad } from '../samples/warAndPeaceShort';
import { throwExp } from '../utils';
import {
    tree2book, html2xml, nonParagraphStart,
    paragraph, bookInfo, junkAtTheBeginning,
} from './azLibRu';
import { string2tree, xmlText, xmlElement } from './xmlNode';
import { htmlFragmentToNodes } from './xmlUtils';
import { expectDefined } from '../testUtils';
import { skipTo } from './parserCombinators';

it('War and Peace short parsing', () => {
    const xmlString = html2xml(shortTextLoad());
    const xmlTree = string2tree(xmlString);
    if (!expectDefined(xmlTree)) {
        return;
    }
    expect(xmlTree.type).toBe('document');

    const bookResult = tree2book(xmlTree.children);
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
    <dd>&nbsp;&nbsp;     <a href=http://www.magister.msk.ru/library/library.htm>OCR:, http://www.magister.msk.ru</a>
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

    const result = skipTo(bookInfo)(input);

    expect(result.success).toBeTruthy();
    expect(result.success && result.value).toEqual({ title: 'Hello', author: 'John Smith' });
});
