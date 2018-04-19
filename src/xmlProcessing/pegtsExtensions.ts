import { Parser, Input, Result, builder, Success } from "pegts";

// TODO: move to pegts

class FuncParser<TIn, TOut> implements Parser<TIn, TOut> {
    constructor(readonly f: (input: Input<TIn>) => Result<TIn, TOut>) {}

    parse(input: Input<TIn>) {
        return this.f(input);
    }
}

export function fparser<TIn, TOut>(f: (input: Input<TIn>) => Result<TIn, TOut>) {
    return builder(new FuncParser(f));
}

class OrParser<TIn, TOutLeft, TOutRight> implements Parser<TIn, TOutLeft | TOutRight> {
    constructor(readonly left: Parser<TIn, TOutLeft>, readonly right: Parser<TIn, TOutRight>) {}

    parse(input: Input<TIn>) {
        const leftResult = this.left.parse(input);
        return leftResult.success
            ? leftResult as Success<TIn, TOutLeft | TOutRight>
            : this.right.parse(input)
            ;
    }
}

export function choice<TIn, TOutLeft, TOutRight>(left: Parser<TIn, TOutLeft>, right: Parser<TIn, TOutRight>) {
    return builder(new OrParser(left, right));
}
