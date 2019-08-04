/* eslint-env node */

const totalCoverage = {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100,
};

const jestConfig = {
    testRegex: '.*/.*\\.test\\.js',
    collectCoverage: true,
    maxConcurrency: 1,
    coverageThreshold: {
        '.': {
            branches: 10,
            functions: 10,
            lines: 10,
            statements: 10,
        },
        'api': totalCoverage,
    },
};
module.exports = jestConfig;
