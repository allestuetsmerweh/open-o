import {ApiTokenStorage} from './ApiTokenStorage';

export class WebStorageTokenStorage extends ApiTokenStorage {
    constructor(webStorage, webStorageKey) {
        const initialToken = undefined;
        super(initialToken);
        this.webStorage = webStorage;
        this.webStorageKey = webStorageKey;
    }

    typeSpecificRead() {
        const readValue = this.webStorage.getItem(this.webStorageKey);
        if (readValue === null) {
            return Promise.resolve(undefined);
        }
        return Promise.resolve(readValue);
    }

    typeSpecificWrite() {
        if (this.token) {
            this.webStorage.setItem(this.webStorageKey, this.token);
        } else {
            this.webStorage.removeItem(this.webStorageKey);
        }
        return Promise.resolve();
    }
}
