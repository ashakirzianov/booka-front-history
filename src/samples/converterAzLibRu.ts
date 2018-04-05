import { parseXml } from '../xmlParser';

export function testParse() {
    const test = `
<hello>
    <!---test0- -->
    <test0></test0>
    <!---test1- -->
    <test1></test1>
</hello>
`;
    return parseXml(test);
}
