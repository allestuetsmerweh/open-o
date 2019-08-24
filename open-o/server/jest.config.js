/* eslint-env node */

// const totalCoverage = {
//     branches: 100,
//     functions: 100,
//     lines: 100,
//     statements: 100,
// };

const jestConfig = {
    testRegex: '.*/.*\\.test\\.js',
    collectCoverage: true,
    maxConcurrency: 1,
    coverageThreshold: {
        '.': {
            branches: 94,
            functions: 98,
            lines: 98,
            statements: 93,
        },
    },
};
module.exports = jestConfig;
