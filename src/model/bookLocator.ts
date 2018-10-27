export type NoBookLocator = { bl: 'no-book' };
export type StaticBookLocator = {
    bl: 'static-book',
    name: string,
};

export type BookLocator = NoBookLocator | StaticBookLocator;
