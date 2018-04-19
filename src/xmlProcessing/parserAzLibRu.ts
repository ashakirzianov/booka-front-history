import { firstNode, translate, nodeAny, choice, some, children, nodeName, nodeType, seq, between, nodeComment } from "./xml2json";

const startMarker = 'Собственно произведение'; // spellchecker:disable-line
const stopMarker = '';

const bookStartParser = nodeComment(startMarker);
const bookEndParser = nodeComment(stopMarker);

const textParser = firstNode(node =>
    node.type === 'text'
        ? node.text
        : null
);

const skipParser = translate(nodeAny, n => null);

const bookNodeParser = choice(textParser, skipParser);

const primitiveBookParser = translate(
    some(bookNodeParser),
    nodes => ({
        kind: 'book',
        title: 'Test',
        content: nodes.filter(node => node !== null) as string[],
    })
);

const bodyParser = between(bookStartParser, bookEndParser, primitiveBookParser);

export const azLibRuParser = children(
    translate(
        seq(
            nodeType('text'),
            nodeName('head'),
            nodeType('text'),
            children(bodyParser),
        ),
        ([t1, head, t2, book]) => book,
    )
);
