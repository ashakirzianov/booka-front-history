import axios from 'axios';

export function loadHtml(url: string): Promise<string> {
    return axios
        .get(url)
        .then(response => {
            return response.data;
        });
}
