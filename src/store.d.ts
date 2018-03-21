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
