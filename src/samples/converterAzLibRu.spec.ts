import { testParse } from './converterAzLibRu';

describe("'Converter for az.lib.ru examples'", () => {
    it("'test'", () => {
        debugger; // tslint:disable-line
        const test = testParse();
        expect(test).toBeDefined();
        expect(test.hello).toBeDefined();
        expect(test.hello.test0).toBeDefined();
        expect(test.hello.test1).toBeDefined();
    });
});
