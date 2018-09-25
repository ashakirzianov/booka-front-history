import { Book, BookNode, SubChapterNode } from "../model/book";
import { Epub, Section } from "./epubParser";
import { string2tree, XmlNodeDocument, XmlNode } from "../xmlProcessing/xmlNode";
import { translate, textNode, choice, children, Result, some } from "../xmlProcessing/xml2json";

export function defaultEpubConverter(epub: Epub): Promise<Book> {
    return Promise.resolve({
        kind: 'book' as 'book',
        title: epub.info.title,
        author: epub.info.author,
        content: convertSections(epub.sections),
    });
}

function convertSections(sections: Section[]): BookNode[] {
    return sections.map(convertSingleSection);
}

function convertSingleSection(section: Section): BookNode {
    const tree = string2tree(section.htmlString);
    const node = tree2node(tree);
    return {
        kind: 'chapter' as 'chapter',
        title: '',
        content: node,
    };
}

function tree2node(tree: XmlNodeDocument): SubChapterNode[] {
    const result = extractText(tree.children);
    return result.success ? result.value : ["CAN NOT PARSE"];
}

export const anyText = textNode(t => [t]);
export const childrenText = children(extractText);

const extractTextParser = translate(
    some(choice(
        anyText,
        childrenText
    )),
    arrays => arrays.reduce((result, arr) => result.concat(arr), []),
);

export function extractText(tree: XmlNode[]): Result<string[]> {
    return extractTextParser(tree);
}
