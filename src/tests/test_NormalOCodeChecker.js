/* eslint-env jasmine */

import {NormalOCodeChecker} from '../controlCodeCheck/NormalOCodeChecker';

describe('NormalOCodeChecker', () => {
    it('works', () => {
        const nocc = new NormalOCodeChecker();
        console.log(nocc.constructor);
        expect(nocc.constructor).not.toBe(null);
    });
});
