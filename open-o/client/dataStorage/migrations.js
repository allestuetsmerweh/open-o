import {storeNames} from './storeNames';

export const migrations = [
    (db) => {
        const eventStore = db.createObjectStore(storeNames.Event, {
            keyPath: 'id',
            autoIncrement: true,
        });
        eventStore.createIndex('idUnique', 'id', {unique: true});
        eventStore.createIndex('identUnique', 'ident', {unique: true});

        const eventCourseStore = db.createObjectStore(storeNames.EventCourse, {
            keyPath: 'id',
            autoIncrement: true,
        });
        eventCourseStore.createIndex('idUnique', 'id', {unique: true});
        eventCourseStore.createIndex('eventIdIndex', 'eventId');

        const eventCompetitorStore = db.createObjectStore(storeNames.EventCompetitor, {
            keyPath: 'id',
            autoIncrement: true,
        });
        eventCompetitorStore.createIndex('idUnique', 'id', {unique: true});
        eventCompetitorStore.createIndex('eventIdIndex', 'eventId');
        eventCompetitorStore.createIndex('eventIdControlCardIndex', ['eventId', 'controlCard']);
    },
];
