import si from '../../../sportident/src/index';

export class ApiTokenStorage {
    constructor(initialToken) {
        this.token = initialToken;
        this._eventListeners = {};
        this.read();
    }

    addEventListener(type, callback) {
        return si.utils.addEventListener(this._eventListeners, type, callback);
    }

    removeEventListener(type, callback) {
        return si.utils.removeEventListener(this._eventListeners, type, callback);
    }

    dispatchEvent(type, args) {
        return si.utils.dispatchEvent(this._eventListeners, type, args);
    }

    setToken(newToken) {
        this.token = newToken;
        this.dispatchEvent('tokenChange', {token: newToken});
        return this.write();
    }

    read() {
        return si.utils.waitFor(0)
            .then(() => this.typeSpecificRead())
            .then((token) => {
                this.setToken(token);
                return token;
            })
            .catch(() => this.token);
    }

    typeSpecificRead() {
        return Promise.reject(new Error('not implemented'));
    }

    write() {
        return si.utils.waitFor(0)
            .then(() => this.typeSpecificWrite())
            .catch(() => undefined);
    }

    typeSpecificWrite() {
        return Promise.reject(new Error('not implemented'));
    }
}
