import { testParse } from './converterAzLibRu';

describe("'Converter for az.lib.ru examples'", () => {
    it("'test'", () => {
        // debugger; // tslint:disable-line
        const test = testParse();
        expect(test).toBeDefined();
        expect(test.type).toBe('document');
    });
});
