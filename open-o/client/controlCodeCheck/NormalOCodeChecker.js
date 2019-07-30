import {BaseCodeChecker} from './BaseCodeChecker';

export class NormalOCodeChecker extends BaseCodeChecker {
    constructor(courseControlCodes, options = {}) {
        const {replacementCodes, timeAnnihilations} = options;
        super({replacementCodes});
        this.courseControlCodes = courseControlCodes;
        this.timeAnnihilations = timeAnnihilations;
    }

    evaluate(_startTime, _finishTime, splitTimes) {
        const _correctUntilIndex = splitTimes.reduce(
            (courseIndex, splitTime) => {
                const expectedControlCode = this.courseControlCodes[courseIndex];
                const competitorControlCode = splitTime.controlCode;
                const actualControlCode = (
                    competitorControlCode in this.replacementCodes
                        ? this.replacementCodes[competitorControlCode]
                        : competitorControlCode
                );
                if (actualControlCode === expectedControlCode) {
                    return courseIndex + 1;
                }
                return courseIndex;
            },
            0,
        );
        return {};
    }
}
