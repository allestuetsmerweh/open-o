/* eslint-env jasmine */

import * as testUtils from '../../../sportident/src/testUtils';
import {RestApi, contentTypeJson} from './RestApi';

beforeEach(() => {
    testUtils.useFakeTimers();
});

describe('RestApi', () => {
    it('exists', () => {
        expect(RestApi).not.toBe(undefined);
    });
    const myRestApi = new RestApi('/api');
    const getFakeXmlHttpRequest = (onSend) => {
        class FakeXmlHttpRequest {
            constructor() {
                this.requestHeaders = {};
            }

            open(method, path) {
                this.method = method;
                this.path = path;
            }

            setRequestHeader(key, value) {
                this.requestHeaders = {
                    ...this.requestHeaders,
                    [key]: value,
                };
            }

            send(body) {
                this.body = body;
                onSend(this);
                return undefined;
            }
        }
        return FakeXmlHttpRequest;
    };
    it('get', async (done) => {
        let retreivedObjects = undefined;
        let sentRequest = undefined;
        window.XMLHttpRequest = getFakeXmlHttpRequest(
            (request) => {
                request.response = '[]';
                sentRequest = request;
                request.onload();
            },
        );
        myRestApi.get('objects', {})
            .then((objects) => {
                retreivedObjects = objects;
            });
        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));
        expect(retreivedObjects).toEqual([]);
        expect(sentRequest.method).toBe('GET');
        expect(sentRequest.path).toBe('/api/objects');
        expect(sentRequest.requestHeaders).toEqual({...contentTypeJson});
        expect(sentRequest.body).toBe(undefined);
        done();
    });
    it('post', async (done) => {
        let retreivedObjects = undefined;
        let sentRequest = undefined;
        window.XMLHttpRequest = getFakeXmlHttpRequest(
            (request) => {
                request.response = '[]';
                sentRequest = request;
                request.onload();
            },
        );
        myRestApi.post('objects', {'param': 'value'})
            .then((objects) => {
                retreivedObjects = objects;
            });
        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));
        expect(retreivedObjects).toEqual([]);
        expect(sentRequest.method).toBe('POST');
        expect(sentRequest.path).toBe('/api/objects');
        expect(sentRequest.requestHeaders).toEqual({...contentTypeJson});
        expect(sentRequest.body).toBe('{"param":"value"}');
        done();
    });
    it('patch', async (done) => {
        let retreivedObjects = undefined;
        let sentRequest = undefined;
        window.XMLHttpRequest = getFakeXmlHttpRequest(
            (request) => {
                request.response = '[]';
                sentRequest = request;
                request.onload();
            },
        );
        myRestApi.patch('objects/1', {'param': 'value'})
            .then((objects) => {
                retreivedObjects = objects;
            });
        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));
        expect(retreivedObjects).toEqual([]);
        expect(sentRequest.method).toBe('PATCH');
        expect(sentRequest.path).toBe('/api/objects/1');
        expect(sentRequest.requestHeaders).toEqual({...contentTypeJson});
        expect(sentRequest.body).toBe('{"param":"value"}');
        done();
    });
    it('delete', async (done) => {
        let retreivedObjects = undefined;
        let sentRequest = undefined;
        window.XMLHttpRequest = getFakeXmlHttpRequest(
            (request) => {
                request.response = '[]';
                sentRequest = request;
                request.onload();
            },
        );
        myRestApi.delete('objects/6')
            .then((objects) => {
                retreivedObjects = objects;
            });
        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));
        expect(retreivedObjects).toEqual([]);
        expect(sentRequest.method).toBe('DELETE');
        expect(sentRequest.path).toBe('/api/objects/6');
        expect(sentRequest.requestHeaders).toEqual({...contentTypeJson});
        expect(sentRequest.body).toBe(undefined);
        done();
    });
    it('get with data', async (done) => {
        let retreivedObjects = undefined;
        let sentRequest = undefined;
        window.XMLHttpRequest = getFakeXmlHttpRequest(
            (request) => {
                request.response = '{}';
                sentRequest = request;
                request.onload();
            },
        );
        myRestApi.get(['objects', 1], {'param': 'value'})
            .then((objects) => {
                retreivedObjects = objects;
            });
        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));
        expect(retreivedObjects).toEqual({});
        expect(sentRequest.method).toBe('GET');
        expect(sentRequest.path).toBe('/api/objects/1?param=value');
        expect(sentRequest.requestHeaders).toEqual({...contentTypeJson});
        expect(sentRequest.body).toBe(undefined);
        done();
    });
    it('malformed result', async (done) => {
        let rejectionError = undefined;
        let sentRequest = undefined;
        window.XMLHttpRequest = getFakeXmlHttpRequest(
            (request) => {
                request.response = 'malformed';
                sentRequest = request;
                request.onload();
            },
        );
        myRestApi.get('objects', {})
            .catch((err) => {
                rejectionError = err;
            });
        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));
        expect(rejectionError instanceof SyntaxError).toBe(true);
        expect(sentRequest.method).toBe('GET');
        expect(sentRequest.path).toBe('/api/objects');
        expect(sentRequest.requestHeaders).toEqual({...contentTypeJson});
        expect(sentRequest.body).toBe(undefined);
        done();
    });
    it('request error', async (done) => {
        let rejectionError = undefined;
        let sentRequest = undefined;
        window.XMLHttpRequest = getFakeXmlHttpRequest(
            (request) => {
                sentRequest = request;
                request.onerror(new Error('test'));
            },
        );
        myRestApi.get('objects', {})
            .catch((err) => {
                rejectionError = err;
            });
        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));
        expect(rejectionError instanceof Error).toBe(true);
        expect(rejectionError.message).toBe('test');
        expect(sentRequest.method).toBe('GET');
        expect(sentRequest.path).toBe('/api/objects');
        expect(sentRequest.requestHeaders).toEqual({...contentTypeJson});
        expect(sentRequest.body).toBe(undefined);
        done();
    });
    it('tokenStorage', async (done) => {
        const myRestApiWithTokenStorage = new RestApi('/api');
        const token = 'Bearer token';
        myRestApiWithTokenStorage.tokenStorage = {token: token};
        let retreivedObjects = undefined;
        let sentRequest = undefined;
        window.XMLHttpRequest = getFakeXmlHttpRequest(
            (request) => {
                request.response = '[]';
                sentRequest = request;
                request.onload();
            },
        );
        myRestApiWithTokenStorage.get('objects', {})
            .then((objects) => {
                retreivedObjects = objects;
            });
        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));
        expect(retreivedObjects).toEqual([]);
        expect(sentRequest.method).toBe('GET');
        expect(sentRequest.path).toBe('/api/objects');
        expect(sentRequest.requestHeaders).toEqual({
            ...contentTypeJson,
            'Authorization': token,
        });
        expect(sentRequest.body).toBe(undefined);
        done();
    });
});
