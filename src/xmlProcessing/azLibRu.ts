import { combineFs, throwExp } from '../utils';
import { string2tree } from './xmlNode';
import { html2xmlFixes } from './html2xml';
import {
    translate, nodeAny, choice, some, between, nodeComment, parsePath,
    elementChildren,
    textNode,
    seq,
    elementName,
    Parser,
    and,
    children,
    elementAttributes,
} from "./xml2json";
import { multiRun } from './xmlUtils';

// ---------- html2xml

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

// ---------- tree2json

export function textProcessing(text: string) {
    return text === ''
        ? ''
        : multiRun(input => input
            .replace('--', '—')
            .replace('  ', ' ')
        )(text.trim()) + ' ';
}

const startMarker = 'Собственно произведение'; // spellchecker:disable-line
const stopMarker = '';

const bookStartParser = nodeComment(startMarker);
const bookEndParser = nodeComment(stopMarker);

// ------ Paragraph
const anyText = textNode(t => t);

const italicText = elementChildren('i', anyText); // TODO: support italic
const supText = translate(elementName('sup'), node => ''); // TODO: process properly

export const paragraphSpaces = '    ';
export const nonParagraphStart = textNode(t =>
    t.startsWith(paragraphSpaces) ? null : t
);
const paragraphStart = anyText;

const withinParagraph = choice(
    italicText,
    supText,
    translate(elementName('dd'), node => ''),
);

export const paragraph = translate(
    seq(
        choice(paragraphStart, withinParagraph),
        some(choice(nonParagraphStart, withinParagraph)),
    ),
    ([first, rest]) => rest.reduce((acc, cur) => acc + textProcessing(cur), textProcessing(first)),
);

// ------ Structure

export function headlineParser(level: number): Parser<string> {
    return translate(and(
        elementName('ul'),
        children(and(
            elementName('a'),
            elementAttributes({ name: level.toString() }),
            children(and(
                elementName('h2'),
                children(anyText),
            )),
        )),
    ), r => r[1][2][1]);
}

// ------

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

export const tree2book = parsePath(['html', 'body'], children(bodyParser));

// ---------- string2book

export function string2book(html: string) {
    const xmlString = html2xml(html);
    const xmlTree = string2tree(xmlString);
    const bookResult = tree2book([xmlTree]);

    return bookResult.success
        ? bookResult.value
        : throwExp(new Error("Couldn't parser the book"))
        ;
}
