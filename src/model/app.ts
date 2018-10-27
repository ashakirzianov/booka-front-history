import { Book } from "./book";
import { BookLocator } from './bookLocator';

export type App = {
    book: Book,
    currentBL: BookLocator,
};
