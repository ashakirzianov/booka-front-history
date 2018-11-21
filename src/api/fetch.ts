import axios from 'axios';
import { Book, noBook, errorBook, BookLocator } from "../model";
import { arrayBuffer2book } from "../epub";

const backendBase = 'http://localhost:3042';
const epubPath = '/epub';

export async function fetchBL(bookLocator: BookLocator): Promise<Book> {
    switch (bookLocator.bl) {
        case 'no-book':
            return Promise.resolve(noBook());
        case 'static-epub':
            return fetchStaticEpub(bookLocator.name + '.epub');
        default:
            return Promise.resolve(noBook());
    }
}

export async function fetchStaticEpub(fileName: string): Promise<Book> {
    try {
        const buffer = await fetchStaticBuffer(fileName);
        return arrayBuffer2book(buffer);
    } catch (reason) {
        return errorBook("Can't find static book: " + fileName);
    }
}

export async function fetchHtml(url: string): Promise<string> {
    const corsAnywhereProxy = 'https://cors-anywhere.herokuapp.com/';
    const response = await axios
        .get(corsAnywhereProxy + url);
    return response.data;
}

export async function fetchStaticString(fileName: string): Promise<string> {
    const response = await axios
        .get(fileName);
    return response.data;
}

export async function fetchStaticBuffer(fileName: string): Promise<ArrayBuffer> {
    const response = await axios.get(backendBase + epubPath + fileName, {
        responseType: 'arraybuffer',
    });
    return response.data;
}
