import {getXmlRoot} from './getXmlRoot';
import {parseCourseData} from './parseCourseData';

const parseCompetitorList = () => {
    throw new Error('not implemented');
};
const parseOrganisationList = () => {
    throw new Error('not implemented');
};
const parseEventList = () => {
    throw new Error('not implemented');
};
const parseClassList = () => {
    throw new Error('not implemented');
};
const parseEntryList = () => {
    throw new Error('not implemented');
};
const parseStartList = () => {
    throw new Error('not implemented');
};
const parseResultList = () => {
    throw new Error('not implemented');
};
const parseServiceRequestList = () => {
    throw new Error('not implemented');
};
const parseControlCardList = () => {
    throw new Error('not implemented');
};

export const parseIofXml = (contentString) => {
    const parserByRootElementName = {
        'CompetitorList': parseCompetitorList,
        'OrganisationList': parseOrganisationList,
        'EventList': parseEventList,
        'ClassList': parseClassList,
        'EntryList': parseEntryList,
        'CourseData': parseCourseData,
        'StartList': parseStartList,
        'ResultList': parseResultList,
        'ServiceRequestList': parseServiceRequestList,
        'ControlCardList': parseControlCardList,
    };
    const rootElement = getXmlRoot(contentString);
    const importData = parserByRootElementName[rootElement.tagName](rootElement);
    console.log(importData);
    return importData;
};
