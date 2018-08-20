import axios from 'axios';

const corsAnywhereProxy = 'https://cors-anywhere.herokuapp.com/';
export function loadHtml(url: string): Promise<string> {
    return axios
        .get(corsAnywhereProxy + url)
        .then(response => {
            return response.data;
        });
}

export function loadStaticString(fileName: string): Promise<string> {
    return fetch(fileName)
        .then(response => {
            return response.text();
        });
}
