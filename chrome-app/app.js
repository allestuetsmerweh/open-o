si.onLoad = function (e) {
    var scope = angular.element(document.getElementById("body")).scope();
    si.MainStation.onAdded = function (ms) {
        // ms.powerOff();
        ms.signal(1);
        scope.onSIMainStationAdded(ms);
        /*
        stations_info.innerHTML += "<div style='border:1px solid grey; padding:10px;' id='station_"+ms.device+"'><b>Station "+ms.device+"</b><br>"+
        "Mode: <span id='station_"+ms.device+"_mode'></span><br>"+
        "Code: <span id='station_"+ms.device+"_code'></span><br>"+
        "Beeps: <span id='station_"+ms.device+"_beeps'></span> - "+
        "Flashes: <span id='station_"+ms.device+"_flashes'></span> - "+
        "Autosend: <span id='station_"+ms.device+"_autoSend'></span> - "+
        "Extended Protocol: <span id='station_"+ms.device+"_extendedProtocol'></span><br>"+
        "Serial Number: <span id='station_"+ms.device+"_serialNumber'></span> - "+
        "firmwareVersion: <span id='station_"+ms.device+"_firmwareVersion'></span> - "+
        "buildDate: <span id='station_"+ms.device+"_buildDate'></span> - "+
        "deviceModel: <span id='station_"+ms.device+"_deviceModel'></span><br>"+
        "memorySize: <span id='station_"+ms.device+"_memorySize'></span> - "+
        "batteryDate: <span id='station_"+ms.device+"_batteryDate'></span> - "+
        "batteryCapacity: <span id='station_"+ms.device+"_batteryCapacity'></span> - "+
        "backupPointer: <span id='station_"+ms.device+"_backupPointer'></span><br>"+
        "getSICard6Mode: <span id='station_"+ms.device+"_getSICard6Mode'></span> - "+
        "memoryOverflow: <span id='station_"+ms.device+"_memoryOverflow'></span> - "+
        "lastWriteDate: <span id='station_"+ms.device+"_lastWriteDate'></span> - "+
        "autoOffTimeout: <span id='station_"+ms.device+"_autoOffTimeout'></span><br>"+
        "<div style='border:1px solid rgb(200,200,200);' id='station_"+ms.device+"_sicard'>"+
        "Card Number: <span id='station_"+ms.device+"_cardNumber'></span> - "+
        "Clear: <span id='station_"+ms.device+"_cardClearTime'></span> - "+
        "Check: <span id='station_"+ms.device+"_cardCheckTime'></span> - "+
        "Start: <span id='station_"+ms.device+"_cardStartTime'></span> - "+
        "Finish: <span id='station_"+ms.device+"_cardFinishTime'></span><br>"+
        "<div id='station_"+ms.device+"_cardPunches'></div>"+
        "</div>"+
        "</div>";
        */
        console.log("MainStation added", ms);
        var succFn = function (elemID) {
            return function (val) {
                var elem = document.getElementById(elemID);
                elem.style.color = "green";
                elem.innerHTML = val;
            }
        };
        var errFn = function (elemID) {
            return function (val) {
                var elem = document.getElementById(elemID);
                elem.style.color = "red";
                elem.innerHTML = val;
            }
        };
        /*
        ms.getCode(succFn("station_"+ms.device+"_code"), errFn("station_"+ms.device+"_code"));
        ms.getMode(succFn("station_"+ms.device+"_mode"), errFn("station_"+ms.device+"_mode"));
        ms.getBeeps(succFn("station_"+ms.device+"_beeps"), errFn("station_"+ms.device+"_beeps"));
        ms.getFlashes(succFn("station_"+ms.device+"_flashes"), errFn("station_"+ms.device+"_flashes"));
        ms.getAutoSend(succFn("station_"+ms.device+"_autoSend"), errFn("station_"+ms.device+"_autoSend"));
        ms.getExtendedProtocol(succFn("station_"+ms.device+"_extendedProtocol"), errFn("station_"+ms.device+"_extendedProtocol"));
        ms.getSerialNumber(succFn("station_"+ms.device+"_serialNumber"), errFn("station_"+ms.device+"_serialNumber"));
        ms.getFirmwareVersion(succFn("station_"+ms.device+"_firmwareVersion"), errFn("station_"+ms.device+"_firmwareVersion"));
        ms.getBuildDate(succFn("station_"+ms.device+"_buildDate"), errFn("station_"+ms.device+"_buildDate"));
        ms.getDeviceModel(succFn("station_"+ms.device+"_deviceModel"), errFn("station_"+ms.device+"_deviceModel"));
        ms.getMemorySize(succFn("station_"+ms.device+"_memorySize"), errFn("station_"+ms.device+"_memorySize"));
        ms.getBatteryDate(succFn("station_"+ms.device+"_batteryDate"), errFn("station_"+ms.device+"_batteryDate"));
        ms.getBatteryCapacity(succFn("station_"+ms.device+"_batteryCapacity"), errFn("station_"+ms.device+"_batteryCapacity"));
        ms.getBackupPointer(succFn("station_"+ms.device+"_backupPointer"), errFn("station_"+ms.device+"_backupPointer"));
        ms.getSICard6Mode(succFn("station_"+ms.device+"_getSICard6Mode"), errFn("station_"+ms.device+"_getSICard6Mode"));
        ms.getMemoryOverflow(succFn("station_"+ms.device+"_memoryOverflow"), errFn("station_"+ms.device+"_memoryOverflow"));
        ms.getLastWriteDate(succFn("station_"+ms.device+"_lastWriteDate"), errFn("station_"+ms.device+"_lastWriteDate"));
        ms.getAutoOffTimeout(succFn("station_"+ms.device+"_autoOffTimeout"), errFn("station_"+ms.device+"_autoOffTimeout"));
        */
        ms.onCardInserted = function (card) {
            scope.onSICardInserted(card);
        };
        ms.onCard = function (card) {
            scope.onSICard(card);
            /*
            var fn = succFn("station_"+ms.device+"_cardClearTime");
            fn(card.clearTime);
            var fn = succFn("station_"+ms.device+"_cardCheckTime");
            fn(card.checkTime);
            var fn = succFn("station_"+ms.device+"_cardStartTime");
            fn(card.startTime);
            var fn = succFn("station_"+ms.device+"_cardFinishTime");
            fn(card.finishTime);
            var outhtml = "<table>";
            for (var i=0; i<card.punches.length; i++) {
                outhtml += "<tr><td style='padding:0px 5px;'>"+(i+1)+"</td><td style='padding:0px 5px;'>"+card.punches[i].code+"</td><td style='padding:0px 5px;'>"+card.punches[i].time+"</td></tr>";
            }
            outhtml += "</table>";
            var fn = succFn("station_"+ms.device+"_cardPunches");
            fn(outhtml);
            */
        };
        ms.onCardRemoved = function (card) {
            scope.onSICardRemoved(card);
        };
        /*
        // Excerpt 1
        ms.setCode(Math.floor(Math.random()*1022+1), function (code) {
            console.log("Code", code);
        }, function (err) {
            console.log("Code ERROR", err);
        });
        // Excerpt 2
        ms.getTime(function (tim) {
            console.log("Time", tim);
        });
        window.setTimeout((function (tim) {return function () {
            ms.setTime(tim, function (tim) {
            console.log("Set Time", tim);
        });
        };})(new Date()), 1);

        //ms._sendCommand(0xF9, [0x01]);
        */
    };
    si.MainStation.onRemoved = function (ms) {
        scope.onSIMainStationRemoved(ms);
        console.log("MainStation removed", ms);
    };
};

chrome.runtime.getPlatformInfo(function (platformInfo) {
    console.log(platformInfo);
});

var openOP2P = new net.Peer2Peer("openo", "224.0.1.24"); // ffx8::0024
/*
openOP2P.onAdd = function (peer) {
    console.log(peer);
};
*/
openOP2P.onIsDuplicateInstance = function (p2p) {
    console.warn("There is already one instance running on this machine", p2p);
};

var openOSync = new net.sync.Root('openOSync', openOP2P);
openOP2P.onPeerID(function (p2p, peerID) {
    window.setTimeout(function () {
        var colors = ['red', 'green', 'blue', 'yellow', 'violet', 'cyan', 'orange', 'brown', 'grey'];
        var tmp = {};
        tmp[peerID] = colors[Math.floor(Math.random()*colors.length)];
        openOSync.myData = tmp;
        openOSync.update();
        openOSync.update();
        openOSync.myData["wtf"] = "ASDF";
        openOSync.update();
    }, 5000);
});

/*
openOP2P.onTCPReceive["test"] = function (p2p, resp) {
    console.warn(resp);
}
window.setTimeout(function () {
    openOP2P.sendAll("test", "Hallo");
}, 5000);
*/

window.setInterval(function () {
    console.log(openOP2P.peers);
}, 1000);
/*
window.setTimeout(function () {
    openOP2P.close();
}, 15000);
*/
