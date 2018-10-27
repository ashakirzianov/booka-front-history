import { typeGuard } from "../utils";

export type Paragraph = string;
export const isParagraph = typeGuard<BookNode, Paragraph>(bn => typeof bn === 'string');

export type Chapter = {
    kind: "chapter",
    level: number,
    title?: string,
    content: BookNode[],
};

export type BookNode = Chapter | Paragraph | LoadingStub;

export type ActualBook = {
    kind: "book",
    title: string,
    author?: string,
    content: BookNode[],
};

export type LoadingStub = {
    kind: 'loadingStub',
};

export type NoBook = {
    kind: 'no-book',
};

export type Book = ActualBook | LoadingStub | NoBook;
