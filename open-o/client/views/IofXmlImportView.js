import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {parseIofXml} from '../iofXml/parse';
import indexedDB from '../dataStorage/indexedDB';

export const IofXmlImportView = (props) => {
    const eventId = parseInt(props.match.params.eventId, 10);
    const [coursesVersion, setCoursesVersion] = React.useState(0);
    const [courses, setCourses] = React.useState([]);
    React.useEffect(() => {
        indexedDB.listEventCourses('eventIdIndex', IDBKeyRange.only(eventId)).then((newCourses) => setCourses(newCourses));
    }, [eventId, coursesVersion]);

    const handleImportFile = (file) => {
        const reader = new FileReader();
        reader.onload = (readEvent) => {
            const contentString = readEvent.target.result;
            const importData = parseIofXml(contentString);
            indexedDB.deleteEventCourses('eventIdIndex', IDBKeyRange.only(eventId));
            Object.keys(importData.courseByName).forEach((courseName) => {
                indexedDB.createEventCourse({
                    name: courseName,
                    controls: importData.courseByName[courseName],
                    eventId: eventId,
                });
            });
            setCoursesVersion((coursesVersion_) => coursesVersion_ + 1);
        };
        reader.readAsText(file);
    };

    React.useEffect(() => {
        const bodyElement = window.document.body;
        const handleDragOver = (dragEvent) => {
            dragEvent.preventDefault();
            dragEvent.stopPropagation();
            dragEvent.dataTransfer.dropEffect = 'copy';
        };
        const handleDrop = (dropEvent) => {
            dropEvent.preventDefault();
            dropEvent.stopPropagation();
            const droppedFiles = [...dropEvent.dataTransfer.files];
            droppedFiles.forEach(handleImportFile);
        };
        bodyElement.addEventListener('dragover', handleDragOver);
        bodyElement.addEventListener('drop', handleDrop);
        return () => {
            bodyElement.removeEventListener('dragover', handleDragOver);
            bodyElement.removeEventListener('drop', handleDrop);
        };
    });

    return (
        <div>
            <div><Link to={`/events/${eventId}`}>Back to Event</Link></div>
            {props.match.params.eventId}
            {courses.map((course) => (
                <div key={course.id}>
                    {course.name}: {course.controls.join(' ')}
                </div>
            ))}
            <div><input
                type='file'
                multiple
                onChange={(changeEvent) => {
                    const selectedFiles = [...changeEvent.target.files];
                    selectedFiles.forEach(handleImportFile);
                }}
            /></div>
        </div>
    );
};
IofXmlImportView.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            eventId: PropTypes.string,
        }),
    }),
};
