import { combineFs, trimStart, trimEnd } from "./utils";

describe("Utils", () => {
    it('combineFs last-to-first order', () => {
        expect(combineFs<number>(
            x => x * x,
            x => x + x,
        )(5)).toBe(100);
    });

    it('trim', () => {
        expect(trimStart("   hello ", " ho")).toBe("ello ");
        expect(trimEnd("   hello ", " ho")).toBe("   hell");
    });

    it('should fail', () => {
        expect(false).toBeTruthy();
    });
});
