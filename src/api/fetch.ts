import axios from 'axios';
import { Book, noBook, errorBook, BookLocator } from "../model";
import { arrayBuffer2book } from "../epub";

const backendBase = 'https://reader-back.herokuapp.com';
const epubPath = '/epub';
const jsonPath = '/json';

export async function fetchBL(bookLocator: BookLocator): Promise<Book> {
    switch (bookLocator.bl) {
        case 'no-book':
            return Promise.resolve(noBook());
        case 'static-epub':
            return fetchStaticEpub(bookLocator.name);
        case 'static-book':
            return fetchStaticBook(bookLocator.name);
        default:
            return Promise.resolve(noBook());
    }
}

export async function fetchStaticBook(fileName: string): Promise<Book> {
    try {
        const response = await fetchStaticJson(jsonPath + fileName);
        return response as Book;
    } catch (reason) {
        return errorBook("Can't find static book: " + fileName);
    }
}

export async function fetchStaticEpub(fileName: string): Promise<Book> {
    try {
        const buffer = await fetchStaticBuffer(epubPath + fileName);
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
    const response = await axios
        .get(backendBase + fileName, {
            responseType: 'arraybuffer',
        })
        ;
    return response.data;
}

export async function fetchStaticJson(fileName: string): Promise<object> {
    const response = await axios
        .get(backendBase + fileName, {
            responseType: 'json',
        })
        ;
    const json = JSON.parse(response.data);

    return json;
}
