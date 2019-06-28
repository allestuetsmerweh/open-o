export class BaseCodeChecker {
    constructor({replacementCodes}) {
        this.replacementCodes = replacementCodes || {};
    }

    evaluate(_startTime, _finishTime, _splitTimes) {
        throw new Error('evaluate function must be overriden by subclasses of BaseCodeChecker');
    }
}
