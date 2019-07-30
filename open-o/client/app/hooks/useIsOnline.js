import {useState, useEffect} from 'react';

const getOnlineStatus = () => (
    typeof navigator !== 'undefined' && (
        typeof navigator.onLine === 'boolean'
            ? navigator.onLine
            : true
    )
);

export const useIsOnline = () => {
    const [isOnline, setIsOnline] = useState(getOnlineStatus());
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    useEffect(() => {
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);

        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    return isOnline;
};
