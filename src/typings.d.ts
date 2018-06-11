declare module 'store' {
    interface Store {
        get(key: string): object | undefined;
        set(key: string, value: object): void;
        remove(key: string): void;
        clearAll(): void;
        each(f: (key: string, value: object) => void): void;
    }

    const store: Store;
    export = store;
}

declare module '@rgrove/parse-xml' {
    type ParsingOptions = {
        preserveComments?: boolean,
    };
    const parseXml: (xml: string, options?: ParsingOptions) => any;
    export = parseXml;
}

// TODO: bug workaround: https://github.com/Microsoft/TypeScript-React-Native-Starter/issues/19
// Lister all but node typings in the tsconfig file, but 'registerServiceWorker.ts' still req process to be defined
declare var process: any;
