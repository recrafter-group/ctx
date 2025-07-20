module.exports = {
    resolveSnapshotPath: (testPath: string) => testPath.replace(/test\.tsx?$/, 'test.snap.ts'),
    resolveTestPath: () => 'example.test.ts',
    testPathForConsistencyCheck: 'example.test.ts',
};
