import { combineFs, throwExp } from '../utils';
import { parseXml } from './xmlNode';
import { html2xmlFixes } from './html2xml';
import { firstNode, translate, nodeAny, choice, some, children, nodeName, between, nodeComment, skipToNode } from "./xml2json";

function fixSpecialCaseAzLibRu(html: string) {
    return html
        .replace('Статистика.</a></div>', 'Статистика.</a>')
        .replace(
            '<table align=center width=90% border=0 cellspacing=10><td align=center><font size=-1>',
            '<table align=center width=90% border=0 cellspacing=10><td align=center /><font size=-1>')
        .replace(/<ul><font color="#555555">\s*<\/ul><\/font>/gi, '<ul><font color="#555555"></font></ul>')
        ;
}

export const html2xml = combineFs(
    html2xmlFixes,
    fixSpecialCaseAzLibRu,
);

const startMarker = 'Собственно произведение'; // spellchecker:disable-line
const stopMarker = '';

const bookStartParser = nodeComment(startMarker);
const bookEndParser = nodeComment(stopMarker);

const textParser = firstNode(node =>
    node.type === 'text'
        ? node.text
        : null
);

const skipParser = translate(nodeAny, n => null);

const bookNodeParser = choice(textParser, skipParser);

const primitiveBookParser = translate(
    some(bookNodeParser),
    nodes => ({
        kind: 'book' as 'book',
        title: 'Test',
        content: nodes.filter(node => node !== null) as string[],
    })
);

const bodyParser = between(bookStartParser, bookEndParser, primitiveBookParser);

export const tree2book = children(
    children(
        skipToNode(nodeName('body'), children(bodyParser)),
    ),
);

export function string2book(html: string) {
    const xmlString = html2xml(html);
    const xmlTree = parseXml(xmlString);
    const bookResult = tree2book([xmlTree]);

    return bookResult.success
        ? bookResult.value
        : throwExp(new Error("Couldn't parser the book"))
        ;
}
