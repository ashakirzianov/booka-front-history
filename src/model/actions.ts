import { def } from "../utils";
import { Book } from "./book";
import { BookLocator } from "./bookLocator";

export const actionsTemplate = {
    loadBL: def<BookLocator>(),
    setBook: def<Book>(),
    bookLoadFail: def(),
};
export type ActionsTemplate = typeof actionsTemplate;
