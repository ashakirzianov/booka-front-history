const converterAzLibRu = require('./converterAzLibRu');
const testParse = converterAzLibRu.testParse;

describe('Converter for az.lib.ru examples', () => {
    it('test', () => {
        const test = testParse();
        expect(test.hello).toBeDefined();
    });
});
