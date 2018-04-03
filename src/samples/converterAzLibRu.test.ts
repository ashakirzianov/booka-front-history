import { testParse } from "./converterAzLibRu";

describe('Converter for az.lib.ru examples', () => {
    it('test', () => {
        const test = testParse();
        expect(test.hello).toBeDefined();
    });
});
