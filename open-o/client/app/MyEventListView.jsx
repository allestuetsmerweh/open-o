import React from 'react';
import {Link} from 'react-router-dom';
import db from '../dataStorage';
import {useIsOnline} from './hooks';

export const MyEventListView = () => {
    const [events, setEvents] = React.useState([]);
    React.useEffect(() => {
        db.listEvents().then((newEvents) => setEvents(newEvents));
    }, []);

    const isOnline = useIsOnline();

    return (
        <div>
            <div><Link to={'/'}>Back to Home</Link></div>
            <button onClick={() => {
                db.createEvent({})
                    .then((eventId) => {
                        window.location.hash = `my_events/${eventId}`;
                    });
            }}>New Event</button>
            <div>{isOnline ? 'online' : 'offline'}</div>
            {events.map((event) => (
                <div key={event.id}>
                    <Link to={`my_events/${event.id}`}>
                        {event.name || '---'}
                    </Link>
                </div>
            ))}
        </div>
    );
};
