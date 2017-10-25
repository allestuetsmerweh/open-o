si.onLoad = function (e) {
  si.MainStation.onAdded = function (ms) {
    console.log("MainStation added", ms);

    ms.onStateChanged = function (state) {
      if (state==si.MainStation.State.Ready) ms.signal(1);
      console.log("State changed", state);
    };
    ms.onCardInserted = function (card) {
      $('#si-quickinfo').fadeIn(400);
      $('#si-quickinfo').html("Bitte warten...");
      console.log("Card inserted");
    };
    ms.onCard = function (card) {
      var htmlout = "<div>SICard Number: "+card.cardNumber+"</div>";
      htmlout += "<div>Clear: "+card.clearTime+"</div>";
      htmlout += "<div>Check: "+card.checkTime+"</div>";
      htmlout += "<div>Start: "+card.startTime+"</div>";
      htmlout += "<div>Finish: "+card.finishTime+"</div>";
      for (var k in card.punches) {
        htmlout += "<div>"+card.punches[k].code+": "+card.punches[k].time+"</div>";
      }
      $('#si-quickinfo').html(htmlout);
      console.log("Card read");
    };
    ms.onCardRemoved = function (card) {
      $('#si-quickinfo').fadeOut(200, function () {
        $('#si-quickinfo').html("");
      });
      console.log("Card removed");
    };
  };
  si.MainStation.onRemoved = function (ms) {
    console.log("MainStation removed", ms);
  };
};
