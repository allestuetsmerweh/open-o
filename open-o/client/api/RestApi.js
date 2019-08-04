import _ from 'lodash';

export const contentTypeJson = {'Content-Type': 'application/json;charset=UTF-8'};

export class RestApi {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.tokenStorage = undefined;
    }

    get(path, data, additionalHeaders = {}) {
        return this.callApi({
            method: 'GET',
            path: path,
            headers: {
                ...contentTypeJson,
                ...additionalHeaders,
            },
            query: this.renderRequestQuery(data),
        });
    }

    post(path, data, additionalHeaders = {}) {
        return this.callApi({
            method: 'POST',
            path: path,
            headers: {
                ...contentTypeJson,
                ...additionalHeaders,
            },
            body: this.renderRequestBody(data),
        });
    }

    patch(path, data, additionalHeaders = {}) {
        return this.callApi({
            method: 'PATCH',
            path: path,
            headers: {
                ...contentTypeJson,
                ...additionalHeaders,
            },
            body: this.renderRequestBody(data),
        });
    }

    delete(path, additionalHeaders = {}) {
        return this.callApi({
            method: 'DELETE',
            path: path,
            headers: {
                ...contentTypeJson,
                ...additionalHeaders,
            },
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
            if (this.tokenStorage !== undefined && this.tokenStorage.token !== undefined) {
                xhrRequest.setRequestHeader('Authorization', this.tokenStorage.token);
            }
            xhrRequest.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhrRequest.send(request.body);
        });
    }

    parseResponseBody(response) {
        return JSON.parse(response);
    }
}
