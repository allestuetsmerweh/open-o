/* global si, $ */

si.onLoad = (_e) => {
    if ($('#si-quickinfo').length === 0) {
        $('body').append('<div id="si-quickinfo"></div>');
    }
    si.MainStation.onAdded = (ms) => {
        console.log('MainStation added', ms);

        ms.onStateChanged = (state) => {
            if (state == si.MainStation.State.Ready) {
                ms.signal(1);
            }
            console.log('State changed', state);
        };
        ms.onCardInserted = (_card) => {
            $('#si-quickinfo').fadeIn(400);
            $('#si-quickinfo').html('Bitte warten...');
            console.log('Card inserted');
        };
        ms.onCard = (card) => {
            var htmlout = `<div>SICard Number: ${card.cardNumber}</div>`;
            htmlout += `<div>Clear: ${card.clearTime}</div>`;
            htmlout += `<div>Check: ${card.checkTime}</div>`;
            htmlout += `<div>Start: ${card.startTime}</div>`;
            htmlout += `<div>Finish: ${card.finishTime}</div>`;
            Object.keys(card.punches).map((k) => {
                htmlout += `<div>${card.punches[k].code}: ${card.punches[k].time}</div>`;
            });
            $('#si-quickinfo').html(htmlout);
            console.log('Card read');
        };
        ms.onCardRemoved = (_card) => {
            $('#si-quickinfo').fadeOut(200, () => {
                $('#si-quickinfo').html('');
            });
            console.log('Card removed');
        };
    };
    si.MainStation.onRemoved = (ms) => {
        console.log('MainStation removed', ms);
    };
};
