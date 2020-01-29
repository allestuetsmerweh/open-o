/* eslint-env jasmine */

import * as testUtils from 'sportident/lib/testUtils';
import {WebStorageTokenStorage} from './WebStorageTokenStorage';

beforeEach(() => {
    testUtils.useFakeTimers();
});

const getFakeWebStorage = (storage) => ({
    getItem: (key) => {
        const storedValue = storage[key];
        if (storedValue === undefined) {
            return null;
        }
        return storedValue;
    },
    setItem: (key, newItem) => {
        storage[key] = newItem;
    },
    removeItem: (key) => {
        delete storage[key];
    },
});

describe('ApiTokenStorage', () => {
    it('successful read, successful write', async (done) => {
        const testKey = 'testKey';
        const testStorage = {[testKey]: 'token'};
        const fakeWebStorage = getFakeWebStorage(testStorage);
        const webTokenStorage = new WebStorageTokenStorage(fakeWebStorage, testKey);
        expect(testStorage[testKey]).toBe('token');
        expect(webTokenStorage.token).toBe(undefined);

        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));

        expect(testStorage[testKey]).toBe('token');
        expect(webTokenStorage.token).toBe('token');
        webTokenStorage.setToken(undefined);

        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));

        expect(testStorage[testKey]).toBe(undefined);
        expect(webTokenStorage.token).toBe(undefined);
        done();
    });
    it('failing read, successful write', async (done) => {
        const testKey = 'testKey';
        const testStorage = {};
        const fakeWebStorage = getFakeWebStorage(testStorage);
        const webTokenStorage = new WebStorageTokenStorage(fakeWebStorage, testKey);
        expect(testStorage[testKey]).toBe(undefined);
        expect(webTokenStorage.token).toBe(undefined);

        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));

        expect(testStorage[testKey]).toBe(undefined);
        expect(webTokenStorage.token).toBe(undefined);
        webTokenStorage.setToken('newToken');

        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));

        expect(testStorage[testKey]).toBe('newToken');
        expect(webTokenStorage.token).toBe('newToken');
        done();
    });
});
