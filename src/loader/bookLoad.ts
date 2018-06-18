import { Book } from "../model/book";

export type BookLoadDesc = {
    loadString: () => string,
    string2book: (text: string) => Book,
};

export function loadBook(loadDesc: BookLoadDesc): Promise<Book> {
    return new Promise((res, rej) => {
        setTimeout(() => {
            try {
                const text = loadDesc.loadString();
                const b = loadDesc.string2book(text);
                res(b);
            } catch (err) {
                rej(err);
            }
        });
    });
}
