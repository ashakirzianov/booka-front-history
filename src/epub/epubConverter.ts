import epubParser from '@gxl/epub-parser';
import { Book } from '../model/book';

export function convertEpubArrayBuffer(arrayBuffer: ArrayBuffer): Promise<Book> {
    const buffer = new Buffer(arrayBuffer);
    return epubParser(buffer)
        .then(epub => {
            return {
                kind: 'book' as 'book',
                title: epub.info.title,
                author: epub.info.author,
                content: epub.sections.slice(0, 10).map(section =>
                    (section.toMarkdown ? section.toMarkdown() : "NOPE")),
            };
        });
}
