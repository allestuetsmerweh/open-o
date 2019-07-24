import si from '../../../sportident/src/index';
import indexedDB from '../dataStorage/indexedDB';

export const handleCardInserted = (
    cardInsertedEvent,
    eventId,
    db = indexedDB,
) => {
    const {
        siCard: card,
        siMainStation: mainStation,
    } = cardInsertedEvent;
    console.warn(card, card.cardNumber);
    db.listEventCompetitors(
        'eventIdControlCardIndex',
        IDBKeyRange.only([eventId, card.cardNumber]),
    )
        .then((items) => {
            if (items.length === 0) {
                let createdKey = undefined;
                return db.createEventCompetitor({
                    eventId: eventId,
                    controlCard: card.cardNumber,
                })
                    .then((key) => {
                        createdKey = key;
                        return mainStation.sendMessage({mode: si.constants.proto.ACK}, 0);
                    })
                    .then(() => createdKey);
            }
            const competitorToReadOut = items.find((item) => item.results === undefined);
            if (competitorToReadOut === undefined) {
                let createdKey = undefined;
                return db.createEventCompetitor({
                    eventId: eventId,
                    controlCard: card.cardNumber,
                })
                    .then((key) => {
                        createdKey = key;
                        return mainStation.sendMessage({mode: si.constants.proto.ACK}, 0);
                    })
                    .then(() => createdKey);
            }
            return card.read()
                .then(() => db.putEventCompetitor({
                    ...competitorToReadOut,
                    results: card.toDict(),
                }))
                .then(() => mainStation.sendMessage({mode: si.constants.proto.ACK}, 0))
                .then(() => competitorToReadOut.id);
        });
};
