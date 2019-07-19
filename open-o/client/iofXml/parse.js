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
const parseCourseData = (courseDataElement) => {
    const importData = {
        courseByName: {},
    };
    const raceCourseDataElements = courseDataElement.querySelectorAll('CourseData > RaceCourseData');
    raceCourseDataElements.forEach((raceCourseDataElement) => {
        const raceCourseElements = raceCourseDataElement.querySelectorAll('RaceCourseData > Course');
        raceCourseElements.forEach((raceCourseElement) => {
            const raceCourseName = raceCourseElement.querySelector('Course > Name').textContent;
            const raceCourseControlElements = raceCourseElement.querySelectorAll('Course > CourseControl[type=Control]');
            const raceCourseControls = [...raceCourseControlElements].map((courseControlElement) => (
                courseControlElement.querySelector('CourseControl > Control').textContent
            ));
            importData.courseByName[raceCourseName] = raceCourseControls;
        });
    });
    return importData;
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
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(contentString, 'text/xml');
    const rootElement = xmlDoc.documentElement;
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
    const importData = parserByRootElementName[rootElement.tagName](rootElement);
    console.log(importData);
    return importData;
};
