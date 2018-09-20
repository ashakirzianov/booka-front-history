import axios from 'axios';
import { convertEpubArrayBuffer } from '../epub/epubConverter';
import { Book } from '../model/book';

export function loadStaticEpub(fileName: string): Promise<Book> {
    return axios
        .get(fileName, {
            responseType: 'arraybuffer',
        })
        .then(response => {
            return convertEpubArrayBuffer(response.data);
        })
        ;
}
