import { combineFs, throwExp, letExp } from '../utils';
import { string2tree } from './xmlNode';
import { html2xmlFixes } from './html2xml';
import {
    translate, nodeAny, choice, some, nodeComment, parsePath,
    elementChildren,
    textNode,
    seq,
    elementName,
    and,
    children,
    elementAttributes,
    skipToNode,
    projectLast,
    not,
    oneOrMore,
    XmlParser,
} from "./xml2json";
import { multiRun } from './xmlUtils';
import { Chapter, BookNode } from '../model/book';

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
export const skipParser = translate(nodeAny, n => undefined);
export const anyText = textNode(t => t);

export const junkAtTheBeginning = some(
    choice(elementName('dd'),
        elementName('a'),
        textNode(t => /^[ \n-]*$/.test(t) ? t : null),
    ));

// ------ Structure

export const headline = translate(and(
    elementName('ul'),
    children(seq(
        and(
            elementName('a'),
            elementAttributes({ name: undefined }),
        ),
        and(
            elementName('h2'),
            children(anyText),
        ),
    ))),
    ([ul, [[a, attr], [h2, text]]]) => ({
        text,
        level: parseInt(a.attributes.name || '-1', 10),
    }));

export function headlineLevel(level: number) {
    return translate(
        headline,
        hl => hl.level === level ? hl.text : null,
    );
}

// ------ Paragraph

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

// ------ Chapter

export const chapter: XmlParser<Chapter> = translate(
    seq(headline, junkAtTheBeginning, oneOrMore(projectLast(and(not(headline), choice(paragraph, skipParser))))),
    ([head, junk, pars]) => ({
        kind: 'chapter' as 'chapter',
        level: 0,
        title: head.text,
        content: pars.filter(n => n) as BookNode[],
    }),
);

// ------ Part

export const partInfo = translate(
    headlineLevel(1),
    text => text.replace(/\* ([^\*]*) \*/, '$1'),
);
export const part: XmlParser<Chapter> = translate(
    seq(partInfo, junkAtTheBeginning, oneOrMore(chapter)),
    ([head, junk, chapters]) => ({
        kind: 'chapter' as 'chapter',
        level: 1,
        title: head,
        content: chapters,
    }),
);

// ------

const bookNodeParser = part;

const authorSeparator = '. ';
export const bookInfo = translate(
    headlineLevel(0),
    text => letExp(text.indexOf(authorSeparator), dotPos => dotPos > 0
        ? { author: text.substring(0, dotPos), title: text.substring(dotPos + authorSeparator.length) }
        : { author: undefined, title: text }
    ));

export const bookContent = some(projectLast(and(not(bookEndParser), bookNodeParser)));

export const bookParser = translate(
    skipToNode(seq(bookInfo, junkAtTheBeginning, bookContent)),
    ([bi, junk, nodes]) => ({
        kind: 'book' as 'book',
        title: bi.title,
        author: bi.author,
        content: nodes.filter(node => node),
    }),
);

export const bodyParser = bookParser;

export const tree2book = parsePath(['html', 'body'], children(bodyParser));

// ---------- string2book

export function string2book(html: string) {
    const xmlString = html2xml(html);
    const xmlTree = string2tree(xmlString);
    const bookResult = tree2book(xmlTree.children);

    return bookResult.success
        ? bookResult.value
        : throwExp(new Error("Couldn't parse the book"))
        ;
}
