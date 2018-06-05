import { distinct, sameArrays, combineFs } from "./utils";

describe("Utils", () => {
    it("sameArrays same", () => {
        expect(sameArrays(
            [1, 2, 3],
            [1, 2, 3],
        )).toEqual(true);
    });

    it("sameArrays false", () => {
        expect(sameArrays(
            [1, 2, 3],
            [1, 42, 3],
        )).toEqual(false);
    });

    it("distinct numbers", () => {
        expect(distinct((x, y) => x === y)([1, 2, 1, 3]))
            .toEqual([1, 2, 3]);
    });

    it("distinct arrays", () => {
        expect(distinct<number[]>(sameArrays)([
            [1, 2, 3],
            [4, 5, 6],
            [1, 2, 3],
            [7, 8, 9],
        ])).toEqual([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ]);
    });

    it('combineFs last-to-first order', () => {
        expect(combineFs<number>(
            x => x * x,
            x => x + x,
        )(5)).toBe(100);
    });
});
