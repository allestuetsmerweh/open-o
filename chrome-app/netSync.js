
if (net.sync) console.warn("net.sync variable already existed. Overwriting...");

net.sync = {};


net.sync.tools = {
};


net.sync.Root = function (ident, p2p) {
    this.ident = ident;
    this.p2p = p2p;
    this._myIndex = {};
    this.myData = false;
    this.remoteData = {};
    try {
        openOP2P.onTCPReceive[ident] = function (p2p, resp) {
            var remotePeerID = resp[0];
            if (!this.remoteData[remotePeerID]) this.remoteData[remotePeerID] = {};
            var remoteChanges = resp[1];
            console.warn(remotePeerID, this.remoteData[remotePeerID], JSON.stringify(remoteChanges));
            var res = this.patch([], this.remoteData[remotePeerID], remoteChanges);
            this.remoteData[remotePeerID] = res;
            console.log(this.getGlobalData());
            //console.log(this.remoteData);
        }.bind(this);
    } catch (err) {}
};

net.sync.Root.prototype.patch = function (keyVal, remoteData, remoteChanges) {
    var dataType = 's';
    if (remoteData instanceof Object) dataType = 'd';
    var chgKey = JSON.stringify(keyVal);
    if (remoteChanges[chgKey]) {
        var res = remoteChanges[chgKey][0];
        delete remoteChanges[chgKey];
        return res;
    }
    if (dataType=='s') {
        return remoteData;
    } else {
        var result = {};
        for (var k in remoteData) {
            var res = this.patch(keyVal.concat([k]), remoteData[k], remoteChanges);
            if (res!=undefined) result[k] = res;
        }
        for (var k in remoteChanges) {
            var chgKeyArr = JSON.parse(k);
            if (chgKeyArr.length==keyVal.length+1) {
                var same = true;
                for (var i=0; i<keyVal.length && same; i++) if (chgKeyArr[i]!=keyVal[i]) same = false;
                if (same) result[chgKeyArr[chgKeyArr.length-1]] = remoteChanges[k][0];
            }
        }
        return result;
    }
}
net.sync.Root.prototype.diff = function (keyVal, indexVal, dataVal) {
    var result = {};
    if (dataVal!=undefined) {
        var dataType = 's';
        if (dataVal instanceof Object) dataType = 'd';
        if (!indexVal['type'] || indexVal['type']!=dataType) {
            //console.log("INDEX FOR "+JSON.stringify(keyVal)+" NOT CURRENT");
            indexVal['type'] = dataType;
            //console.log("Type is "+dataType+"...");
            if (dataType=='s') {
                indexVal['value'] = dataVal;
            } else {
                indexVal['index'] = {};
                for (var k in dataVal) {
                    indexVal['index'][k] = {};
                    this.diff(keyVal.concat([k]), indexVal['index'][k], dataVal[k]);
                }
            }
            result[JSON.stringify(keyVal)] = [dataVal];
        } else {
            //console.log("INDEX FOR "+JSON.stringify(keyVal)+" IS CURRENT");
            //console.log("Type is "+dataType+"...");
            if (dataType=='s') {
                if (typeof(indexVal['value'])!=typeof(dataVal) || indexVal['value']!=dataVal) {
                    result[JSON.stringify(keyVal)] = [dataVal];
                }
            } else {
                var indexDataKeys = {};
                for (var k in dataVal) {
                    if (!indexVal['index'][k]) indexDataKeys[k] = 1;
                    else indexDataKeys[k] = 0;
                }
                for (var k in indexVal['index']) {
                    if (!dataVal[k]) indexDataKeys[k] = -1;
                    else indexDataKeys[k] = 0;
                }
                for (var k in indexDataKeys) {
                    if (indexDataKeys[k]==1) {
                        indexVal['index'][k] = {};
                    } else if (indexDataKeys[k]==-1) {
                        delete indexVal['index'][k];
                    }
                    var tmpKeyVal = keyVal.concat([k]);
                    if (0<=indexDataKeys[k]) {
                        var res = this.diff(tmpKeyVal, indexVal['index'][k], dataVal[k]);
                    }
                    if (indexDataKeys[k]==1) {
                        result[JSON.stringify(tmpKeyVal)] = [dataVal[k]];
                    } else if (indexDataKeys[k]==0) {
                        for (var resk in res) result[resk] = res[resk];
                    } else if (indexDataKeys[k]==-1) {
                        result[JSON.stringify(tmpKeyVal)] = [];
                    }
                }
            }
        }
    } else {
        //console.log("DATA undefined");
    }
    return result;
};
net.sync.Root.prototype.merge = function (peerData) {
    var resultByType = {};
    var dataType = 's';
    for (var i=0; i<peerData.length; i++) {
        if (peerData[i] instanceof Object) dataType = 'd';
    }
    if (dataType=='s') {
        return peerData[0];
    }
    var result = {};
    for (var i=0; i<peerData.length; i++) {
        var dict = peerData[i];
        if (!(dict instanceof Object)) continue;
        for (var k in dict) {
            result[k] = true;
        }
    }
    for (var k in result) {
        var arr = [];
        for (var i=0; i<peerData.length; i++) {
            var dict = peerData[i];
            if (!(dict instanceof Object)) continue;
            if (dict[k]==undefined) continue;
            arr.push(dict[k]);
        }
        result[k] = this.merge(arr);           
    }
    return result;
};
net.sync.Root.prototype.getGlobalData = function () {
    var peerData = [this.myData];
    for (var remotePeerID in this.remoteData) peerData.push(this.remoteData[remotePeerID]);
    return this.merge(peerData);
};
net.sync.Root.prototype.update = function () {
    var res = this.diff([], this._myIndex, this.myData);
    console.log("UPDATE", res);
    this.p2p.onPeerID(function (p2p, peerID) {
        p2p.sendAll(this.ident, [peerID, res]);
    }.bind(this));
};