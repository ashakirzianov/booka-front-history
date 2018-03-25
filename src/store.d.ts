declare namespace Store {
    interface Store {
        get(key: string): object | undefined;
        set(key: string, value: object): void;
        remove(key: string): void;
        clearAll(): void;
        each(f: (key: string, value: object) => void): void;
    }
}
declare const store: Store.Store;
declare module "store" {
    export = store;
}

// TODO: bug workaround: https://github.com/Microsoft/TypeScript-React-Native-Starter/issues/19
// Lister all but node typings in the tsconfig file, but 'registerServiceWorker.ts' still req process to be defined
declare var process: any;
