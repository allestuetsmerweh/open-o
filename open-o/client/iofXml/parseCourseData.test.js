/* eslint-env jasmine, node */

import {getXmlRoot} from './getXmlRoot';
import {parseCourseData} from './parseCourseData';

const fs = require('fs');

describe('parseCourseData', () => {
    const testCases = [
        {
            file: 'IOF3-0_purplepen',
            expected: {
                courseByName: {
                    'Grüen': ['31', '45', '44', '32', '33', '35', '34', '36', '37', '38', '39', '40', '43', '41', '42'],
                    'Blau': ['45', '44', '46', '47', '61', '32', '33', '34', '48', '36', '37', '49', '50', '39', '43', '51', '42'],
                    'Rot': ['31', '53', '54', '55', '56', '58', '57', '59', '32', '35', '34', '43', '38', '51', '41', '43', '40', '50', '49', '43', '60', '36', '48', '41', '42'],
                },
            },
        },
        {
            file: 'IOF3-0_example1',
            expected: {
                courseByName: {
                    'A': ['31', '32', '33', '31', '34', '35', '31', '100'],
                    'B': ['31', '34', '35', '31', '32', '33', '31', '100'],
                },
            },
        },
        {
            file: 'IOF3-0_example2',
            expected: {
                courseByName: {
                    'A': ['31', '32', '33', '31', '34', '35', '31', '100'],
                    'B': ['31', '34', '35', '31', '32', '33', '31', '100'],
                },
            },
        },
        {
            file: 'IOF2-0-3_unknown',
            expected: {
                courseByName: {},
            },
        },
        {
            file: 'IOF2-0-3_example1',
            expected: {
                courseByName: {},
            },
        },
        {
            file: 'IOF2-0-3_example2',
            expected: {
                courseByName: {},
            },
        },
    ];
    testCases.forEach((testCase) => {
        it(testCase.file, (done) => {
            fs.readFile(
                `${__dirname}/testData/parseCourseData_${testCase.file}.xml`,
                'utf8',
                (err, data) => {
                    if (err) {
                        throw err;
                    }
                    const rootElement = getXmlRoot(data);
                    const actual = parseCourseData(rootElement);
                    expect(actual).toEqual(testCase.expected);
                    done();
                },
            );
        });
    });
});
