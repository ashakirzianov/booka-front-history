import { combineFs, throwExp, trim } from '../utils';
import { string2tree } from './xmlNode';
import { html2xmlFixes, multiRun } from './html2xml';
import {
    translate, nodeAny, choice, some, between, nodeComment, parsePath,
    elementChildren,
    textNode,
    seq,
    nodeName,
} from "./xml2json";

function fixSpecialCaseAzLibRu(html: string) {
    return html
        .replace('Статистика.</a></div>', 'Статистика.</a>')
        .replace(
            '<table align=center width=90% border=0 cellspacing=10><td align=center><font size=-1>',
            '<table align=center width=90% border=0 cellspacing=10><td align=center /><font size=-1>')
        .replace(/<ul><font color="#555555">\s*<\/ul><\/font>/gi, '<ul><font color="#555555"></font></ul>')
        ;
}

export function fixRemoveNbsp(html: string) {
    return multiRun(input => input
        .replace('&nbsp;', '')
    )(html);
}

export const html2xml = combineFs(
    html2xmlFixes,
    fixRemoveNbsp,
    fixSpecialCaseAzLibRu,
);

const startMarker = 'Собственно произведение'; // spellchecker:disable-line
const stopMarker = '';

const bookStartParser = nodeComment(startMarker);
const bookEndParser = nodeComment(stopMarker);

const anyText = textNode(t => t);

const italicText = elementChildren('I', anyText);

export const paragraphSpaces = '    ';
export const nonParagraphStart = choice(
    textNode(t => t.startsWith(paragraphSpaces) ? null : t),
    italicText,
    translate(nodeName('dd'), node => ''),
);

function trimNewLines(line: string) {
    return trim(line, '\n');
}

export const paragraph = translate(
    seq(anyText, some(nonParagraphStart)),
    ([first, rest]) => rest.reduce((acc, cur) => acc + trimNewLines(cur), trimNewLines(first)),
);

const skipParser = translate(nodeAny, n => null);

const bookNodeParser = choice(paragraph, skipParser);

const primitiveBookParser = translate(
    some(bookNodeParser),
    nodes => ({
        kind: 'book' as 'book',
        title: 'Test',
        content: nodes.filter(node => node !== null) as string[],
    })
);

const bodyParser = between(bookStartParser, bookEndParser, primitiveBookParser);

export const tree2book = parsePath(['html', 'body'], bodyParser);

export function string2book(html: string) {
    const xmlString = html2xml(html);
    const xmlTree = string2tree(xmlString);
    const bookResult = tree2book([xmlTree]);

    return bookResult.success
        ? bookResult.value
        : throwExp(new Error("Couldn't parser the book"))
        ;
}
