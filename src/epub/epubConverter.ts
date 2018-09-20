import epubParser from '@gxl/epub-parser';
import { Book } from '../model/book';

export function convertEpubArrayBuffer(arrayBuffer: ArrayBuffer): Promise<Book> {
    const buffer = new Buffer(arrayBuffer);
    return epubParser(buffer)
        .then(() => {
            return {
                kind: 'book' as 'book',
                title: 'test',
                content: [],
            };
        });
}
