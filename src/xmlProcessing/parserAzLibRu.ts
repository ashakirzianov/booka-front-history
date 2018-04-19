import { nodeFunc, anyNode, between, children, nodeName, nodeType } from "./xml2json";
import { anyNumberOf } from "pegts";
import { choice } from "./pegtsExtensions";

const startMarker = 'Собственно произведение'; // spellchecker:disable-line
const stopMarker = '';

function commentMarkerParser(marker: string) {
    return nodeFunc(node =>
        node.type === 'comment' && node.content === startMarker
            ? node
            : null
    );
}

const bookStartParser = commentMarkerParser(startMarker);
const bookEndParser = commentMarkerParser(stopMarker);

const textParser = nodeFunc(node =>
    node.type === 'text'
        ? node.text
        : null
);

const skipParser = anyNode().map(node => null);

const nodeParser = choice(textParser, skipParser);

const primitiveBookParser = anyNumberOf(nodeParser)
    .map(nodes => ({
        kind: 'book',
        title: 'Test',
        content: nodes.filter(node => node !== null) as string[],
    })
);

export const azLibRuParser = children(
    nodeType('text')
        .followedBy(nodeName('head'))
        .followedBy(nodeType('text'))
        .followedBy(children(between(bookStartParser, bookEndParser, primitiveBookParser)))
        .map((t1, head, t2, book) => book)
);
