import { def } from "../utils";
import { Book } from "./book";

export const actionsTemplate = {
    loadBook: def(),
    setBook: def<Book>(),
    bookLoadFail: def(),
};
export type ActionsTemplate = typeof actionsTemplate;
