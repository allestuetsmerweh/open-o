import _ from 'lodash';

export class RestApi {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    get(path, data) {
        return this.callApi({
            method: 'GET',
            path: path,
            query: this.renderRequestQuery(data),
        });
    }

    post(path, data) {
        return this.callApi({
            method: 'POST',
            path: path,
            body: this.renderRequestBody(data),
        });
    }

    patch(path, data) {
        return this.callApi({
            method: 'PATCH',
            path: path,
            body: this.renderRequestBody(data),
        });
    }

    delete(path, data) {
        return this.callApi({
            method: 'DELETE',
            path: path,
            body: this.renderRequestBody(data),
        });
    }

    renderRequestQuery(data) {
        return Object.keys(data)
            .map((key) => {
                const escapedKey = encodeURIComponent(key);
                const escapedValue = encodeURIComponent(data[key]);
                return `${escapedKey}=${escapedValue}`;
            })
            .join('&');
    }

    renderRequestBody(data) {
        return JSON.stringify(data);
    }

    callApi(request) {
        return new Promise((resolve, reject) => {
            const xhrRequest = new XMLHttpRequest();
            xhrRequest.onload = () => {
                const response = xhrRequest.response;
                let result = null;
                try {
                    result = this.parseResponseBody(response);
                } catch (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            };
            xhrRequest.onerror = (err) => {
                reject(err);
            };
            const path = _.isArray(request.path) ? request.path.join('/') : request.path;
            const queryPart = request.query ? `?${request.query}` : '';
            const url = `${this.baseUrl}/${path}${queryPart}`;
            xhrRequest.open(request.method, url);
            xhrRequest.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhrRequest.send(request.body);
        });
    }

    parseResponseBody(response) {
        return JSON.parse(response);
    }
}
