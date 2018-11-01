export type KeyRestriction<T, U extends PropertyKey> = {
    [k in U]?: never;
} & {
    [k in U]?: undefined;
} & {
    [k in keyof T]: T[k];
};

export type PromiseType<T> = T extends Promise<infer U> ? U : any;

export type ExcludeKeys<T, K extends PropertyKey> = Pick<T, Exclude<keyof T, K>>;

export function letExp<T, U>(x: T, f: (x: T) => U) {
    return f(x);
}

export function throwExp<T>(error: T): never {
    throw error;
}

export function assertNever(arg: never, message?: string): never {
    throw new Error(`Should have not happen: ${message} (object: ${arg})`);
}

export function combineF<S, T, U>(f: (x: T) => U, g: (x: S) => T) {
    return (x: S) => f(g(x));
}

export function combineFs<T>(...fs: Array<(x: T) => T>) {
    return fs.reduce((acc, f) => combineF(acc, f));
}

export function keys<T>(obj: T): Array<keyof T> {
    return Object.keys(obj) as Array<keyof T>;
}

export function mapObject<T, U>(
    obj: T,
    f: <K extends keyof T, V extends T[K]>(k: K, v: V) => U,
): { [k in keyof T]: U } {
    return keys(obj).reduce((acc, key) =>
        ({ ...acc, [key]: f(key, obj[key]) }), {} as any); // NOTE: need to cast so reducer infer 'any' as type arg
}

export function pick<T, Keys extends keyof T>(obj: T, ...ks: Keys[]): Pick<T, Keys> {
    return ks.reduce((ret, key) => ({ ...ret, [key]: obj[key] }), {}) as Pick<T, Keys>;
}

export function def<T = undefined>() {
    return null as any as T;
}

export function defOpt<T>() {
    return def<T | undefined>();
}

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

// String

export function isWhitespaces(input: string): boolean {
    return input.match(/^\s*$/) ? true : false;
}

export function trimStart(input: string, trimSet: string) {
    return input.replace(new RegExp(`([${trimSet}]*)(.*)`), '$2');
}

export function trimEnd(input: string, trimSet: string) {
    return trimStart(input.split('').reverse().join(''), trimSet)
        .split('').reverse().join('');
}

export function trim(input: string, trimSet: string) {
    return trimEnd(trimStart(input, trimSet), trimSet);
}

export function trimNewLines(line: string) {
    return trim(line, '\n');
}

export function caseInsensitiveEq(left: string, right: string) {
    return left.localeCompare(right, undefined, { sensitivity: 'base' }) === 0;
}

export function caseSensitiveEq(left: string, right: string) {
    return left.localeCompare(right) === 0;
}
