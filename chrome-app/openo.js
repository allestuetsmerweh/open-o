
var app = angular.module('openo', []);
app.controller('openoCtrl', ['$scope', function($scope) {
    $scope.tabs = {
        0:{name:"Info", description:"Informationen zum Event"},
        1:{name:"Vereine", description:"Liste mit allen Vereinen, die bei der Anmeldung vorgeschlagen werden"},
        2:{name:"Läufer", description:"Liste mit allen Läufern, die bei der Anmeldung automatisch erkannt werden können"},
        3:{name:"Kategorien", description:"Liste der Kategorien und deren Bahnen"},
        4:{name:"Teilnehmer", description:"Liste der Anmeldungen, Startzeiten und Resultate"}
    };
    $scope.events = [];
    $scope.selectedEvent = null;
    $scope.newEvent = function () {
        //var newEvent = {name:"Untitled"};
        var newEvent = {name:"Untitled", participants:[{firstName:"Simon", lastName:"Hatt", birthYear:1992, addressCity:"Zürich", organisation:"OL Zimmerberg", class:"HAM"}, {firstName:"Serafina", lastName:"Hatt", birthYear:1994, addressCity:"Zürich", organisation:"OL Zimmerberg"}]};
        $scope.events.push(newEvent);
        $scope.selectedEvent = $scope.events.length-1;
    }
    $scope.currentEvent = function () {
        return $scope.events[$scope.selectedEvent];
    }
    $scope.currentSIMainStations = {};
    $scope.currentSICard = null;
    $scope.onSIMainStationAdded = function (ms) {
        $scope.currentSIMainStations[ms.device] = ms;
        console.log("NG Station added");
        $scope.$apply();
    }
    $scope.onSIMainStationRemoved = function (ms) {
        delete $scope.currentSIMainStations[ms.device];
        console.log("NG Station removed");
        $scope.$apply();
    }
    $scope.onSICardInserted = function (ms) {
        console.log("NG Card inserted");
        $scope.$apply();
    }
    $scope.onSICard = function (ms) {
        console.log("NG Card");
        $scope.$apply();
    }
    $scope.onSICardRemoved = function (ms) {
        console.log("NG Card removed");
        $scope.$apply();
    }
}]);


var oo = {};


// Backup
chrome.system.storage.getInfo(function (info) {
    //console.log(info);
});



// ###### Ajax ######
/*
var ajaxWithHost = function (host) {return function (method, request, data, on_success, on_error) {
    method = method.toUpperCase();
    var methods = {
        GET: {name:"GET", send:function (xhr) {
            xhr.send();
        }},
        POST: {name:"POST", send:function (xhr) {
            xhr.send(JSON.stringify(data));
        }},
        PUT: {name:"PUT", send:function (xhr) {
            xhr.send(JSON.stringify(data));
        }},
        PATCH: {name:"PATCH", send:function (xhr) {
            xhr.send(JSON.stringify(data));
        }},
        DELETE: {name:"DELETE", send:function (xhr) {
            xhr.send(JSON.stringify(data));
        }},
    };
    var m = methods[method];
    if (!m) {
        on_error("INVALID_METHOD_"+method);
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open(m.name, host+"ajax.php/"+request, true);
    xhr.onreadystatechange = (function (si, xhr) {return function (e) {
        if (xhr.readyState==4) {
            if (xhr.status==200) {
                var data = JSON.parse(xhr.responseText);
                on_success(data);
            } else {
                on_error("HTTP_STATUS_"+xhr.status);
            }
        }
    };})(si, xhr);
    m.send(xhr);
};};

oo.ajax = ajaxWithHost("");
oo.lajax = ajaxWithHost("http://localhost:1366/");


var genericAllBy = function (order) {
    return function () {
        for (var i=0; i<order.length; i++) {
            if (order[i][0]=="-") order[i] = [-1, order[i].substr(1)];
            else if (order[i][0]=="+") order[i] = [1, order[i].substr(1)];
            else order[i] = [1, order[i]];
        }
        var args_to_allIDs = [];
        for (var i=0; i<this.allIDs.length-2; i++) {
            args_to_allIDs.push(arguments[i]);
        }
        args_to_allIDs.push((function (obj, args) {return function (ids) {
            var args_to_getByIDs = [ids];
            args_to_getByIDs.push(function (data) {
                var el = [];
                for (var k in data) {
                    var d = data[k];
                    d["id"] = k;
                    el.push(d);
                }
                el.sort(function (x, y) {
                    for (var i=0; i<order.length; i++) {
                        if (x[order[i][1]]!=undefined && y[order[i][1]]!=undefined) {
                            if (x[order[i][1]]<y[order[i][1]]) {
                                return (order[i][0]?1:-1);
                            }
                            if (x[order[i][1]]>y[order[i][1]]) {
                                return (order[i][0]?-1:1);
                            }
                        }
                    }
                    return 0;
                });
                for (var i=0; i<el.length; i++) {
                    el[i] = new oo.Event(el[i]["id"], el[i]);
                }
                if (args[obj.allIDs.length-2]) args[obj.allIDs.length-2](el);
            });
            args_to_getByIDs.push(args[obj.allIDs.length-1]);
            obj.getByIDs.apply(obj, args_to_getByIDs);
        };})(this, arguments));
        args_to_allIDs.push(arguments[this.allIDs.length-1]);
        this.allIDs.apply(this, args_to_allIDs);
    }
};


var genericInfoGetter = function (property) {
    return function (on_success, on_error) {
        var tmp = this._dict[property];
        if (tmp==undefined) {
            var req = {};
            req[this._classIdent+"/"+this._id] = {};
            chrome.storage.local.get(req, function (data) {
                console.log("GOT Property "+property+" of object "+this+": "+data);
            });
            return "";
        } else {
            return tmp;
        }
    }
};
*/
