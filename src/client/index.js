import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {HashRouter, Route, Link} from 'react-router-dom';
import indexHtml from './index.html';
import stylesCss from './styles.css';
import si from '../../sportident/src/index';
import indexedDB from './dataStorage/indexedDB';

export default () => indexHtml.replace(
    '<!--INSERT_CSS_HERE-->',
    `<style>${stylesCss.toString()}</style>`,
);

const Home = () => {
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

const EventDetail = (props) => {
    const WebUsbSiDevice = React.useMemo(() => si.drivers.getWebUsbSiDevice(window.navigator), []);
    const webUsbSiDevices = si.react.useSiDevices(WebUsbSiDevice, React);

    const eventId = parseInt(props.match.params.eventId, 10);
    const [event, setEvent] = React.useState(null);
    React.useEffect(() => {
        indexedDB.getEvent(eventId).then((item) => setEvent(item));
    }, [props.match.params.eventId]);

    const [eventName, setEventName] = React.useState('');
    React.useEffect(() => {
        setEventName(event ? event.name : '');
    }, [event]);

    const deviceList = [...webUsbSiDevices.values()].map((device) => (
        <div key={`device-${device.ident}`}>
            {device.name}
        </div>
    ));

    React.useEffect(() => {
        [...webUsbSiDevices.values()].map((device) => {
            console.warn(device);
            console.warn(si.MainStation.fromSiDevice(device));
            return null;
        });
    }, [webUsbSiDevices]);


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
            <div>{deviceList}</div>
            <button onClick={() => WebUsbSiDevice.detect()}>Add</button>
        </div>
    );
};
EventDetail.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            eventId: PropTypes.string,
        }),
    }),
};

if (window.addEventListener) {
    window.addEventListener('load', () => {
        ReactDOM.render(
            (
                <HashRouter>
                    <Route exact path="/" component={Home} />
                    <Route path="/events/:eventId" component={EventDetail} />
                </HashRouter>
            ),
            window.document.getElementById('root'),
        );
    });
}
