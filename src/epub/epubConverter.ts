import epubParser from '@gxl/epub-parser';
import { Book } from '../model/book';
import { defaultEpubConverter } from './defaultConverter';
import { Epub } from './epubParser';
import { traumEpubConverter } from './traumConverter';

export function arrayBuffer2epub(arrayBuffer: ArrayBuffer): Promise<Epub> {
    const buffer = new Buffer(arrayBuffer);
    return epubParser(buffer);
}

export function arrayBuffer2book(arrayBuffer: ArrayBuffer): Promise<Book> {
    const buffer = new Buffer(arrayBuffer);
    return epubParser(buffer)
        .then(epub2book);
}

// TODO: make promise ?
export function epub2book(epub: Epub): Promise<Book> {
    const converter = resolveEpubConverter(epub);
    const book = converter(epub);

    return book;
}

export function resolveEpubConverter(epub: Epub): (epub: Epub) => Promise<Book> {
    return traumEpubConverter || defaultEpubConverter;
}
