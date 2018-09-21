import epubParser from '@gxl/epub-parser';
import { Book } from '../model/book';
// tslint:disable-next-line:no-submodule-imports
import { Epub } from '@gxl/epub-parser/build/types/epubParser';

export function arrayBuffer2epub(arrayBuffer: ArrayBuffer): Promise<Epub> {
    const buffer = new Buffer(arrayBuffer);
    return epubParser(buffer);
}

// TODO: make promise ?
export function epub2book(epub: Epub): Book {
    return {
        kind: 'book' as 'book',
        title: epub.info.title,
        author: epub.info.author,
        content: epub.sections.slice(0, 10).map(section =>
            (section.toMarkdown ? section.toMarkdown() : "NOPE")),
    };
}

export function arrayBuffer2book(arrayBuffer: ArrayBuffer): Promise<Book> {
    const buffer = new Buffer(arrayBuffer);
    return epubParser(buffer)
        .then(epub2book);
}
