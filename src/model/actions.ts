import { def } from "../utils";
import { Book } from "./book";

export const actionsTemplate = {
    setBook: def<Promise<Book>>(),
};
export type ActionsTemplate = typeof actionsTemplate;
