import { text as shortText } from '../samples/warAndPeaceShort';
import { throwExp } from '../utils';
import { tree2book, html2xml, nonParagraphStart, paragraph } from './azLibRu';
import { string2tree, makeTextNode, makeElementNode } from './xmlNode';

it('War and Peace short parsing', () => {
    const xmlString = html2xml(shortText);
    const xmlTree = string2tree(xmlString);
    expect(xmlTree).toBeDefined();
    expect(xmlTree.type).toBe('document');

    const bookResult = tree2book([xmlTree]);
    expect(bookResult.success).toBeTruthy();
    const book = bookResult.success ? bookResult.value : throwExp(new Error("Failed to parse book"));
    expect(book.title).toBe('Test');
    expect(book.content.every(n => n !== undefined));
});

it('nonParagraphStart', () => {
    const notStart = nonParagraphStart([makeTextNode('Not a paragraph start')]);
    expect(notStart.success).toBeTruthy();
    expect(notStart.success && notStart.value).toBe('Not a paragraph start');

    const start = nonParagraphStart([makeTextNode('    Paragraph start')]);
    expect(start.success).toBeFalsy();
});

it('paragraph', () => {
    const p = paragraph([
        makeTextNode('     One '),
        makeElementNode('dd'),
        makeTextNode('Two'),
        makeElementNode('dd'),
        makeTextNode('  Three'),
        makeTextNode('   Four'),
    ]);
    expect(p.success).toBeTruthy();
    expect(p.success && p.value)
        .toBe('     One Two  Three   Four');
});
