export type NoBookLocator = { bl: 'no-book' };
export type StaticBookLocator = {
    bl: 'static-book',
    name: string,
};

export type BookLocator = NoBookLocator | StaticBookLocator;

export function noBookLocator(): NoBookLocator {
    return {
        bl: 'no-book',
    };
}

export function staticBookLocator(name: string): StaticBookLocator {
    return {
        bl: 'static-book',
        name: name,
    };
}
