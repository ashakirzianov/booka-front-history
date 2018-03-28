import { typeGuard } from "../utils";

export type Paragraph = string;
export const isParagraph = typeGuard<BookNode, Paragraph>(bn => typeof bn === 'string');

export type Chapter = {
    kind: "chapter",
    title: string,
    content: SubChapterNode[],
};

export type Part = {
    kind: "part",
    title: string,
    content: BookNode[],
};

export type SubPart = {
    kind: "subpart",
    title: string,
    content: SubChapterNode[],
};

export type BookNode = Part | Chapter | SubPart | Paragraph;
export type SubChapterNode = SubPart | Paragraph;

export type Book = {
    kind: "book",
    title: string,
    content: BookNode[],
};
