import { parseXml } from '../xmlParser';
import { combineFs } from '../utils';

export function parseHtml(html: string) {
    const xml = htmlToWellFormedXml(html);
    return parseXml(xml);
}

export function fixAllUnquotedAttributes(html: string) {
    let current = html;
    do {
        debugger; // tslint:disable-line
        current = html.replace(/(<[a-z]+ +)(([a-z]+=(('[^']*')|("[^"]*")) +)*)(([a-z]+)=([^'"> ]+))/gi, "$1$2$8='$9'");
    } while (false);
    return current;
}

export function fixUnquotedAttribute(attrName: string) {
    return (html: string) => html
        .replace(new RegExp(`${attrName}=([^'"][^ >]*)`, 'gi'), `${attrName}='$1'`)
        ;
}

function fixBooleanAttributes(html: string) {
    return html
        .replace(new RegExp(`(<[a-z]+ +)(([a-z]+=[^ ] +)*)([a-z]+) `, 'gi'), `$1$2$4='true' `)
        ;
}

function fixSingleTag(tagName: string) {
    return (html: string) => html
        .replace(new RegExp(`<${tagName}([^>]*)>`, 'gi'), `<${tagName}$1 />`)
        .replace(new RegExp(`</${tagName}>`, 'gi'), `<${tagName}/>`)
        ;
}

function fixInvalidComments(html: string) {
    return html
        .replace(new RegExp('<!---+([^->]*)-*>', 'g'), '<!-- $1 -->')
        ;
}

export const htmlToWellFormedXml = combineFs(
    fixSingleTag('br'),
    fixSingleTag('hr'),
    // fixSingleTag('tr'),
    // fixSingleTag('td'),
    fixSingleTag('li'),
    // fixUnquotedAttribute('href'),
    // fixUnquotedAttribute('size'),
    // fixUnquotedAttribute('width'),
    // fixUnquotedAttribute('border'),
    // fixUnquotedAttribute('cellPadding'),
    // fixUnquotedAttribute('cellSpacing'),
    fixAllUnquotedAttributes,
    fixBooleanAttributes,
    fixInvalidComments,
);
