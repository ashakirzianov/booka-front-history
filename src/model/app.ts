import { BookType } from "./book";

export type App = {
    book: BookType,
    visual: {
        loading: boolean,
    },
};
