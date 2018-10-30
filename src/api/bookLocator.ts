import { Book, noBook } from "../model/book";
import { BookLocator } from "../model/bookLocator";
import { loadStaticEpub } from "../loader/epubLoad";

export function testLoader(): Promise<Book> {
    return loadStaticEpub('wap.epub');
}

export function loadBL(bookLocator: BookLocator): Promise<Book> {
    switch (bookLocator.bl) {
        case 'no-book':
            return Promise.resolve(noBook());
        case 'static-book':
            return loadStaticEpub(bookLocator.name + '.epub');
        default:
            return Promise.resolve(noBook());
    }
}
