import { text as shortText } from '../samples/warAndPeaceShort';
import { throwExp } from '../utils';
import { tree2book, html2xml } from './azLibRu';
import { string2tree } from './xmlNode';

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
