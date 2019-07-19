import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import si from '../../../sportident/src/index';
import indexedDB from '../dataStorage/indexedDB';

export const CompetitorRegistrationView = (props) => {
    const WebUsbSiDevice = React.useMemo(() => si.drivers.getWebUsbSiDevice(window.navigator), []);
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
            si.MainStation.fromSiDevice(newKioskDevice)
        ));
        const callbackByMainStation = {};
        newKioskMainStations.forEach((kioskMainStation) => {
            const handleCardInserted = (cardInsertedEvent) => {
                if (!isKiosk) {
                    return;
                }
                const card = cardInsertedEvent.card;
                console.warn(card, card.cardNumber);
                indexedDB.listEventCompetitors(
                    'eventIdControlCardIndex',
                    IDBKeyRange.only([eventId, card.cardNumber]),
                )
                    .then((items) => {
                        if (items.length === 0) {
                            let createdKey = undefined;
                            return indexedDB.createEventCompetitor({
                                eventId: eventId,
                                controlCard: card.cardNumber,
                            })
                                .then((key) => {
                                    createdKey = key;
                                    return kioskMainStation.sendMessage({mode: si.constants.proto.ACK}, 0);
                                })
                                .then(() => createdKey);
                        }
                        const competitorToReadOut = items.find((item) => item.results === undefined);
                        if (competitorToReadOut === undefined) {
                            let createdKey = undefined;
                            return indexedDB.createEventCompetitor({
                                eventId: eventId,
                                controlCard: card.cardNumber,
                            })
                                .then((key) => {
                                    createdKey = key;
                                    return kioskMainStation.sendMessage({mode: si.constants.proto.ACK}, 0);
                                })
                                .then(() => createdKey);
                        }
                        return card.read()
                            .then(() => indexedDB.putEventCompetitor({
                                ...competitorToReadOut,
                                results: card.toDict(),
                            }))
                            .then(() => kioskMainStation.sendMessage({mode: si.constants.proto.ACK}, 0))
                            .then(() => competitorToReadOut.id);
                    });
            };
            callbackByMainStation[kioskMainStation.ident] = handleCardInserted;
            kioskMainStation.addEventListener('cardInserted', handleCardInserted);
        });
        setKioskMainStations(newKioskMainStations);
        return () => {
            newKioskMainStations.forEach((kioskMainStation) => {
                const handleCardInserted = callbackByMainStation[kioskMainStation.ident];
                kioskMainStation.removeEventListener('cardInserted', handleCardInserted);
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
            <div><Link to={`/events/${eventId}`}>Back to Event</Link></div>
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
CompetitorRegistrationView.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            eventId: PropTypes.string,
        }),
    }),
};
