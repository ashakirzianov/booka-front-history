import { nodeFn, matchPattern, Result, capture, Success, sequence, Fail } from "./treePatterns";

function expectSuccess<TI, T>(result: Result<TI, T>): result is Success<TI, T> {
    expect(result.success).toBeTruthy();

    return result.success;
}

function expectFail(result: Result<any, any>): result is Fail {
    expect(result.success).toBeFalsy();
    return !result.success;
}

describe('Basic', () => {
    const input = ['foo', 'bar', 'baz', 'boo', 'far', 'faz'];
    it('NodeFn', () => {
        const pattern = nodeFn(s => s === 'foo' ? true : null);
        const result = matchPattern(pattern, input);
        expectSuccess(result);
    });

    it('Capture', () => {
        const pattern = capture('foo', nodeFn(x => x));
        const result = matchPattern(pattern, input);

        if (expectSuccess(result)) {
            expect(result.match.foo).toEqual('foo');
        }
    });

    it('Sequence', () => {
        const pattern = sequence(
            nodeFn(x => x),
            capture('bar', nodeFn(x => x)),
            sequence(
                nodeFn(x => x),
                capture('boo', nodeFn(x => x === 'boo' ? x : null)),
            ),
        );
        const result = matchPattern(pattern, input);

        if (expectSuccess(result)) {
            expect(result.match.bar).toEqual('bar');
            expect(result.match.boo).toEqual('boo');
        }

        const negativeResult = matchPattern(pattern, ['one', 'two', 'three', 'four']);
        expectFail(negativeResult);
    });
});
