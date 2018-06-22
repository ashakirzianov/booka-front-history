import { Book } from "../model/book";

export type BookLoadDesc = {
    loadString: () => Promise<string>,
    string2book: (text: string) => Promise<Book>,
};

export function loadBook(loadDesc: BookLoadDesc): Promise<Book> {
    return loadDesc
        .loadString()
        .then(text => loadDesc.string2book(text));
}
