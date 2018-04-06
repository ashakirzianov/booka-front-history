import { parseAzLibRuHtml } from './converterAzLibRu';
import { text } from '../samples/warAndPeace';

it('War and Peace parsing', () => {
    const wpXml = parseAzLibRuHtml(text);
    expect(wpXml).toBeDefined();
    expect(wpXml.type).toBe('document');
});
