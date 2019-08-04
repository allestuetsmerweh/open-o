/* eslint-env jasmine */

import * as testUtils from '../../../sportident/src/testUtils';
import {ApiTokenStorage} from './ApiTokenStorage';

beforeEach(() => {
    testUtils.useFakeTimers();
});

describe('ApiTokenStorage', () => {
    it('direct instantiation', async (done) => {
        const tokenStorage = new ApiTokenStorage();
        expect(tokenStorage.token).toBe(undefined);

        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));

        expect(tokenStorage.token).toBe(undefined);
        tokenStorage.setToken('newToken');
        expect(tokenStorage.token).toBe('newToken');

        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));

        expect(tokenStorage.token).toBe('newToken');
        done();
    });
    it('can be appropriately subclassed', async (done) => {
        class TestApiTokenStorage extends ApiTokenStorage {
            constructor(initialToken) {
                super(initialToken);
                this.storedToken = 'test';
            }

            typeSpecificRead() {
                return Promise.resolve(this.storedToken);
            }

            typeSpecificWrite() {
                this.storedToken = this.token;
                return Promise.resolve();
            }
        }
        const testTokenStorage = new TestApiTokenStorage();
        const tokenChanges = [];
        const handleTokenChange = (e) => {
            tokenChanges.push(e.token);
        };
        testTokenStorage.addEventListener('tokenChange', handleTokenChange);
        expect(testTokenStorage.token).toBe(undefined);
        expect(testTokenStorage.storedToken).toBe('test');
        expect(tokenChanges).toEqual([]);

        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));

        expect(testTokenStorage.token).toBe('test');
        expect(testTokenStorage.storedToken).toBe('test');
        expect(tokenChanges).toEqual(['test']);
        testTokenStorage.setToken('newToken');

        await testUtils.nTimesAsync(1, () => testUtils.advanceTimersByTime(0));

        expect(testTokenStorage.token).toBe('newToken');
        expect(testTokenStorage.storedToken).toBe('newToken');
        expect(tokenChanges).toEqual(['test', 'newToken']);
        testTokenStorage.removeEventListener('tokenChange', handleTokenChange);
        done();
    });
});
