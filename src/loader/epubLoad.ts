import axios from 'axios';
import { arrayBuffer2book } from '../epub/epubConverter';
import { Book, createErrorBook } from '../model/book';

export function loadStaticEpub(fileName: string): Promise<Book> {
    return axios
        .get(fileName, {
            responseType: 'arraybuffer',
        })
        .then(response => {
            return arrayBuffer2book(response.data);
        })
        .catch(reason => createErrorBook("Can't find static book: " + fileName));
}
