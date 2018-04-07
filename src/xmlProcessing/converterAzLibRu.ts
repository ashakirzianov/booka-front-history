import { parseXml } from '../xmlParser';
import { combineFs } from '../utils';
import { html2xmlFixes } from './html2xml';

export function parseAzLibRuHtml(html: string) {
    const xml = toXml(html);
    return parseXml(xml);
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

export const toXml = combineFs(
    html2xmlFixes,
    fixSpecialCaseAzLibRu,
);
