import { trimStart, trimEnd } from "./xmlUtils";

it('trim', () => {
    expect(trimStart("   hello ", " ho")).toBe("ello ");
    expect(trimEnd("   hello ", " ho")).toBe("   hell");
});
