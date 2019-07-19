import React from 'react';
import {Link} from 'react-router-dom';
import indexedDB from '../dataStorage/indexedDB';

export const MyEventListView = () => {
    const [events, setEvents] = React.useState([]);
    React.useEffect(() => {
        indexedDB.listEvents().then((newEvents) => setEvents(newEvents));
    }, []);

    return (
        <div>
            <button onClick={() => {
                indexedDB.createEvent({})
                    .then((eventId) => {
                        window.location.hash = `events/${eventId}`;
                    });
            }}>New Event</button>
            {events.map((event) => (
                <div key={event.id}>
                    <Link to={`events/${event.id}`}>
                        {event.name || '---'}
                    </Link>
                </div>
            ))}
        </div>
    );
};
