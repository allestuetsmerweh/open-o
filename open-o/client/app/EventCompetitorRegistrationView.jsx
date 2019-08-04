import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import si from '../../../sportident/src/index';
import {handleCardInserted} from './EventCompetitorRegistrationController';

export const EventCompetitorRegistrationView = (props) => {
    const WebUsbSiDevice = React.useMemo(() => si.getWebUsbSiDeviceClass(window.navigator), []);
    const webUsbSiDevices = si.react.useSiDevices(WebUsbSiDevice, React);

    const eventId = parseInt(props.match.params.eventId, 10);
    const [isKiosk, setIsKiosk] = React.useState(false);
    const [kioskMainStations, setKioskMainStations] = React.useState([]);
    const fullscreenElement = React.useRef(null);

    const deviceList = [...webUsbSiDevices.values()].map((device) => (
        <div key={`device-${device.ident}`}>
            {device.name}
        </div>
    ));

    const enterKiosk = React.useCallback(() => {
        setIsKiosk(true);
        if (document.fullscreenEnabled) {
            fullscreenElement.current.requestFullscreen({navigationUI: 'hide'});
        }
    }, [fullscreenElement]);
    const exitKiosk = React.useCallback(() => {
        setIsKiosk(false);
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }, []);

    React.useEffect(() => {
        const newKioskMainStations = [...webUsbSiDevices.values()].map((newKioskDevice) => (
            si.SiMainStation.fromSiDevice(newKioskDevice)
        ));
        const callbackByMainStation = {};
        newKioskMainStations.forEach((kioskMainStation) => {
            const handleCardInsertedToMainStation = (cardInsertedEvent) => {
                if (!isKiosk) {
                    return;
                }
                handleCardInserted(cardInsertedEvent, eventId);
            };
            callbackByMainStation[kioskMainStation.ident] = handleCardInsertedToMainStation;
            kioskMainStation.addEventListener('siCardInserted', handleCardInsertedToMainStation);
        });
        setKioskMainStations(newKioskMainStations);
        return () => {
            newKioskMainStations.forEach((kioskMainStation) => {
                const handleCardInsertedToMainStation = callbackByMainStation[kioskMainStation.ident];
                kioskMainStation.removeEventListener('siCardInserted', handleCardInsertedToMainStation);
            });
        };
    }, [webUsbSiDevices, eventId, isKiosk]);

    React.useEffect(() => {
        const handleFullscreenChange = () => {
            if (isKiosk && !document.fullscreenElement) {
                console.warn('Fullscreen has been exited by the user');
                exitKiosk();
            }
        };
        fullscreenElement.current.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            fullscreenElement.current.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    });

    const setupContent = (
        <div>
            <div><Link to={`/my_events/${eventId}`}>Back to Event</Link></div>
            <div>{props.match.params.eventId}</div>
            <div>{deviceList}</div>
            <div><button onClick={() => WebUsbSiDevice.detect()}>New Device</button></div>
            <div><button onClick={enterKiosk}>Start Kiosk</button></div>
        </div>
    );
    const kioskContent = (
        <div>
            <button onClick={exitKiosk}>X</button>
            Test
            {kioskMainStations.map((ms) => ms.ident).join(', ')}
        </div>
    );

    return (
        <div
            style={{
                backgroundColor: 'rgb(235,225,200)',
            }}
            ref={fullscreenElement}
        >
            {isKiosk ? kioskContent : setupContent}
        </div>
    );
};
EventCompetitorRegistrationView.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            eventId: PropTypes.string,
        }),
    }),
};
