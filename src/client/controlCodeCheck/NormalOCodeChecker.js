import {BaseCodeChecker} from './BaseCodeChecker';

export class NormalOCodeChecker extends BaseCodeChecker {
    constructor(courseControlCodes, {replacementCodes, timeAnnihilations} = {}) {
        super({replacementCodes});
        this.courseControlCodes = courseControlCodes;
        this.timeAnnihilations = timeAnnihilations;
    }

    evaluate(_startTime, _finishTime, splitTimes) {
        const _correctUntilIndex = splitTimes.reduce(
            (courseIndex, splitTime) => {
                if (splitTime.controlCode === this.courseControlCodes[courseIndex]) {
                    return courseIndex + 1;
                }
                return courseIndex;
            },
            0,
        );
        return {};
    }
}
