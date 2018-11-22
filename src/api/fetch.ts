import axios from 'axios';
import { Book, noBook, errorBook, BookLocator } from "../model";

const backendBase = 'https://reader-back.herokuapp.com';
const jsonPath = '/json';

export async function fetchBL(bookLocator: BookLocator): Promise<Book> {
    switch (bookLocator.bl) {
        case 'no-book':
            return Promise.resolve(noBook());
        case 'static-book':
            return fetchBook(bookLocator.name);
        default:
            return Promise.resolve(noBook());
    }
}

export async function fetchBook(bookName: string): Promise<Book> {
    try {
        const response = await fetchJson(backendBase + jsonPath + bookName);
        return response as Book;
    } catch (reason) {
        return errorBook("Can't find static book: " + bookName);
    }
}

export async function fetchJson(url: string): Promise<object> {
    const json = await axios.get(url, {
        responseType: 'json',
    });

    return json.data;
}
