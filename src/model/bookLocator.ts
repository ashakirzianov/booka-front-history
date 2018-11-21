export type NoBookLocator = { bl: 'no-book' };
export type StaticEpubLocator = {
    bl: 'static-epub',
    name: string,
};
export type StaticBookLocator = {
    bl: 'static-book',
    name: string,
};

export type BookLocator = NoBookLocator | StaticEpubLocator | StaticBookLocator;

export function noBookLocator(): NoBookLocator {
    return {
        bl: 'no-book',
    };
}

export function staticBookLocator(name: string): StaticEpubLocator {
    return {
        bl: 'static-epub',
        name: name,
    };
}
