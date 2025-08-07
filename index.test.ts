import * as packageExports from './index.js';

test('Should not export anything unnecessary', () => {
    expect(packageExports).toEqual({
        createCtx: expect.any(Function),
        MissingCtxProviderError: expect.any(Function),
    });
});
