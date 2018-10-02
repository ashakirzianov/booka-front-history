import {
    XmlParser, elementName, and, translate, children,
    textNode, oneOrMore, parsePath, element, choice, elementTranslate, some,
} from "../xmlProcessing/xml2json";
import { Epub, Section } from "./epubParser";
import { Book, BookNode } from "../model/book";
import { string2tree, XmlNodeDocument } from "../xmlProcessing/xmlNode";

// ---- Converter

export function defaultEpubConverter(epub: Epub): Promise<Book> {
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

function buildContent(structures: StructureElement[]): BookNode[] {
    return [];
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

const titleLinesP = oneOrMore(header(2));
const titleDivP = translate(
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

const titlePageP = parsePath(['html', 'body'], translate(
    and(
        elementTranslate(el => el.attributes.class === undefined ? el : null),
        element({
            name: 'div',
            attrs: { class: undefined },
            children: titleDivP,
        })
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

const separatorHeaderP = translate(
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

const separatorP = translate(
    and(
        elementName('div'),
        separatorHeaderP,
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

const pageContentP = choice(paragraphP, separatorP);

const normalPageP = parsePath(['html', 'body'], translate(
    and(
        elementTranslate(el => el.attributes.class !== undefined ? el : null),
        pageContentP,
    ),
    ([_, page]) => [page],
));

// ---- Section parser

const sectionP = choice(
    normalPageP,
    titlePageP,
);
