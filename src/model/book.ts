import { typeGuard } from "../utils";

export type Paragraph = string;
export const isParagraph = typeGuard<BookNode, Paragraph>(bn => typeof bn === 'string');

export type Chapter = {
    book: "chapter",
    level: number,
    title?: string,
    content: BookNode[],
};

export type BookNode = Chapter | Paragraph | LoadingStub;

export type ActualBook = {
    book: "book",
    title: string,
    author?: string,
    content: BookNode[],
};

export type LoadingStub = {
    book: 'loadingStub',
};

export type NoBook = {
    book: 'no-book',
};

export type Book = ActualBook | LoadingStub | NoBook;
