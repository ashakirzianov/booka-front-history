export type NoBookLocator = { bl: 'no-book' };
export type StaticEpubLocator = {
    bl: 'static-epub',
    name: string,
};
export type RemoteEpubLocator = {
    bl: 'remote-epub',
    name: string,
};

export type BookLocator = NoBookLocator | StaticEpubLocator | RemoteEpubLocator;

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
