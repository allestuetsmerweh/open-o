import si from 'sportident/lib/index';
import dataStorageCommands from '../dataStorage';

export const handleCardInserted = (
    cardInsertedEvent,
    eventId,
    db = dataStorageCommands,
) => {
    const {
        siCard: card,
        siMainStation: mainStation,
    } = cardInsertedEvent;
    console.warn(card, card.cardNumber);

    const createNewEventCompetitor = () => {
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
    };

    db.listEventCompetitors(
        'eventIdControlCardIndex',
        IDBKeyRange.only([eventId, card.cardNumber]),
    )
        .then((items) => {
            if (items.length === 0) {
                return createNewEventCompetitor();
            }

            const competitorToReadOut = items.find((item) => item.results === undefined);
            if (competitorToReadOut === undefined) {
                return createNewEventCompetitor();
            }

            return card.read()
                .then(() => db.putEventCompetitor({
                    ...competitorToReadOut,
                    cardData: card.toDict(),
                }))
                .then(() => mainStation.sendMessage({mode: si.constants.proto.ACK}, 0))
                .then(() => competitorToReadOut.id);
        });
};
