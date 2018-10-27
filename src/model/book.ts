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
    book: 'loading-stub',
};

export type NoBook = {
    book: 'no-book',
};

export type ErrorBook = {
    book: 'error',
    error: string,
};

export type Book = ActualBook | NoBook | ErrorBook | LoadingStub;

export function createNoBook(): NoBook {
    return {
        book: 'no-book',
    };
}

export function createLoadingStub(): LoadingStub {
    return {
        book: 'loading-stub',
    };
}

export function createErrorBook(error: string): ErrorBook {
    return {
        book: 'error',
        error: error,
    };
}
