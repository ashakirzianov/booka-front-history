import {
    XmlParser, elementName, and, translate, children,
    textNode, oneOrMore, parsePath, element, choice, elementTranslate, some, firstNodeGeneric, seq, Parser, firstNodeXml, ignoreWhitespaces, report, afterWhitespaces,
} from "../xmlProcessing/xml2json";
import { Epub, Section } from "./epubParser";
import { Book, BookNode } from "../model/book";
import { string2tree, XmlNodeDocument } from "../xmlProcessing/xmlNode";
import { filterUndefined } from "../utils";

// ---- Converter

export function traumEpubConverter(epub: Epub): Promise<Book> {
    return Promise.resolve(buildBook(epub));
}

function section2structures(section: Section): StructureElement[] {
    const tree = string2tree(section.htmlString);
    const structures = tree2structures(tree);
    return structures;
}

function tree2structures(tree: XmlNodeDocument): StructureElement[] {
    const result = sectionP(tree.children);
    return result.success ? result.value : [];
}

function buildBook(epub: Epub): Book {
    const structures = epub.sections
        .map(section2structures)
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

function findTitlePage(structures: StructureElement[]): TitlePage | undefined {
    return structures.find(s => s.kind === 'title') as TitlePage;
}

const first = firstNodeGeneric<StructureElement>();

function chapterParser<T extends BookNode>(level: number, content: Parser<StructureElement, T>): Parser<StructureElement, BookNode> {
    return choice(
        translate(
            seq(
                first(se => se.kind === 'separator' && se.level === level ? se : null),
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

const paragraphS = first(
    se => se.kind === 'paragraph' ? se.text : null,
);

const h6S = chapterParser(-2, paragraphS);
const h5S = chapterParser(-1, h6S);
const h4S = chapterParser(0, h5S);
const h3S = chapterParser(1, h4S);
const h2S = chapterParser(2, h3S);
const h1S = chapterParser(3, h2S);

const bookContentS = h1S;
const skipOne = first(n => undefined);
const book = translate(
    some(choice(bookContentS, skipOne)),
    nodes => filterUndefined(nodes),
);

function buildContent(structures: StructureElement[]): BookNode[] {
    const result = book(structures);
    return result.success ? result.value : [];
}

// ---- TypeDefs

type Separator = {
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

type StructureElement = Separator | Paragraph | TitlePage;

// ---- Helpers

function header(level: number): XmlParser<string> {
    return translate(
        and(
            elementName('h' + level.toString()),
            children(textNode(t => t)),
        ),
        ([el, text]) => text,
    );
}

// ---- Title page

const titleLinesP = ignoreWhitespaces(oneOrMore(header(2)));
export const titleDivP = translate(
    element({
        name: 'div',
        attrs: { class: 'title2' },
        children: titleLinesP,
    }),
    ([_, lines]) => lines.length > 1 ? {
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
    and(
        report('et', elementTranslate(el => {
            return el.attributes.class === undefined ? el : null;
        })),
        report('div', element({
            name: 'div',
            children: report('titleDivP', ignoreWhitespaces(titleDivP)),
        })),
    ),
    ([_, [__, titlePage]]) => [titlePage],
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
    children(afterWhitespaces(and(
        elementTranslate(el => el.attributes.class !== undefined ? el : null),
        children(pageContentP),
    ))),
    ([_, content]) => filterUndefined(content),
));

// ---- Section parser

export const sectionP = choice(
    normalPageP,
    titlePageP,
);
