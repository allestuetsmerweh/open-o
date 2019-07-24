export const parseCourseData = (courseDataElement) => {
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
