import { parseAzLibRuHtml } from './converterAzLibRu';
import { text } from '../samples/warAndPeace';
import { azLibRuParser } from './parserAzLibRu';
import { throwExp } from '../utils';

it('War and Peace parsing', () => {
    const wpXml = parseAzLibRuHtml(text);
    expect(wpXml).toBeDefined();
    expect(wpXml.type).toBe('document');

    const parseResult = azLibRuParser(wpXml.children);
    expect(parseResult.success).toBeTruthy();
    const wpBook = parseResult.success ? parseResult.value : throwExp(new Error("Failed to parse book"));
    expect(wpBook.title).toBe('Test');
});
