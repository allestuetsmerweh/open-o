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

    const [offerDescription, setOfferDescription] = React.useState({});
    const [offerIceCandidates, setOfferIceCandidates] = React.useState([]);
    const [offerConnection, setOfferConnection] = React.useState(null);
    React.useEffect(() => {
        const connection = new RTCPeerConnection({iceServers: [
            {urls: ['stun:192.168.178.164']},
            {urls: ['stun:8.8.8.8']},
            {
                urls: ['turn:192.168.178.164'],
                username: 'openo',
                credential: 'bestappever',
            },
        ]});
        setOfferConnection(connection);
        connection.ondatachannel = (e) => {
            console.log('datachannel', e.channel);
            e.channel.onmessage = (e) => {
                console.log('message', e.data);
            }
            e.channel.onopen = () => {
                console.log('open');
            };
            e.channel.onclose = () => {
                console.log('close');
            };
        };

        const sendChannel = connection.createDataChannel('sendChannel');
        sendChannel.onopen = () => {
            console.log('local open');
        };
        sendChannel.onclose = () => {
            console.log('local close');
        };

        connection.onicecandidate = e => {
            if (e.candidate) {
                setOfferIceCandidates(iceCandidates => [...iceCandidates, e.candidate]);
            }
            console.log('offer ice candidate', e.candidate, e);
        };
        connection.oniceconnectionstatechange = (e) => {
            console.log('offer ice change', e);
        };

        connection.createOffer()
            .then(newOffer => {
                setOfferDescription(newOffer);
                console.log('OFFER CREATED', newOffer);
                return connection.setLocalDescription(newOffer);
            })
            .then(() => {
                console.log('OFFER: LOCAL DESC SET');
            });
            // .then(() => {
            //     console.log('REMOTE CONN REMOTE DESC SET');
            //     return remoteConnection.createAnswer()
            // })
            // .then(answer => {
            //     console.log('ANSWER CREATED', answer);
            //     return remoteConnection.setLocalDescription(answer)
            // })
            // .then(() => {
            //     console.log('REMOTE CONN LOCAL DESC SET');
            //     return connection.setRemoteDescription(remoteConnection.localDescription)
            // })
            // .then(() => {
            //     console.log('LOCAL CONN REMOTE DESC SET');
            // });

        setInterval(() => {
            if (sendChannel.readyState === 'open') {
                sendChannel.send('PING');
            } else {
                console.warn('could not send ping');
            }
        }, 1000);
        console.log('WebRTC');
    }, []);

    const [answerDescription, setAnswerDescription] = React.useState('');
    const [answerIceCandidates, setAnswerIceCandidates] = React.useState([]);
    const answerToOffer = React.useCallback(() => {
        const offer = JSON.parse(document.getElementById('offer-input').value);
        const connection = new RTCPeerConnection();

        connection.onicecandidate = e => {
            if (e.candidate) {
                setAnswerIceCandidates(iceCandidates => [...iceCandidates, e.candidate]);
            }
            console.log('answer ice candidate', e.candidate, e);
        };

        connection.setRemoteDescription(offer.description)
            .then(() => {
                console.log('ANSWER: REMOTE DESC SET');
                return Promise.all(offer.iceCandidates.map(iceCandidate => (
                    connection.addIceCandidate(iceCandidate)
                )));
            })
            .then(() => {
                console.log('ANSWER: ICE CANDIDATES ADDED');
                return connection.createAnswer();
            })
            .then(answer => {
                setAnswerDescription(answer);
                console.log('ANSWER CREATED', answer);
                return connection.setLocalDescription(answer);
            })
            .then(() => {
                console.log('ANSWER: LOCAL DESC SET');
            });
    }, []);

    const answerToAnswer = React.useCallback(() => {
        const answer = JSON.parse(document.getElementById('answer-input').value);

        offerConnection.setRemoteDescription(answer.description)
            .then(() => {
                console.log('OFFER: REMOTE DESC SET');
                return Promise.all(answer.iceCandidates.map(iceCandidate => (
                    offerConnection.addIceCandidate(iceCandidate)
                )));
            })
            .then(() => {
                console.log('ANSWER: ICE CANDIDATES ADDED');
            });
    }, [offerConnection]);

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
            <div>{props.match.params.eventId}</div>
            <hr />
            <div>{JSON.stringify({description: offerDescription, iceCandidates: offerIceCandidates})}</div>
            <div><input id='offer-input' /><button onClick={answerToOffer}>Answer</button></div>
            <div>{JSON.stringify({description: answerDescription, iceCandidates: answerIceCandidates})}</div>
            <div><input id='answer-input' /><button onClick={answerToAnswer}>Answer</button></div>
            <hr />
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
