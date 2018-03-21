import { expect } from "chai";
import { distinct, sameArrays } from "./utils";

describe("Utils", () => {
    it("sameArrays same", () => {
        expect(sameArrays(
            [1, 2, 3],
            [1, 2, 3],
        )).to.be.eq(true);
    });

    it("sameArrays false", () => {
        expect(sameArrays(
            [1, 2, 3],
            [1, 42, 3],
        )).to.be.eq(false);
    });

    it("distinct numbers", () => {
        expect(distinct((x, y) => x === y)([1, 2, 1, 3]))
            .to.be.deep.eq([1, 2, 3]);
    });

    it("distinct arrays", () => {
        expect(distinct<number[]>(sameArrays)([
            [1, 2, 3],
            [4, 5, 6],
            [1, 2, 3],
            [7, 8, 9],
        ])).to.be.deep.eq([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ]);
    });
});
