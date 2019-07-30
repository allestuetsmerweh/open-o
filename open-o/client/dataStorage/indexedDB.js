import {migrations} from './migrations';

const indexedDB = window.indexedDB;
const openoDBName = 'openo';

const getDbQueue = [];
let dbConnection = undefined;
export const getDbConnection = () => new Promise((resolve) => {
    if (dbConnection !== undefined) {
        resolve(dbConnection);
        return;
    }
    getDbQueue.push(resolve);
});

if (indexedDB) {
    const openoDB = indexedDB.open(openoDBName, migrations.length);
    openoDB.onupgradeneeded = (event) => {
        const db = event.target.result;
        migrations.forEach((migration, migrationIndex) => {
            if (migrationIndex >= event.oldVersion) {
                console.log(`Executing migration ${migrationIndex}...`);
                migration(db);
            }
        });
    };
    openoDB.onerror = console.error;
    openoDB.onsuccess = (openEvent) => {
        const db = openEvent.target.result;
        dbConnection = db;
        getDbQueue.forEach((dbQueueResolve) => {
            dbQueueResolve(db);
        });
    };
}
