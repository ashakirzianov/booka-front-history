import { Book, BookNode } from "../model/book";
import { Epub, Section } from "./epubParser";
import { string2tree, XmlNodeDocument, XmlNode } from "../xmlProcessing/xmlNode";
import { textNode, children } from "../xmlProcessing/xml2json";
import { translate, choice, some, Result } from "../xmlProcessing/parserCombinators";
import { EpubConverter } from "./epubConverter";

export const converter: EpubConverter = {
    canHandleEpub: _ => true,
    convertEpub: defaultEpubConverter,
};

function defaultEpubConverter(epub: Epub): Promise<Book> {
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
        level: 0,
        title: '',
        content: node,
    };
}

function tree2node(tree: XmlNodeDocument): BookNode[] {
    const result = extractText(tree.children);
    return result.success ? result.value : ["CAN NOT PARSE"];
}

const anyText = textNode(t => [t]);
const childrenText = children(extractText);

const extractTextParser = translate(
    some(choice(
        anyText,
        childrenText,
    )),
    arrays => arrays.reduce((result, arr) => result.concat(arr), []),
);

function extractText(tree: XmlNode[]): Result<XmlNode, string[]> {
    return extractTextParser(tree);
}
