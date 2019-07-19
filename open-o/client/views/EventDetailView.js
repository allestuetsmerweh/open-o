import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import indexedDB from '../dataStorage/indexedDB';

export const EventDetailView = (props) => {
    const eventId = parseInt(props.match.params.eventId, 10);
    const [event, setEvent] = React.useState(null);
    React.useEffect(() => {
        indexedDB.getEvent(eventId).then((item) => setEvent(item));
    }, [props.match.params.eventId]);

    const [eventName, setEventName] = React.useState('');
    React.useEffect(() => {
        setEventName(event ? event.name : '');
    }, [event]);

    return (
        <div>
            <div><Link to={'/'}>Back to Home</Link></div>
            <div>
                Name: <input
                    value={eventName}
                    onChange={(changeEvent) => {
                        const newEventName = changeEvent.target.value;
                        setEventName(newEventName);
                        indexedDB.putEvent({...event, name: newEventName}).then(console.warn);
                    }}
                />
            </div>
            {props.match.params.eventId}
            <div><Link to={`/events/${eventId}/import`}>Import</Link></div>
            <div><Link to={`/events/${eventId}/registration`}>Registration</Link></div>
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
