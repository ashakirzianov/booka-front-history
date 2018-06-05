import { success, Input } from "./xml2json";

export const trueParser = <T>(result: T) => (input: Input) => success(result, input);
export const falseParser = (input: Input) => fail();

it('seq', () => {
    expect(true).toBeTruthy();
});
