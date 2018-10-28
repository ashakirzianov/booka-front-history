import axios from 'axios';
import { arrayBuffer2book } from '../epub/epubConverter';
import { Book, createErrorBook } from '../model/book';

export async function loadStaticEpub(fileName: string): Promise<Book> {
    try {
        const response = await axios.get(fileName, {
            responseType: 'arraybuffer',
        });
        return arrayBuffer2book(response.data);
    } catch (reason) {
        return createErrorBook("Can't find static book: " + fileName);
    }
}
