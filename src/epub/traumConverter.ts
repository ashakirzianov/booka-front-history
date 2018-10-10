import {
    elementName, children, textNode, element, parsePath, afterWhitespaces, firstNodeXml, elementTranslate,
} from "../xmlProcessing/xml2json";
import { Epub, Section } from "./epubParser";
import { Book, BookNode } from "../model/book";
import { string2tree, XmlNodeDocument } from "../xmlProcessing/xmlNode";
import { filterUndefined } from "../utils";
import {
    firstNodeGeneric, Parser, choice, translate,
    seq, and, oneOrMore, some,
} from "../xmlProcessing/parserCombinators";

// ---- TypeDefs

type Header = {
    kind: 'separator',
    title: string,
    level: number,
};

type Paragraph = {
    kind: 'paragraph',
    text: string,
};

type TitlePage = {
    kind: 'title',
    author?: string,
    title?: string,
};

type Element = Header | Paragraph | TitlePage;

// ---- Converter

export function traumEpubConverter(epub: Epub): Promise<Book> {
    return Promise.resolve(buildBook(epub));
}

function section2elements(section: Section): Element[] {
    const tree = string2tree(section.htmlString);
    const structures = tree2elements(tree);
    return structures;
}

function tree2elements(tree: XmlNodeDocument): Element[] {
    const result = sectionP(tree.children);
    return result.success ? result.value : [];
}

function buildBook(epub: Epub): Book {
    const structures = epub.sections
        .map(section2elements)
        .reduce((acc, arr) => acc.concat(arr), [])
        ;

    const titlePage = findTitlePage(structures);
    const content = buildContent(structures);

    return {
        kind: 'book' as 'book',
        title: titlePage && titlePage.title || epub.info.title,
        author: titlePage && titlePage.author || epub.info.author,
        content: content,
    };
}

function findTitlePage(structures: Element[]): TitlePage | undefined {
    return structures.find(s => s.kind === 'title') as TitlePage;
}

const firstElement = firstNodeGeneric<Element>();

function chapterParser<T extends BookNode>(level: number, content: Parser<Element, T>): Parser<Element, BookNode> {
    return choice(
        translate(
            seq(
                firstElement(se => se.kind === 'separator' && se.level === level ? se : null),
                some(content),
            ),
            ([h, ps]) => ({
                kind: 'chapter' as 'chapter',
                level: level,
                title: h.title,
                content: ps,
            }),
        ),
        content,
    );
}

const paragraphE = firstElement(
    se => se.kind === 'paragraph' ? se.text : null,
);

const h6E = chapterParser(-2, paragraphE);
const h5E = chapterParser(-1, h6E);
const h4E = chapterParser(0, h5E);
const h3E = chapterParser(1, h4E);
const h2E = chapterParser(2, h3E);
const h1E = chapterParser(3, h2E);

const bookContentE = h1E;
const skipOneE = firstElement(n => undefined);
const bookE = translate(
    some(choice(bookContentE, skipOneE)),
    nodes => filterUndefined(nodes),
);

function buildContent(structures: Element[]): BookNode[] {
    const result = bookE(structures);
    return result.success ? result.value : [];
}

// ---- Title page

const titleLinesP = afterWhitespaces(oneOrMore(translate(
    and(
        elementName('h2'),
        children(textNode(t => t)),
    ),
    ([el, text]) => text,
)));
export const titleDivP = translate(
    element(
        el => el.name === 'div' && el.attributes.class === 'title2',
        titleLinesP,
    ),
    lines => lines.length > 1 ? {
        kind: 'title' as 'title',
        author: lines[0],
        title: lines[lines.length - 1],
    }
        : {
            kind: 'title' as 'title',
            title: lines[0],
        },
);

export const titlePageP = parsePath(['html', 'body', 'div'], translate(

    element(
        el => el.name === 'div' && el.attributes.class === undefined,
        afterWhitespaces(titleDivP)
    ),
    tp => [tp],
));

// ---- Separator parser

function headerToLevel(tag: string): number | null {
    if (tag.startsWith('h')) {
        const levelString = tag.substr(1);
        const level = Number(levelString);
        return isNaN(level) ? null : level;
    }
    return null;
}

export const separatorHeaderP = translate(
    and(
        elementTranslate(el => headerToLevel(el.name)),
        children(textNode(t => t)),
    ),
    ([level, title]) => ({
        kind: 'separator' as 'separator',
        title: title,
        level: 4 - level,
    }),
);

export const separatorP = translate(
    and(
        elementName('div'),
        children(afterWhitespaces(separatorHeaderP)),
    ),
    ([_, sep]) => sep,
);

// ---- Paragraph

const textP = textNode(t => t);
const spanP = translate(
    and(
        elementName('span'),
        children(textP),
    ),
    ([_, t]) => t,
);
// TODO: implement links
const linkP = translate(
    elementName('a'),
    _ => '',
);

const paragraphContentP = translate(
    some(choice(textP, spanP, linkP)),
    texts => texts.reduce((acc, t) => acc + t, ''),
);

const paragraphP = translate(
    and(
        elementName('p'),
        children(paragraphContentP),
    ),
    ([_, text]) => ({
        kind: 'paragraph' as 'paragraph',
        text: text,
    }),
);

// ---- Normal page

const skipOneP = firstNodeXml(n => undefined);

const pageContentP = some(afterWhitespaces(choice(paragraphP, separatorP, skipOneP)));

export const normalPageP = parsePath(['html', 'body'], translate(
    children(afterWhitespaces(element(
        el => el.attributes.class !== undefined,
        pageContentP,
    ))),
    content => filterUndefined(content),
));

// ---- Section parser

export const sectionP = choice(
    normalPageP,
    titlePageP,
);
