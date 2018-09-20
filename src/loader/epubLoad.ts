import axios from 'axios';
import epubParser from '@gxl/epub-parser';

export function loadStaticEpub(fileName: string): Promise<any> {
    return axios
        .get(fileName, {
            responseType: 'arraybuffer',
        })
        .then(response => {
            const buffer = new Buffer(response.data);
            const epub = epubParser(buffer);
            return epub;
        })
        ;
}
