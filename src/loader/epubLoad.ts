import axios from 'axios';

export function loadStaticEpub(fileName: string): Promise<any> {
    return axios
        .get(fileName)
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            return response;
        })
        ;
}
