import { def } from "../utils";
import { Book } from "./book";

export const actionsTemplate = {
    loadDefaultBook: def(),
    setBook: def<Book>(),
    bookLoadFail: def(),
};
export type ActionsTemplate = typeof actionsTemplate;
