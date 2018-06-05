import { combineFs } from "../utils";
import { multiRun } from "./xmlUtils";

export function fixAllUnquotedAttributes(html: string) {
    return multiRun(s => s
        .replace(/(<[a-z]+\s+)(([a-z]+=(['"])[^4]*\4\s+)*)(([a-z]+)=([^'">\s]+))/gi, '$1$2$6="$7"')
    )(html);
}

export function fixUnquotedAttribute(attrName: string) {
    return (html: string) => html
        .replace(new RegExp(`${attrName}=([^'"][^\s>]*)`, 'gi'), `${attrName}='$1'`)
        ;
}

export function fixBooleanAttributes(html: string) {
    return html
        .replace(/(<[a-z]+\s+)(([a-z]+=[^\s]+\s+)*)([a-z]+)(\s|>|\/)/gi, `$1$2$4='true'$5`)
        ;
}

export function fixUnescapedAmpersand(html: string) {
    return multiRun(s => s
        .replace(/&([^a]|a[^m]|am[^p]|amp[^;])/gi, "&amp;$1")
    )(html);
}

export function fixSingleTag(tagName: string) {
    return (html: string) => html
        .replace(new RegExp(`<${tagName}([^>]*)>`, 'gi'), `<${tagName}$1 />`)
        .replace(new RegExp(`</${tagName}>`, 'gi'), `<${tagName}/>`)
        ;
}

export function fixInvalidComments(html: string) {
    return html
        .replace(/<!---+([^->]*)-*>/gi, '<!-- $1 -->')
        ;
}

export function fixCharEntity(html: string) {
    return multiRun(s => s
        .replace(/&#(\d{1,4})(&|<)/g, '&#$1;$2')
    )(html);
}

export function fixNonbreakingSpace(html: string) {
    return multiRun(input => input
        .replace('&nbsp;', '&#0160;')
    )(html);
}

export function optimized(input: string) {
    return multiRun(html => html
        .replace(/(<[a-z]+\s+)(([a-z]+=(['"])[^4]*\4\s+)*)(([a-z]+)=([^'">\s]+))/gi, '$1$2$6="$7"')
        .replace(/(<[a-z]+\s+)(([a-z]+=[^\s]+\s+)*)([a-z]+)(\s|>|\/)/gi, `$1$2$4='true'$5`)
        .replace(/&([^a]|a[^m]|am[^p]|amp[^;])/gi, "&amp;$1")
        .replace(/<!---+([^->]*)-*>/gi, '<!-- $1 -->')
        .replace(/&#(\d{1,4})(&|<)/g, '&#$1;$2')
    )(input);
}

export const html2xmlFixes = combineFs(
    fixSingleTag('br'),
    fixSingleTag('hr'),
    fixSingleTag('li'),
    fixSingleTag('input'),
    fixSingleTag('dd'),
    fixSingleTag('pre'),
    // fixUnescapedAmpersand, // TODO: consider remove
    fixNonbreakingSpace,
    fixAllUnquotedAttributes,
    fixBooleanAttributes,
    fixInvalidComments,
    fixCharEntity,
);
