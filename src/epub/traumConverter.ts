import {
    Parser, elementName, and, translate, children,
    textNode, oneOrMore, parsePath, some, element, choice,
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

function header(level: number): Parser<string> {
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

const titlePageP = parsePath(['html', 'body', 'div'], translate(
    element({
        name: 'div',
        attrs: { class: undefined },
        children: titleDivP,
    }),
    ([_, titlePage]) => [titlePage],
));

// ---- Separator parser

// ---- Section parser

const contentP = some(titleDivP);
const sectionP = choice(
    titlePageP,
    parsePath(['html', 'body', 'div'], contentP),
);
