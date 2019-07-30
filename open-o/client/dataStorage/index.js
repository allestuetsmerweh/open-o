import {list, get, create, put, remove} from './methods';
import {storeNames} from './storeNames';
import {getDbConnection} from './indexedDB';

const commands = {
    listEvents: list(getDbConnection, storeNames.Event),
    getEvent: get(getDbConnection, storeNames.Event),
    createEvent: create(getDbConnection, storeNames.Event),
    putEvent: put(getDbConnection, storeNames.Event),
    deleteEvent: remove(getDbConnection, storeNames.Event),
    listEventCourses: list(getDbConnection, storeNames.EventCourse),
    getEventCourse: get(getDbConnection, storeNames.EventCourse),
    createEventCourse: create(getDbConnection, storeNames.EventCourse),
    deleteEventCourses: remove(getDbConnection, storeNames.EventCourse),
    listEventCompetitors: list(getDbConnection, storeNames.EventCompetitor),
    getEventCompetitor: get(getDbConnection, storeNames.EventCompetitor),
    createEventCompetitor: create(getDbConnection, storeNames.EventCompetitor),
    putEventCompetitor: put(getDbConnection, storeNames.EventCompetitor),
    deleteEventCompetitor: remove(getDbConnection, storeNames.EventCompetitor),
};
export default commands;
