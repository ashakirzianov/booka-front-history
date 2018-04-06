import { parseHtml, htmlToWellFormedXml } from './converterAzLibRu';
import { text } from './warAndPeace';
import { parseXml } from '../xmlParser';

it.only('Test html->xml converting', () => {
    // debugger; // tslint:disable-line
    const htmlExample = `
    <center>
<table width='90%' border='0' cellpadding=0 cellspacing=0>

</table>

<hr noshade size=2>

</center>
`;
    const wellXml = htmlToWellFormedXml(htmlExample);
    console.log(wellXml); // tslint:disable-line
    const wpXml = parseXml(wellXml);
    expect(wpXml).toBeDefined();
    expect(wpXml.type).toBe('document');
});

it('War and Peace parsing', () => {
    debugger; // tslint:disable-line
    const wpXml = parseHtml(text);
    expect(wpXml).toBeDefined();
    expect(wpXml.type).toBe('document');
});
