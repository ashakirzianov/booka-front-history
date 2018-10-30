import { combineFs } from "./utils";

describe("Utils", () => {
    it('combineFs last-to-first order', () => {
        expect(combineFs<number>(
            x => x * x,
            x => x + x,
        )(5)).toBe(100);
    });
});
