import { combineFs, throwExp, letExp } from '../utils';
import { string2tree } from './xmlNode';
import { html2xmlFixes } from './html2xml';
import {
    translate, nodeAny, choice, some, nodeComment, parsePath,
    elementChildren,
    textNode,
    seq,
    elementName,
    Parser,
    and,
    children,
    elementAttributes,
    skipToNode,
    projectLast,
    not,
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

export const bookStartParser = nodeComment(startMarker);
export const bookEndParser = nodeComment(stopMarker);

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
        children(seq(
            and(
                elementName('a'),
                elementAttributes({ name: level.toString() }),
            ),
            and(
                elementName('h2'),
                children(anyText),
            ),
        ))),
        ([ul, [a, [h2, text]]]) => text);
}

// ------

const skipParser = translate(nodeAny, n => null);

const bookNodeParser = choice(paragraph, skipParser);

export const primitiveBookParser = translate(
    some(bookNodeParser),
    nodes => ({
        kind: 'book' as 'book',
        title: 'Test',
        content: nodes.filter(node => node !== null) as string[],
    })
);

const authorSeparator = '. ';
export const bookInfo = translate(
    headlineParser(0),
    text => letExp(text.indexOf(authorSeparator), dotPos => dotPos > 0
        ? { author: text.substring(0, dotPos), title: text.substring(dotPos + authorSeparator.length) }
        : { author: undefined, title: text }
    ));

export const bookParser = translate(
    skipToNode(seq(bookInfo, some(projectLast(and(not(bookEndParser), bookNodeParser))))),
    ([bi, nodes]) => ({
        kind: 'book' as 'book',
        title: bi.title,
        author: bi.author,
        content: nodes.filter(node => node !== null) as string[],
    }),
);

export const bodyParser = bookParser;

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
