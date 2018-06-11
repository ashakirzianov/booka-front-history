import { defPromise } from "../utils";
import { Book } from "./book";

export const actionsTemplate = {
    loadBook: defPromise<Book>(),
};
export type ActionsTemplate = typeof actionsTemplate;
