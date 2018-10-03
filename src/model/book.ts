import { typeGuard } from "../utils";

export type Paragraph = string;
export const isParagraph = typeGuard<BookNode, Paragraph>(bn => typeof bn === 'string');

export type Chapter = {
    kind: "chapter",
    title?: string,
    content: SubChapterNode[],
};

export type Part = {
    kind: "part",
    title?: string,
    content: BookNode[],
};

export type Subpart = {
    kind: "subpart",
    title?: string,
    content: SubChapterNode[],
};

export type BookNode = Part | Chapter | Subpart | Paragraph | LoadingStub;
export type SubChapterNode = Subpart | Paragraph | LoadingStub;

export type Book = {
    kind: "book",
    title: string,
    author?: string,
    content: BookNode[],
} | LoadingStub;

export type LoadingStub = {
    kind: 'loadingStub',
};
