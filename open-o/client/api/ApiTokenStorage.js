import si from 'sportident/lib/index';

export class ApiTokenStorage {
    constructor(initialToken) {
        this.token = initialToken;
        this.hackyCallback = null;
        this.read();
    }

    addEventListener(_type, callback) {
        this.hackyCallback = callback;
    }

    removeEventListener(_type, _callback) {
        this.hackyCallback = null;
    }

    dispatchEvent(_type, args) {
        const hackyCallback = this.hackyCallback;
        if (hackyCallback !== null) {
            hackyCallback(args);
        }
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
