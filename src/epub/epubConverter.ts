import epubParser from '@gxl/epub-parser';
import { Book } from '../model/book';
import { Epub } from './epubParser';
import { converter as defaultConverter } from './defaultConverter';
import { converter as traumConverter } from './traumConverter';

export type EpubConverter = {
    canHandleEpub: (epub: Epub) => boolean,
    convertEpub: (epub: Epub) => Promise<Book>,
};

const convertersRegistry = [
    traumConverter,
    defaultConverter,
];

export function arrayBuffer2epub(arrayBuffer: ArrayBuffer): Promise<Epub> {
    const buffer = new Buffer(arrayBuffer);
    return epubParser(buffer);
}

export function arrayBuffer2book(arrayBuffer: ArrayBuffer): Promise<Book> {
    const buffer = new Buffer(arrayBuffer);
    return epubParser(buffer)
        .then(epub2book);
}

export function epub2book(epub: Epub): Promise<Book> {
    const converter = resolveEpubConverter(epub);
    const book = converter(epub);

    return book;
}

export function resolveEpubConverter(epub: Epub): (epub: Epub) => Promise<Book> {
    const converter = convertersRegistry.find(c => c.canHandleEpub(epub)) || defaultConverter;

    return converter.convertEpub;
}
