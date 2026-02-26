import {test, expect} from 'vitest';

import * as packageExports from './index.js';

const expectedPackageExports = {
    createCtx: expect.any(Function),
    MissingCtxProviderError: expect.any(Function),
};

test('Should export only public API', () => {
    expect(Object.keys(packageExports)).toStrictEqual(Object.keys(expectedPackageExports));
});

test('Should export correct properties', () => {
    expect(packageExports).toMatchObject(expectedPackageExports);
});
