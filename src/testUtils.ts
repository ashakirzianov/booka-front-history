import { Result, Fail } from "./xmlProcessing/xml2json";

export function expectSuccess<TIn, TOut>(result: Result<TIn, TOut>) {
    const failReason = (result as Fail).reason;
    expect(failReason).toBeUndefined();
}
