import { Parser, Input, Result } from "pegts";

// TODO: move to pegts

class FuncParser<TIn, TOut> implements Parser<TIn, TOut> {
    constructor(readonly f: (input: Input<TIn>) => Result<TIn, TOut>) {}

    parse(input: Input<TIn>) {
        return this.f(input);
    }
}

export function fparser<TIn, TOut>(f: (input: Input<TIn>) => Result<TIn, TOut>) {
    return new FuncParser(f);
}
