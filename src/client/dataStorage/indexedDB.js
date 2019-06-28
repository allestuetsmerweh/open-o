const indexedDB = window.indexedDB;
const openoDBName = 'openo';
const openoDBVersion = 1;
const storeNames = {
    Event: 'Event',
};

const out = {};

if (indexedDB) {
    const openoDB = indexedDB.open(openoDBName, openoDBVersion);
    openoDB.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.warn(db, 'asdf');
        const eventsStore = db.createObjectStore(storeNames.Event, {
            keyPath: 'id',
            autoIncrement: true,
        });
        eventsStore.createIndex('id_unique', 'id', {unique: true});
        eventsStore.createIndex('ident_unique', 'ident', {unique: true});
    };
    openoDB.onerror = console.error;
    openoDB.onsuccess = (openEvent) => {
        const db = openEvent.target.result;
        out.db = db;
        const list = (storeName) => (query, direction) => new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.openCursor(query, direction);
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
        const get = (storeName) => (key) => new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
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
        const put = (storeName) => (newData) => new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(newData);
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
        out.listEvents = list(storeNames.Event);
        out.getEvent = get(storeNames.Event);
        out.createEvent = create(storeNames.Event);
        out.putEvent = put(storeNames.Event);
        console.warn(db);
    };
    out.openoDB = openoDB;
}

export default out;
