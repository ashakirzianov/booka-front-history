import { parseHtml } from './converterAzLibRu';
import { text } from './warAndPeace';

it('War and Peace parsing', () => {
    const wpXml = parseHtml(text);
    expect(wpXml).toBeDefined();
    expect(wpXml.type).toBe('document');
});
