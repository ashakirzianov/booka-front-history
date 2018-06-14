import { defPromise, def } from "../utils";
import { Book } from "./book";

export const actionsTemplate = {
    loadBook: defPromise<Book>(),
    foo: def<{ helloFoo: string }>(),
    bar: def<{ helloBar: number }>(),
    baz: def<{ helloBaz: boolean }>(),
    empty: def(),
};
export type ActionsTemplate = typeof actionsTemplate;
