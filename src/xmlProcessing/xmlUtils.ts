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

export function multiRun(f: (s: string) => string) {
    return (input: string) => {
        let next = input;
        let current;
        do {
            current = next;
            next = f(current);
        } while (!caseSensitiveEq(current, next));
        return next;
    };
}
