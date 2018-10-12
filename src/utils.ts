type Helper<T, S> = {
    [k in keyof T]: T[k] extends S ? k : never;
};

export type KeysForValueType<T, Return> = Exclude<Helper<T, Return>[keyof Helper<T, Return>], never>;
export type CheckValueTypes<T, Return> = KeysForValueType<T, Return> extends never ? T : never;

export type Thunk<T> = () => T;

export type StringDiff<T extends PropertyKey, U extends PropertyKey> =
    ({ [P in T]: P } & { [P in U]: never } & { [x in T]: never })[T];

export type StringIntersection<T extends PropertyKey, U extends PropertyKey> =
    StringDiff<T | U, StringDiff<T, U> | StringDiff<U, T>>;

export type TypeDiff<T, U> = {
    [k in StringDiff<keyof T, keyof U>]: T[k];
};

export type Partialize<T, U> = {
    [k in StringDiff<keyof T, keyof U>]: T[k];
} & Partial<T>;

export type Undefined<T> = { [t in keyof T]: undefined };

export type KeyRestriction<T, U extends PropertyKey> = {
    [k in StringIntersection<keyof T, U>]?: never
} &  {
    [k in U]?: undefined
};

export type RestrictedComb<T extends KeyRestriction<T, keyof U>, U> = T & U;

export type Map<T> = { [k: string]: T };

export type ValueConstraint<T, ValueType> = {
    [k in keyof T]: ValueType;
};

export type PromiseType<T> = T extends Promise<infer U> ? U : any;

export function range(end: number): number[];
// tslint:disable-next-line:unified-signatures
export function range(start: number, end: number): number[];
export function range(n1: number, n2?: number) {
    const result: number[] = [];
    const start = n2 === undefined ? 0 : n1;
    const end = n2 === undefined ? n1 : n2;
    for (let i = start; i < end; i++) {
        result[i - start] = i;
    }

    return result;
}

export function randomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function pickRandom<T>(arr: T[]) {
    return arr[randomInt(arr.length)];
}

export function sameArrays<T>(a1: T[], a2: T[]): boolean {
    return a1.length === a2.length
        && a1.every((x, i) => x === a2[i]);
}

export function contains<T>(arr: T[], x: T) {
    return arr.some(e => e === x);
}

export function distinct<T>(comp: (x: T, y: T) => boolean) {
    return function f(arr: T[]) {
        return arr.reduce((acc, curr) =>
            // tslint:disable-next-line:ban-comma-operator
            acc.some(a => comp(a, curr)) ? acc : (acc.push(curr), acc), new Array<T>());
    };
}

export function letExp<T, U>(x: T, f: (x: T) => U) {
    return f(x);
}

export function throwExp<T>(error: T): never {
    throw error;
}

export function exp<T>(f: () => T): T {
    return f();
}

export function assertNever(arg: never, message?: string): never {
    throw new Error(`Should have not happen: ${message} (object: ${arg})`);
}

export function itemAtIndex<T>(arr: T[], idx: number | undefined): T | undefined {
    return idx === undefined ? undefined : arr[idx];
}

export function removeAtIndex<T>(arr: T[], idx?: number): T[] {
    return idx === undefined ? arr : arr.slice(0, idx).concat(arr.slice(idx + 1));
}

export function combineF<S, T, U>(f: (x: T) => U, g: (x: S) => T) {
    return (x: S) => f(g(x));
}

export function combineFs<T>(...fs: Array<(x: T) => T>) {
    return fs.reduce((acc, f) => combineF(acc, f));
}

export function keys<T>(obj: T): Array<keyof T> {
    return Object.keys(obj) as any;
}

export function mapObject<T, U>(
    obj: T,
    f: <K extends keyof T, V extends T[K]>(k: K, v: V) => U,
): { [k in keyof T]: U } {
    return keys(obj).reduce((acc, key) =>
        ({ ...acc, [key]: f(key, obj[key]) }), {} as any);
}

export function def<T = undefined>() {
    return null as any as T;
}

export function defOpt<T>() {
    return def<T | undefined>();
}

export function defPromise<T>() {
    return def<Promise<T>>();
}

export function buildMap<T>() {
    return <M extends Map<T>>(obj: M) => obj;
}

export function typeGuard<TIn, TOut extends TIn>(predicate: (obj: TIn) => boolean): TypeGuard<TIn, TOut> {
    return predicate as TypeGuard<TIn, TOut>;
}

export type TypeGuard<TIn, TOut extends TIn> = (guarded: TIn) => guarded is TOut;

export function timeouted<U>(f: () => U, timeout?: number): () => Promise<U>;
export function timeouted<T, U>(f: (x: T) => U, timeout?: number): (x: T) => Promise<U>;
export function timeouted<T, U>(f: (x: T) => U, timeout?: number): (x: T) => Promise<U> {
    return (x: T) => new Promise((res, rej) => {
        setTimeout(() => {
            try {
                const result = f(x);
                res(result);
            } catch (err) {
                rej(err);
            }
        }, timeout);
    });
}

export function filterUndefined<T>(arr: Array<T | undefined>): T[] {
    return arr.filter(e => e !== undefined) as T[];
}
