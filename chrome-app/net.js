
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
        return net.tools.str2buf(JSON.stringify(obj));
    },
    buf2str: function (buf) {
        return String.fromCharCode(buf);
    },
    buf2obj: function (buf) {
        return JSON.parse(net.tools.buf2str(buf));
    },
};


net.Peer2Peer = function (serviceId, multicastAddress) {
    this._lastDiscoveryInterval = 1000;
    this.serviceID = serviceId;
    this.multicastAddress = multicastAddress;
    this.peers = {};
    this.discoveryIntervalFactor = 1;
    this.execID = net.tools.generateID(32);
    if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(serviceId+"peerId", function (items) {
            if (items[this.serviceID+"peerId"] && items[this.serviceID+"peerId"].length==32) {
                this.peerID = items[this.serviceID+"peerId"];
            } else {
                this.peerID = net.tools.generateID(32);
                var dict = {};
                dict[serviceId+"peerId"] = this.peerID;
                if (chrome.storage.local) chrome.storage.local.set(dict, function () {
                    console.log("peerID Written");
                });
            }
            this._setup();
        }.bind(this));
    } else {
        this.peerID = net.tools.generateID(32);
        this._setup();
    }
};

net.Peer2Peer.UDPPort = 10578;
net.Peer2Peer.TCPPort = 10577;
net.Peer2Peer.multicastTTL = 15;

net.Peer2Peer.prototype._setup = function () {
    this.TCPServerSocketID = false;
    this.UDPSocketID = false;
    this._setupTCPServer();
};
net.Peer2Peer.prototype._setupTCPServer = function () {
    chrome.sockets.tcpServer.create(function (createInfo) {
        if (chrome.runtime.lastError) {
            console.error("Error on TCP Server Socket create(): ", chrome.runtime.lastError);
            this._retryTCPSetup();
            return;
        }
        this.TCPServerSocketID = createInfo.socketId;
        chrome.sockets.tcpServer.onAccept.addListener(this._onAccept.bind(this));
        chrome.sockets.tcpServer.onAcceptError.addListener(this._onAcceptError.bind(this));
        chrome.sockets.tcpServer.listen(this.TCPServerSocketID, (this.is_IPv4()?"0.0.0.0":"::"), net.Peer2Peer.TCPPort, function (createInfo) {
            if (chrome.runtime.lastError) {
                console.error("Error on TCP Server Socket listen(): ", chrome.runtime.lastError);
                this._retryTCPSetup();
                return;
            }
            console.log("Listening", this);
            this._setupUDPDiscovery();
        }.bind(this));
    }.bind(this));
};
net.Peer2Peer.prototype._setupUDPDiscovery = function () {
    chrome.sockets.udp.create(function (createInfo) {
        if (chrome.runtime.lastError) {
            console.error("Error on UDP Socket create(): ", chrome.runtime.lastError);
            return;
        }
        this.UDPSocketID = createInfo.socketId;
        chrome.sockets.udp.setMulticastTimeToLive(this.UDPSocketID, net.Peer2Peer.multicastTTL, function (result) {
            if (chrome.runtime.lastError) {
                console.error("Error on UDP Socket setMulticastTimeToLive(): ", chrome.runtime.lastError);
                this._retryUDPSetup();
                return;
            }
            console.log(this.is_IPv4());
            chrome.sockets.udp.bind(this.UDPSocketID, (this.is_IPv4()?"0.0.0.0":"::"), net.Peer2Peer.UDPPort, function (result) {
                if (chrome.runtime.lastError) {
                    console.error("Error on UDP Socket bind(): ", chrome.runtime.lastError);
                    this._retryUDPSetup();
                    return;
                }
                chrome.sockets.udp.joinGroup(this.UDPSocketID, this.multicastAddress, function (result) {
                    if (chrome.runtime.lastError) {
                        console.error("Error on UDP Socket joinGroup(): ", chrome.runtime.lastError);
                        this._retryUDPSetup();
                        return;
                    }
                    chrome.sockets.udp.onReceive.addListener(this._onReceive.bind(this));
                    chrome.sockets.udp.onReceiveError.addListener(this._onReceiveError.bind(this));
                    this.bcTimeout = window.setTimeout(this._discovery.bind(this), this._discoveryInterval(1));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
};

net.Peer2Peer.prototype.is_IPv4 = function () {
    return (this.multicastAddress.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/)!=null);
}

// Discovery Methods
net.Peer2Peer.prototype._discoveryInterval = function (num) {
    console.log(num);
    this._lastDiscoveryInterval = num*this.discoveryIntervalFactor*1000;
    return this._lastDiscoveryInterval;
}
net.Peer2Peer.prototype._discovery = function () {
    // Send Discovery message
    var bstr = this.peerID+this.execID+this.serviceID;
    chrome.sockets.udp.send(this.UDPSocketID, net.tools.str2buf(bstr), this.multicastAddress, net.Peer2Peer.UDPPort, function (sendInfo) {
        if (chrome.runtime.lastError) {
            console.error("Error on UDP Socket send(): ", chrome.runtime.lastError);
            this._retryUDPSetup();
            return;
        }
        if (sendInfo.resultCode!=0) {
            console.error("Error on UDP Socket send(): ", sendInfo);
        }
    }.bind(this));

    // Manage Peers
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
    this.bcTimeout = window.setTimeout(this._discovery.bind(this), this._discoveryInterval(num));
}
net.Peer2Peer.prototype._onReceive = function (info) {
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
                p = new net.Peer();
                console.log("Peer started: ", p);
            } else if (p.lastExecId!=remoteExecID) {
                console.log("Peer restarted: ", p);
            }
            p.lastIPAddress = info.remoteAddress;
            p.lastSeen = Date.now();
            p.lastExecId = remoteExecID;
            p.state = net.Peer.State.Active;
            this.peers[remotePeerID] = p;
        }
        console.log(this.peers);
    } else {
        console.warn("RECV INVALID", info);
    }
}
net.Peer2Peer.prototype._onReceiveError = function (info) {
    console.log("RECV ERR", info);
}
net.Peer2Peer.prototype._retryTCPSetup = function () {
    chrome.sockets.tcpServer.close(this.TCPServerSocketID, function () {
        console.log("TCP Socket closed: ", chrome.runtime.lastError);
        window.setTimeout(this._setupTCPServer.bind(this), 1000);
    }.bind(this));
}
net.Peer2Peer.prototype._retryUDPSetup = function () {
    window.clearTimeout(this.bcTimeout);
    chrome.sockets.udp.close(this.UDPSocketID, function () {
        console.log("UDP Socket closed: ", chrome.runtime.lastError);
        window.setTimeout(this._setupUDPDiscovery.bind(this), 1000);
    }.bind(this));
}

// TCP Server Methods
net.Peer2Peer.prototype._onAccept = function (info) {
    console.log("ACCEPT", info);
}
net.Peer2Peer.prototype._onAcceptError = function (info) {
    console.log("ACCEPT ERR", info);
}

// Public Methods
net.Peer2Peer.prototype.sendAll = function (data) {
    for (var k in this.peers) {
        var p = this.peers[k];
        p.send(data);
    }
};
net.Peer2Peer.prototype.close = function () {
    window.clearTimeout(this.bcTimeout);
    if (this.UDPSocketID) {
        chrome.sockets.udp.close(this.UDPSocketID, function () {
            console.log("UDP Socket closed: ", chrome.runtime.lastError);
        });
        this.UDPSocketID = false;
    }
    if (this.TCPServerSocketID) {
        chrome.sockets.tcpServer.close(this.TCPServerSocketID, function () {
            console.log("TCP Socket closed: ", chrome.runtime.lastError);
        });
        this.UDPSocketID = false;
    }
}


net.Peer = function () {
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
net.Peer.prototype.send = function (data, callback) {
    chrome.sockets.tcp.create(function (createInfo) {
        if (chrome.runtime.lastError) {
            console.error("Error on TCP Client Socket create(): ", chrome.runtime.lastError);
            return;
        }
        this.TCPClientSocketID = createInfo.socketId;
        chrome.sockets.tcp.onReceive.addListener(this._onReceive.bind(this));
        chrome.sockets.tcp.onReceiveError.addListener(this._onReceiveError.bind(this));
        chrome.sockets.tcp.connect(this.TCPClientSocketID, this.lastIPAddress, net.Peer2Peer.TCPPort, function (result) {
            if (chrome.runtime.lastError) {
                console.error("Error on TCP Client Socket connect(): ", chrome.runtime.lastError);
                return;
            }
            chrome.sockets.tcp.send(this.TCPClientSocketID, net.tools.str2buf(JSON.stringify(data)), function (result) {
                if (chrome.runtime.lastError) {
                    console.error("Error on TCP Client Socket send(): ", chrome.runtime.lastError);
                    return;
                }
                console.log("SENT", result);
            }.bind(this));
        }.bind(this));
    }.bind(this));
};
