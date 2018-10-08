import { Result, Fail, Success } from "./xmlProcessing/parserCombinators";

export function expectSuccess<TIn, TOut>(result: Result<TIn, TOut>): result is Success<TIn, TOut> {
    const failReason = (result as Fail).reason;
    expect(failReason).toBeUndefined();
    return result.success;
}
