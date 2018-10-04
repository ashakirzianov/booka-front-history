import { string2tree } from "../xmlProcessing/xmlNode";
import { sectionP, titlePageP, titleDivP } from "./traumConverter";
import { XmlParser } from "../xmlProcessing/xml2json";

/* spellchecker:disable */
export const titlePageHtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <link href="../css/main.css" type="text/css" rel="Stylesheet" />
    <title>Лев Николаевич Толстой  Собрание сочинений в двадцати двух томах  Том 4. Война и мир  </title>
  </head>
  <body class="epub">
    <div>
      <div class="title2">
        <h2>Лев Николаевич Толстой</h2>
        <h2>Собрание сочинений в двадцати двух томах</h2>
        <h2>Том 4. Война и мир</h2>
      </div>
    </div>
  </body>
</html>
`;

const titleDivHtml = `
<div class="title2">
        <h2>Лев Николаевич Толстой</h2>
        <h2>Собрание сочинений в двадцати двух томах</h2>
        <h2>Том 4. Война и мир</h2>
      </div>
`;

function stringParser<T>(xmlNodeParser: XmlParser<T>) {
    return (html: string) => {
        const tree = string2tree(html);
        return xmlNodeParser(tree.children);
    };
}

describe('Example parsing', () => {
    it('Section parse title', () => {
        const result = stringParser(sectionP)(titlePageHtml);
        expect(result.success).toBeTruthy();
    });

    it('Title parse title', () => {
        const result = stringParser(titlePageP)(titlePageHtml);
        expect(result.success).toBeTruthy();
    });

    it('Title div parser', () => {
        const result = stringParser(titleDivP)(titleDivHtml);
        expect(result.success).toBeTruthy();
    });
});
