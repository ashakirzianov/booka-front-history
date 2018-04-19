import { parseAzLibRuHtml } from './converterAzLibRu';
import { text } from '../samples/warAndPeace';
import { xmlInput } from './xml2json';
import { azLibRuParser } from './parserAzLibRu';
import { throwExp } from '../utils';

it('War and Peace parsing', () => {
    const wpXml = parseAzLibRuHtml(text);
    expect(wpXml).toBeDefined();
    expect(wpXml.type).toBe('document');

    debugger; // tslint:disable-line
    const parseResult = azLibRuParser.parse(xmlInput(wpXml.children));
    expect(parseResult.success).toBeTruthy();
    const wpBook = parseResult.success ? parseResult.value : throwExp(new Error("Failed to parse book"));
    expect(wpBook.title).toBe('Test');
});
