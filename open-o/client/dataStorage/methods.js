export const list = (getDbConnection, storeName) => (
    (index, query, direction) => new Promise((resolve, reject) => {
        getDbConnection().then((db) => {
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
    })
);
export const get = (getDbConnection, storeName) => (
    (index, key) => new Promise((resolve, reject) => {
        getDbConnection().then((db) => {
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
    })
);
export const create = (getDbConnection, storeName) => (
    (data) => new Promise((resolve, reject) => {
        getDbConnection().then((db) => {
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
    })
);
export const put = (getDbConnection, storeName) => (
    (newData, key) => new Promise((resolve, reject) => {
        getDbConnection().then((db) => {
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
    })
);
export const remove = (getDbConnection, storeName) => (
    (index, query) => new Promise((resolve, reject) => {
        getDbConnection().then((db) => {
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
    })
);
