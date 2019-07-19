const indexedDB = window.indexedDB;
const openoDBName = 'openo';
const openoDBVersion = 1;
const storeNames = {
    Event: 'Event',
    Competitor: 'Competitor',
    EventCourse: 'EventCourse',
    EventCompetitor: 'EventCompetitor',
};

const out = {};

if (indexedDB) {
    const openoDB = indexedDB.open(openoDBName, openoDBVersion);
    openoDB.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.warn(db, 'asdf');

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
    };
    openoDB.onerror = console.error;
    openoDB.onsuccess = (openEvent) => {
        const db = openEvent.target.result;
        out.db = db;
        const list = (storeName) => (index, query, direction) => new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const storeIndex = index !== undefined ? store.index(index) : store;
            const request = storeIndex.openCursor(query, direction);
            request.onerror = (errorEvent) => {
                console.error(`List failed: ${errorEvent}`);
                reject(errorEvent);
            };
            const items = [];
            request.onsuccess = (successEvent) => {
                const cursor = successEvent.target.result;
                if (cursor) {
                    items.push(cursor.value);
                    cursor.continue();
                } else {
                    console.log(`List successful: ${items.length}`);
                    resolve(items);
                }
            };
        });
        const get = (storeName) => (index, key) => new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const storeIndex = index !== undefined ? store.index(index) : store;
            const request = storeIndex.get(key);
            request.onerror = (errorEvent) => {
                console.error(`Get failed: ${errorEvent}`);
                reject(errorEvent);
            };
            request.onsuccess = (successEvent) => {
                const item = successEvent.target.result;
                console.log(`Get successful: ${item}`);
                resolve(item);
            };
        });
        const create = (storeName) => (data) => new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            request.onerror = (errorEvent) => {
                console.error(`Creation failed: ${errorEvent}`);
                reject(errorEvent);
            };
            request.onsuccess = (successEvent) => {
                const key = successEvent.target.result;
                console.log(`Creation successful: ${key}`);
                resolve(key);
            };
        });
        const put = (storeName) => (newData, key) => new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(newData, key);
            request.onerror = (errorEvent) => {
                console.error(`Put failed: ${errorEvent}`);
                reject(errorEvent);
            };
            request.onsuccess = (successEvent) => {
                const item = successEvent.target.result;
                console.log(`Put successful: ${item}`);
                resolve(item);
            };
        });
        const remove = (storeName) => (index, query) => new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const storeIndex = index !== undefined ? store.index(index) : store;
            const request = storeIndex.openCursor(query);
            request.onerror = (errorEvent) => {
                console.error(`List failed: ${errorEvent}`);
                reject(errorEvent);
            };
            const deleteRequests = {};
            let listFinished = false;
            const resolveIfFinished = () => {
                if (listFinished && Object.keys(deleteRequests).length === 0) {
                    resolve();
                }
            };
            request.onsuccess = (successEvent) => {
                const cursor = successEvent.target.result;
                if (cursor) {
                    const deleteRequest = cursor.delete();
                    deleteRequests[cursor.key] = deleteRequest;
                    deleteRequest.onsuccess = () => {
                        delete deleteRequests[cursor.key];
                        resolveIfFinished();
                    };
                    deleteRequest.onerror = (errorEvent) => {
                        console.error(`Delete failed: ${errorEvent}`);
                        reject(errorEvent);
                    };
                    cursor.continue();
                } else {
                    console.log('List for deletion successful');
                    listFinished = true;
                    resolveIfFinished();
                }
            };
        });
        out.listEvents = list(storeNames.Event);
        out.getEvent = get(storeNames.Event);
        out.createEvent = create(storeNames.Event);
        out.putEvent = put(storeNames.Event);
        out.deleteEvent = remove(storeNames.Event);
        out.listEventCourses = list(storeNames.EventCourse);
        out.getEventCourse = get(storeNames.EventCourse);
        out.createEventCourse = create(storeNames.EventCourse);
        out.deleteEventCourses = remove(storeNames.EventCourse);
        out.listEventCompetitors = list(storeNames.EventCompetitor);
        out.getEventCompetitor = get(storeNames.EventCompetitor);
        out.createEventCompetitor = create(storeNames.EventCompetitor);
        out.putEventCompetitor = put(storeNames.EventCompetitor);
        out.deleteEventCompetitor = remove(storeNames.EventCompetitor);
        console.warn(db);
    };
    out.openoDB = openoDB;
}

export default out;
