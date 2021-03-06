import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import db from '../dataStorage';

export const EventDetailView = (props) => {
    const eventId = parseInt(props.match.params.eventId, 10);

    const [event, setEvent] = React.useState(null);
    const [eventName, setEventName] = React.useState('');

    React.useEffect(() => {
        db.getEvent(undefined, eventId).then((item) => setEvent(item));
    }, [eventId]);

    React.useEffect(() => {
        setEventName(event ? event.name : '');
    }, [event]);

    return (
        <div>
            <div><Link to={'/my_events'}>Back to My Events</Link></div>
            <div>
                Name: <input
                    value={eventName}
                    onChange={(changeEvent) => {
                        const newEventName = changeEvent.target.value;
                        setEventName(newEventName);
                        db.putEvent({...event, name: newEventName}).then(console.warn);
                    }}
                />
            </div>
            {props.match.params.eventId}
            <div><Link to={`/my_events/${eventId}/import`}>Import</Link></div>
            <div><Link to={`/my_events/${eventId}/registration`}>Registration</Link></div>
        </div>
    );
};
EventDetailView.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            eventId: PropTypes.string,
        }),
    }),
};
