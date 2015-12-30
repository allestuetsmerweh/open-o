
if (net) console.warn("net variable already existed. Overwriting...");

var net = {};


net.tools = {
    generateID: function (len) {
        var id = "";
        var possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i=0; i<len; i++) id += possibleChars.charAt(Math.floor(Math.random()*possibleChars.length));
        return id;
    },
    str2buf: function (str) {
        var bytes = new Uint8Array(str.length);
        for (var i=0; i<str.length; i++) {
            bytes[i] = str.charCodeAt(i);
        }
        return bytes.buffer;
    },
    obj2buf: function (obj) {
        return net.tools.str2buf(JSON.stringify(obj)+"\n");
    },
    buf2str: function (buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    },
    buf2obj: function (buf) {
        return JSON.parse(net.tools.buf2str(buf));
    },
    buf2objs: function (exBuf, buf) {
        var bufView = new Uint8Array(buf);
        for (var i=0; i<bufView.length; i++) exBuf.push(bufView[i]);
        var pos = exBuf.indexOf("\n".charCodeAt(0));
        var objs = [];
        while (pos!=-1) {
            var tmp = exBuf.splice(0, pos+1);
            var str = String.fromCharCode.apply(null, tmp);
            objs.push(JSON.parse(str));
            pos = exBuf.indexOf("\n".charCodeAt(0));
        }
        return objs;
    },
    isIPv4: function (str) {
        return (str.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/)!=null);
    }
};

try {
    net._onAcceptHandlers = {};
    net._onAcceptErrorHandlers = {};
    net._onAccept = function (info) {
        var fn = net._onAcceptHandlers[info.socketId];
        if (fn) fn(info);
        else console.warn("No handler for onAccept", info);
    }
    net._onAcceptError = function (info) {
        var fn = net._onAcceptErrorHandlers[info.socketId];
        if (fn) fn(info);
        else console.warn("No handler for onAcceptError", info);
    }
    sysAPI.sockets.tcpServer.onAccept.addListener(net._onAccept);
    sysAPI.sockets.tcpServer.onAcceptError.addListener(net._onAcceptError);

    net._onUDPReceiveHandlers = {};
    net._onUDPReceiveErrorHandlers = {};
    net._onUDPReceive = function (info) {
        var fn = net._onUDPReceiveHandlers[info.socketId];
        if (fn) fn(info);
        else console.warn("No handler for onUDPReceive", info);
    }
    net._onUDPReceiveError = function (info) {
        var fn = net._onUDPReceiveErrorHandlers[info.socketId];
        if (fn) fn(info);
        else console.warn("No handler for onUDPReceiveError", info);
    }
    sysAPI.sockets.udp.onReceive.addListener(net._onUDPReceive);
    sysAPI.sockets.udp.onReceiveError.addListener(net._onUDPReceiveError);

    net._onTCPReceiveHandlers = {};
    net._onTCPReceiveErrorHandlers = {};
    net._onTCPReceive = function (info) {
        var fn = net._onTCPReceiveHandlers[info.socketId];
        if (fn) fn(info);
        else console.warn("No handler for onTCPReceive", info);
    }
    net._onTCPReceiveError = function (info) {
        var fn = net._onTCPReceiveErrorHandlers[info.socketId];
        if (fn) fn(info);
        else console.warn("No handler for onTCPReceiveError", info);
    }
    sysAPI.sockets.tcp.onReceive.addListener(net._onTCPReceive);
    sysAPI.sockets.tcp.onReceiveError.addListener(net._onTCPReceiveError);
} catch (err) {}


net.Peer2Peer = function (serviceID, multicastAddress) {
    this._discoveryTimeouts = {};
    this._TCPServerSocketIDs = {};
    this._UDPSocketIDs = {};
    this._TCPServerReceiveBuffer = [];
    this._lastDiscoveryIntervalUpdateTime = Date.now();
    this._lastDiscoveryInterval = 1000;
    this._lastIsDuplicateInstance = false;
    this._retryTCPSetupHistory = {};
    this._retryUDPSetupHistory = {};
    this._cannotListenOnTCP = false;
    this._cannotBindOnUDP = false;
    this.serviceID = serviceID;
    this.multicastAddress = multicastAddress;
    this.UDPPort = net.Peer2Peer.defaultUDPPort;
    this.TCPPort = net.Peer2Peer.defaultTCPPort;
    this.discoveryIntervalChangeRate = net.Peer2Peer.defaultDiscoveryIntervalChangeRate;
    this._onPeerID = [];
    this.onIsDuplicateInstance = function () {};
    this.onTCPReceive = {};
    this.peers = {};
    this.discoveryIntervalFactor = 1;
    this.peerID = false;
    this.execID = net.tools.generateID(32);
    if (sysAPI.storage && sysAPI.storage.local) {
        sysAPI.storage.local.get(this.serviceID+"peerId", function (items) {
            if (items[this.serviceID+"peerId"] && items[this.serviceID+"peerId"].length==32) {
                this.peerID = items[this.serviceID+"peerId"];
            } else {
                this.peerID = net.tools.generateID(32);
                var dict = {};
                dict[this.serviceID+"peerId"] = this.peerID;
                if (sysAPI.storage.local) sysAPI.storage.local.set(dict, function () {
                    console.debug("peerID Written");
                });
            }
            this._setup();
        }.bind(this));
    } else {
        this.peerID = net.tools.generateID(32);
        this._setup();
    }
};

net.Peer2Peer.defaultUDPPort = 10578;
net.Peer2Peer.defaultTCPPort = 10577;
net.Peer2Peer.multicastTTL = 15;
net.Peer2Peer.defaultDiscoveryIntervalChangeRate = 0.1; // per second; see net.Peer2Peer.prototype._discoveryInterval

net.Peer2Peer.prototype._setup = function () {
    for (var i=0; i<this._onPeerID.length; i++) {
        window.setTimeout(function (callback) {
            callback(this, this.peerID);
        }.bind(this, this._onPeerID[i]), 1);
    }
    this._onPeerID = [];
    sysAPI.system.network.getNetworkInterfaces(function (networkInterfaces) {
        for (var i=0; i<networkInterfaces.length; i++) {
            if (this.isIPv4()==net.tools.isIPv4(networkInterfaces[i].address)) {
                console.log(networkInterfaces[i]);
                this._setupTCPServer(networkInterfaces[i].address);
            }
        }
    }.bind(this));
    this._setupUDPDiscovery(this.isIPv4()?"0.0.0.0":"::");
    //this._setupTCPServer(this.multicastAddress);
};
net.Peer2Peer.prototype._setupTCPServer = function (localAddress) {
    sysAPI.sockets.tcpServer.create(function (createInfo) {
        if (sysAPI.runtime.lastError) {
            console.error("Error on TCP Server Socket ("+localAddress+") create(): ", sysAPI.runtime.lastError);
            this._retryTCPSetup(localAddress);
            return;
        }
        this._TCPServerSocketIDs[localAddress] = createInfo.socketId;
        net._onAcceptHandlers[this._TCPServerSocketIDs[localAddress]] = this._onTCPServerAccept.bind(this, localAddress);
        net._onAcceptErrorHandlers[this._TCPServerSocketIDs[localAddress]] = this._onTCPServerAcceptError.bind(this, localAddress);
        sysAPI.sockets.tcpServer.listen(this._TCPServerSocketIDs[localAddress], /*(this.isIPv4()?"0.0.0.0":"::")*/localAddress, this.TCPPort, function (createInfo) {
            if (sysAPI.runtime.lastError) {
                this._cannotListenOnTCP = true;
                this.isDuplicateInstance();
                console.error("Error on TCP Server Socket ("+localAddress+") listen(): ", sysAPI.runtime.lastError);
                this._retryTCPSetup(localAddress);
                return;
            }
            this._setupUDPDiscovery(localAddress);
        }.bind(this));
    }.bind(this));
};
net.Peer2Peer.prototype._setupUDPDiscovery = function (localAddress) {
    sysAPI.sockets.udp.create(function (createInfo) {
        if (sysAPI.runtime.lastError) {
            console.error("Error on UDP Socket ("+localAddress+") create(): ", sysAPI.runtime.lastError);
            return;
        }
        this._UDPSocketIDs[localAddress] = createInfo.socketId;
        net._onUDPReceiveHandlers[this._UDPSocketIDs[localAddress]] = this._onUDPReceive.bind(this, localAddress);
        net._onUDPReceiveErrorHandlers[this._UDPSocketIDs[localAddress]] = this._onUDPReceiveError.bind(this, localAddress);
        sysAPI.sockets.udp.setMulticastLoopbackMode(this._UDPSocketIDs[localAddress], false, function (result) {
            if (sysAPI.runtime.lastError) {
                console.error("Error on UDP Socket ("+localAddress+") setMulticastLoopbackMode(): ", sysAPI.runtime.lastError);
                this._retryUDPSetup(localAddress);
                return;
            }
            sysAPI.sockets.udp.setMulticastTimeToLive(this._UDPSocketIDs[localAddress], net.Peer2Peer.multicastTTL, function (result) {
                if (sysAPI.runtime.lastError) {
                    console.error("Error on UDP Socket ("+localAddress+") setMulticastTimeToLive(): ", sysAPI.runtime.lastError);
                    this._retryUDPSetup(localAddress);
                    return;
                }
                sysAPI.sockets.udp.bind(this._UDPSocketIDs[localAddress], /*(this.isIPv4()?"0.0.0.0":"::")*/localAddress, ((localAddress==(this.isIPv4()?"0.0.0.0":"::"))?this.UDPPort:this.UDPPort+1), function (result) {
                    if (sysAPI.runtime.lastError) {
                        this._cannotBindOnUDP = true;
                        this.isDuplicateInstance();
                        console.error("Error on UDP Socket ("+localAddress+") bind(): ", sysAPI.runtime.lastError);
                        this._retryUDPSetup(localAddress);
                        return;
                    }
                    sysAPI.sockets.udp.joinGroup(this._UDPSocketIDs[localAddress], this.multicastAddress, function (result) {
                        if (sysAPI.runtime.lastError) {
                            console.error("Error on UDP Socket ("+localAddress+") joinGroup(): ", sysAPI.runtime.lastError);
                            this._retryUDPSetup(localAddress);
                            return;
                        }
                        if ((this.isIPv4()?"0.0.0.0":"::")!=localAddress) this._discoveryTimeouts[localAddress] = window.setTimeout(this._discovery.bind(this, localAddress), this._discoveryInterval(1));
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
};

// Discovery Methods
net.Peer2Peer.prototype._discoveryInterval = function (num) {
    var now = Date.now();
    var interval = (now-this._lastDiscoveryIntervalUpdateTime);
    var changeRate = 1-Math.pow(1-this.discoveryIntervalChangeRate, interval/1000);
    if (changeRate<0) changeRate = 0;
    if (1<changeRate) changeRate = 1;
    this._lastDiscoveryInterval = this._lastDiscoveryInterval*(1-changeRate) + Math.sqrt(num)*this.discoveryIntervalFactor*1000*changeRate;
    this._lastDiscoveryIntervalUpdateTime = now;
    console.debug("Discovery Interval:", this._lastDiscoveryInterval, Math.floor(changeRate*100)+":"+Math.floor(100-changeRate*100), interval);
    return this._lastDiscoveryInterval;
}
net.Peer2Peer.prototype._managePeers = function (localAddress) {
    // Manage Peers
    window.clearTimeout(this._discoveryTimeouts[localAddress]);
    var num_thresh = Date.now()-3.2*this._lastDiscoveryInterval;
    var del_thresh = Date.now()-5*60*1000;
    var num = 1;
    for (var k in this.peers) {
        if (num_thresh<this.peers[k].lastSeen) {
            num++;
        } else {
            if (this.peers[k].state!=net.Peer.State.Inactive) {
                this.peers[k].state = net.Peer.State.Inactive;
                console.log("Peer got inactive: ", this.peers[k]);
            }
            if (this.peers[k].lastSeen<del_thresh) {
                console.log("Peer timed out: ", this.peers[k]);
                delete this.peers[k];
            }
        }
    }
    this._discoveryTimeouts[localAddress] = window.setTimeout(this._discovery.bind(this, localAddress), this._discoveryInterval(num));
}

net.Peer2Peer.prototype._discovery = function (localAddress) {
    // Send Discovery message
    this._managePeers(localAddress);
    var bstr = this.peerID+this.execID+this.serviceID;
    sysAPI.sockets.udp.send(this._UDPSocketIDs[localAddress], net.tools.str2buf(bstr), this.multicastAddress, this.UDPPort, function (sendInfo) {
        if (sysAPI.runtime.lastError) {
            console.error("Error on UDP Socket ("+localAddress+") send(): ", sysAPI.runtime.lastError);
            this._retryUDPSetup(localAddress);
            return;
        }
        console.debug("Sent UDP Discovery from "+localAddress+":"+this.UDPPort);
        sysAPI.sockets.udp.send(this._UDPSocketIDs[localAddress], net.tools.str2buf(bstr), this.multicastAddress, this.UDPPort+1, function (sendInfo) {
            if (sysAPI.runtime.lastError) {
                console.error("Error on UDP Socket ("+localAddress+") send(): ", sysAPI.runtime.lastError);
                this._retryUDPSetup(localAddress);
                return;
            }
            console.debug("Sent UDP Discovery from "+localAddress+":"+this.UDPPort);
            console.log("A UDP Discovery Message has been sent on "+localAddress);
        }.bind(this));
    }.bind(this));
}

net.Peer2Peer.prototype._onUDPReceive = function (localAddress, info) {
    console.warn("UDP RECV "+info.remoteAddress+" - "+net.tools.buf2str(info.data));
    var bufView = new Uint8Array(info.data);
    var ids_same = true;
    var localRuntimeID = this.serviceID;
    var remoteRuntimeID = bufView.slice(64);
    for (var i=0; i<remoteRuntimeID.length && ids_same; i++) {
        if (remoteRuntimeID[i]!=localRuntimeID.charCodeAt(i)) ids_same = false;
    }
    if (ids_same) {
        var remotePeerID = "";
        var remoteExecID = "";
        for (var i=0; i<32; i++) remotePeerID += String.fromCharCode(bufView[i]);
        for (var i=32; i<64; i++) remoteExecID += String.fromCharCode(bufView[i]);
        if (remotePeerID!=this.peerID) {
            var p = this.peers[remotePeerID];
            if (!p) {
                p = new net.Peer(this);
                console.log("Peer started: ", p);
            } else if (p.lastExecId!=remoteExecID) {
                console.log("Peer restarted: ", p);
            }
            p.lastIPAddress = info.remoteAddress;
            p.lastSeen = Date.now();
            p.lastExecId = remoteExecID;
            p.state = net.Peer.State.Active;
            this.peers[remotePeerID] = p;
            console.log("A UDP Discovery Message has been received on "+localAddress);
        }
        //console.log(this.peers);
    } else {
        console.warn("UDP RECV INVALID", info);
    }
}
net.Peer2Peer.prototype._onUDPReceiveError = function (localAddress, info) {
    console.log("UDP RECV ERR", info);
}
net.Peer2Peer.prototype._retryInterval = function (history) {
    if (history.length<2) return 1000;
    var averageSecondsBetweenRetries = (history[history.length-1]-history[0])/(history.length-1)/1000;
    if (averageSecondsBetweenRetries<60) return 30000;
    if (averageSecondsBetweenRetries<600) return 5000;
    return 1000;
};
net.Peer2Peer.prototype._retryTCPSetup = function (localAddress) {
    sysAPI.sockets.tcpServer.close(this._TCPServerSocketIDs[localAddress], function () {
        console.debug("TCP Socket ("+localAddress+") closed: ", sysAPI.runtime.lastError);
        if (!this._retryTCPSetupHistory[localAddress]) this._retryTCPSetupHistory[localAddress] = [];
        this._retryTCPSetupHistory[localAddress].push(Date.now());
        while (10<this._retryTCPSetupHistory[localAddress].length) this._retryTCPSetupHistory[localAddress].shift();
        window.setTimeout(this._setupTCPServer.bind(this, localAddress), this._retryInterval(this._retryTCPSetupHistory[localAddress]));
    }.bind(this));
}
net.Peer2Peer.prototype._retryUDPSetup = function (localAddress) {
    window.clearTimeout(this._discoveryTimeouts[localAddress]);
    sysAPI.sockets.udp.close(this._UDPSocketIDs[localAddress], function () {
        console.debug("UDP Socket ("+localAddress+") closed: ", sysAPI.runtime.lastError);
        if (!this._retryUDPSetupHistory[localAddress]) this._retryUDPSetupHistory[localAddress] = [];
        this._retryUDPSetupHistory[localAddress].push(Date.now());
        while (10<this._retryUDPSetupHistory[localAddress].length) this._retryUDPSetupHistory[localAddress].shift();
       window.setTimeout(this._setupUDPDiscovery.bind(this, localAddress), this._retryInterval(this._retryUDPSetupHistory[localAddress]));
    }.bind(this));
}

// TCP Server Methods
net.Peer2Peer.prototype._onTCPServerAccept = function (localAddress, info) {
    net._onTCPReceiveHandlers[info.clientSocketId] = this._onTCPServerReceive.bind(this, localAddress);
    net._onTCPReceiveErrorHandlers[info.clientSocketId] = this._onTCPServerReceiveError.bind(this, localAddress);
    sysAPI.sockets.tcp.setPaused(info.clientSocketId, false, function () {
        if (sysAPI.runtime.lastError) {
            console.error("Error on TCP Server-Client Socket ("+localAddress+") setPaused(): ", sysAPI.runtime.lastError);
            this._retryUDPSetup();
            return;
        }
    }.bind(this));
}
net.Peer2Peer.prototype._onTCPServerAcceptError = function (localAddress, info) {
    console.log("ACCEPT ERR", info);
}
net.Peer2Peer.prototype._onTCPServerReceive = function (localAddress, info) {
    var arr = net.tools.buf2objs(this._TCPServerReceiveBuffer, info.data);
    for (var i=0; i<arr.length; i++) {
        if (this.onTCPReceive[arr[i][0]]) this.onTCPReceive[arr[i][0]](this, arr[i][1]);
        else console.log("TCP Request RECV: ", arr[i]);
    }
}
net.Peer2Peer.prototype._onTCPServerReceiveError = function (localAddress, info) {
    console.log("TCP Request RECV ERR: ", info);
}


// Public Methods
net.Peer2Peer.prototype.isIPv4 = function () {
    return net.tools.isIPv4(this.multicastAddress);
}
net.Peer2Peer.prototype.isDuplicateInstance = function () {
    var tmp = (this._cannotBindOnUDP+this._cannotListenOnTCP==2);
    if (!this._lastIsDuplicateInstance && tmp) this.onIsDuplicateInstance(this);
    this._lastIsDuplicateInstance = tmp;
    return tmp;
}
net.Peer2Peer.prototype.onPeerID = function (callback) {
    if (this.peerID) {
        window.setTimeout(function () {
            callback(this, this.peerID);
        }.bind(this), 1);
    } else {
        this._onPeerID.push(callback);
    }
};
net.Peer2Peer.prototype.sendAll = function (ident, data) {
    for (var k in this.peers) {
        var p = this.peers[k];
        p.send(ident, data);
    }
};
net.Peer2Peer.prototype.close = function () {
    for (var key in this._discoveryTimeouts) {
        window.clearTimeout(this._discoveryTimeouts[key]);
    }
    for (var key in this._UDPSocketIDs) {
        sysAPI.sockets.udp.close(this._UDPSocketIDs[key], function () {
            console.log("UDP Socket closed: ", sysAPI.runtime.lastError);
        });
        this.UDPSocketID = false;
    }
    for (var key in this._TCPServerSocketIDs) {
        sysAPI.sockets.tcpServer.close(this._TCPServerSocketIDs[key], function () {
            console.log("TCP Socket closed: ", sysAPI.runtime.lastError);
        });
        this.TCPServerSocketID = false;
    }
}


net.Peer = function (peer2Peer) {
    this.peer2Peer = peer2Peer;
    this.lastIPAddress = false;
    this.lastSeen = false;
    this.lastExecId = false;
    this.state = net.Peer.State.Uninitialized;
    this.TCPClientSocketID = false;
};

net.Peer.State = { // TODO: maybe include instructions in description?
    Uninitialized: {val:0, description:"This net.Peer is not yet initialized."},
    Active: {val:1, description:"This net.Peer is currently active."},
    Inactive: {val:2, description:"This net.Peer is currently inactive and may be deleted soon."},
};

net.Peer.prototype._onReceive = function (info) {
    console.log(info);
};
net.Peer.prototype._onReceiveError = function (info) {
    console.log(info);
};
net.Peer.prototype.send = function (ident, data, callback) {
    sysAPI.sockets.tcp.create(function (createInfo) {
        if (sysAPI.runtime.lastError) {
            console.error("Error on TCP Client Socket create(): ", sysAPI.runtime.lastError);
            return;
        }
        this.TCPClientSocketID = createInfo.socketId;
        net._onTCPReceiveHandlers[this.TCPClientSocketID] = function (info) {
            console.log("TCP Response RECV: ", info);
        }.bind(this);
        net._onTCPReceiveErrorHandlers[this.TCPClientSocketID] = function (info) {
            console.log("TCP Response RECV ERR: ", info);
        }.bind(this);
        sysAPI.sockets.tcp.connect(this.TCPClientSocketID, this.lastIPAddress, this.peer2Peer.TCPPort, function (result) {
            if (sysAPI.runtime.lastError) {
                console.error("Error on TCP Client Socket connect(): ", sysAPI.runtime.lastError);
                return;
            }
            sysAPI.sockets.tcp.send(this.TCPClientSocketID, net.tools.obj2buf([ident, data]), function (result) {
                if (sysAPI.runtime.lastError) {
                    console.error("Error on TCP Client Socket send(): ", sysAPI.runtime.lastError);
                    return;
                }
                console.log("SENT", this.lastIPAddress+":"+this.peer2Peer.TCPPort, result);
            }.bind(this));
        }.bind(this));
    }.bind(this));
};
