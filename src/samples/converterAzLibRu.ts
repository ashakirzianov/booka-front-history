import { parseXml } from '../xmlParser';
import { combineFs } from '../utils';

function multiRun(f: (s: string) => string) {
    return (input: string) => {
        let next = input;
        let current;
        do {
            debugger; // tslint:disable-line
            current = next;
            next = f(current);
        } while (current.length !== next.length);
        return next;
    };
}

export function parseHtml(html: string) {
    const xml = htmlToWellFormedXml(html);
    return parseXml(xml);
}

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

function fixBooleanAttributes(html: string) {
    return html
        .replace(/(<[a-z]+\s+)(([a-z]+=[^\s]+\s+)*)([a-z]+)(\s|>|\/)/gi, `$1$2$4='true'$5`)
        ;
}

function fixUnescapedAmpersand(html: string) {
    return multiRun(s => s
        .replace(/&([^a]|a[^m]|am[^p]|amp[^;])/gi, "&amp;$1")
    )(html);
}

function fixSingleTag(tagName: string) {
    return (html: string) => html
        .replace(new RegExp(`<${tagName}([^>]*)>`, 'gi'), `<${tagName}$1 />`)
        .replace(new RegExp(`</${tagName}>`, 'gi'), `<${tagName}/>`)
        ;
}

function fixInvalidComments(html: string) {
    return html
        .replace(/<!---+([^->]*)-*>/gi, '<!-- $1 -->')
        ;
}

function fixCharEntity(html: string) {
    return multiRun(s => s
        .replace(/&#(\d{1,4})(&|<)/g, '&#$1;$2')
    )(html);
}

function fixSpecialCaseAzLibRu(html: string) {
    return html
        .replace('Статистика.</a></div>', 'Статистика.</a>')
        .replace(
            '<table align=center width=90% border=0 cellspacing=10><td align=center><font size=-1>',
            '<table align=center width=90% border=0 cellspacing=10><td align=center /><font size=-1>')
        .replace(/<ul><font color="#555555">\s*<\/ul><\/font>/gi, '<ul><font color="#555555"></font></ul>')
        ;
}

export const htmlToWellFormedXml = combineFs(
    fixSingleTag('br'),
    fixSingleTag('hr'),
    fixSingleTag('li'),
    fixSingleTag('input'),
    fixSingleTag('dd'),
    fixSingleTag('pre'),
    fixUnescapedAmpersand,
    fixAllUnquotedAttributes,
    fixBooleanAttributes,
    fixInvalidComments,
    fixCharEntity,
    fixSpecialCaseAzLibRu,
);
