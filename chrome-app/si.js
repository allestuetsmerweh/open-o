
if (si) console.warn("si variable already existed. Overwriting...");

var si = {};


// ###### proto ######

si.proto = {
    // Protocol characters
    STX: 0x02,
    ETX: 0x03,
    ACK: 0x06, // when sent to BSx3..6, causes beep until SI-card taken out
    NAK: 0x15,
    DLE: 0x10,
    WAKEUP: 0xFF,

    // Basic protocol commands, currently unused
    basicCmd: {
        SET_CARDNO: 0x30,
        GET_SI5: 0x31, // read out SI-card 5 data
        SI5_WRITE: 0x43, // 02 43 (block: 0x30 to 0x37) (16 bytes) 03
        SI5_DET: 0x46, // SI-card 5 inserted (46 49) or removed (46 4F)
        TRANS_REC: 0x53, // autosend timestamp (online control)
        TRANS_TIME: 0x54, // autosend timestamp (lightbeam trigger)
        GET_SI6: 0x61, // read out SI-card 6 data
        SI6_DET: 0x66, // SI-card 6 inserted
        SET_MS: 0x70, // \x4D="M"aster, \x53="S"lave
        GET_MS: 0x71,
        SET_SYS_VAL: 0x72,
        GET_SYS_VAL: 0x73,
        GET_BDATA: 0x74, // Note: response carries '\xC4'!
        ERASE_BDATA: 0x75,
        SET_TIME: 0x76,
        GET_TIME: 0x77,
        OFF: 0x78,
        GET_BDATA2: 0x7A, // Note: response carries '\xCA'!
        SET_BAUD: 0x7E, // 0=4800 baud, 1=38400 baud
    },
    basicCmdLookup: function () {
        if (si.proto._basicCmdLookup) return si.proto._basicCmdLookup;
        si.proto._basicCmdLookup = {};
        for (var k in si.proto.basicCmd) si.proto._basicCmdLookup[si.proto.basicCmd[k]] = k;
        return si.proto._basicCmdLookup;
    },

    // Extended protocol commands
    cmd: {
        GET_BACKUP: 0x81,
        SET_SYS_VAL: 0x82,
        GET_SYS_VAL: 0x83,
        SRR_WRITE: 0xA2, // ShortRangeRadio - SysData write
        SRR_READ: 0xA3, // ShortRangeRadio - SysData read
        SRR_QUERY: 0xA6, // ShortRangeRadio - network device query
        SRR_PING: 0xA7, // ShortRangeRadio - heartbeat from linked devices, every 50 seconds
        SRR_ADHOC: 0xA8, // ShortRangeRadio - ad-hoc message, f.ex. from SI-ActiveCard
        GET_SI5: 0xB1, // read out SI-card 5 data
        TRANS_REC: 0xD3, // autosend timestamp (online control)
        CLEAR_CARD: 0xE0, // found on SI-dev-forum: 02 E0 00 E0 00 03 (http://www.sportident.com/en/forum/8/56#59)
        GET_SI6: 0xE1, // read out SI-card 6 data block
        SET_SI6: 0xE2, // write SI-card 6 line (16 bytes)
        SET_SI6: 0xE4, // write SI-card 6 special fields (e.g. start number)
        SI5_DET: 0xE5, // SI-card 5 inserted
        SI6_DET: 0xE6, // SI-card 6 inserted
        SI_REM: 0xE7, // SI-card removed
        SI8_DET: 0xE8, // SI-card 8/9/10/11/p/t inserted
        SET_SI8: 0xEA, // write SI-card 8/9/10/11/p/t data word
        GET_SI8: 0xEF, // read out SI-card 8/9/10/11/p/t data block
        SET_MS: 0xF0, // \x4D="M"aster, \x53="S"lave
        GET_MS: 0xF1,
        ERASE_BDATA: 0xF5,
        SET_TIME: 0xF6,
        GET_TIME: 0xF7,
        OFF: 0xF8,
        SIGNAL: 0xF9, // 02 F9 (number of signals) (CRC16) 03
        SET_BAUD: 0xFE, // \x00=4800 baud, \x01=38400 baud
    },
    cmdLookup: function () {
        if (si.proto._cmdLookup) return si.proto._cmdLookup;
        si.proto._cmdLookup = {};
        for (var k in si.proto.cmd) si.proto._cmdLookup[si.proto.cmd[k]] = k;
        return si.proto._cmdLookup;
    },

    // Protocol Parameters
    P_MS_DIRECT: 0x4D, // "M"aster
    P_MS_INDIRECT: 0x53, // "S"lave
    P_SI6_CB: 0x08,

    // offsets in system data
    // currently only O_MODE, O_STATION_CODE and O_PROTO are used
    sysDataOffset: {
        OLD_SERIAL: 0x00, // 2 bytes - only up to BSx6, numbers < 65.536
        OLD_CPU_ID: 0x02, // 2 bytes - only up to BSx6, numbers < 65.536
        SERIAL_NO: 0x00, // 4 bytes - only after BSx7, numbers > 70.000 (if byte 0x00 > 0, better use OLD offsets)
        FIRMWARE: 0x05, // 3 bytes
        BUILD_DATE: 0x08, // 3 bytes - YYMMDD
        MODEL_ID: 0x0B, // 2 bytes:
                                //   8003: BSF3 (serial numbers > 1.000)
                                //   8004: BSF4 (serial numbers > 10.000)
                                //   8084: BSM4-RS232
                                //   8086: BSM6-RS232 / BSM6-USB
                                //   8146: BSF6 (serial numbers > 30.000)
                                //   8115: BSF5 (serial numbers > 50.000)
                                //   8117 / 8118: BSF7 / BSF8 (serial no. 70.000...70.521, 72.002...72.009)
                                //   8187 / 8188: BS7-SI-Master / BS8-SI-Master
                                //   8197: BSF7 (serial numbers > 71.000, apart from 72.002...72.009)
                                //   8198: BSF8 (serial numbers > 80.000)
                                //   9197 / 9198: BSM7-RS232, BSM7-USB / BSM8-USB, BSM8-SRR
                                //   9199: unknown
                                //   9597: BS7-S
                                //   B197 / B198: BS7-P / BS8-P
                                //   B897: BS7-GSM
        MEM_SIZE: 0x0D, // 1 byte - in KB
        REFRESH_RATE: 0x10, // 1 byte - in 3/sec
        POWER_MODE: 0x11, // 1 byte - 06 low power, 08 standard/sprint

        BAT_DATE: 0x15, // 3 bytes - YYMMDD
        BAT_CAP: 0x19, // 2 bytes - battery capacity in mAh (as multiples of 14.0625?!)
        BACKUP_PTR: 0x1C, // 4 bytes - at positions 1C,1D,21,22
        SI6_CB: 0x33, // 1 byte - bitfield defining which SI Card 6 blocks to read: \x00=\xC1=read block0,6,7; \x08=\xFF=read all 8 blocks
        BAT_STATE: 0x34, // 4 bytes - for battery state: 2000mAh: 000000=0%, 6E0000=100%, 1000mAh:000000=0%, 370000=100%
        MEM_OVERFLOW: 0x3D, // 1 byte - memory overflow if != 0x00

        INTERVAL: 0x48, // 2 bytes - in 32*ms
        WTF: 0x4A, // 2 bytes - in 32*ms

        PROGRAM: 0x70, // 1 byte - station program: xx0xxxxxb competition, xx1xxxxxb training
        MODE: 0x71, // 1 byte - see SI station modes below
        STATION_CODE: 0x72, // 1 byte
        PROTO: 0x74, // 1 byte - protocol configuration, bit mask value:
                                //   xxxxxxx1b extended protocol
                                //   xxxxxx1xb auto send out
                                //   xxxxx1xxb handshake (only valid for card readout)
                                //   xxxx1xxxb sprint 4ms (only for Start&Finish modes)
                                //   xxx1xxxxb access with password only
                                //   xx1xxxxxb stop, if backup is full (only for Readout mode)
                                //   1xxxxxxxb read out SI-card after punch (only for punch modes;
                                //             depends on bit 2: auto send out or handshake)
        LAST_WRITE_DATE: 0x75, // 3 bytes - YYMMDD
        LAST_WRITE_TIME: 0x78, // 3 bytes - 1 byte day (see below), 2 bytes seconds after midnight/midday
        SLEEP_TIME: 0x7B, // 3 bytes - 1 byte day (see below), 2 bytes seconds after midnight/midday
                                //   xxxxxxx0b - seconds relative to midnight/midday: 0 = am, 1 = pm
                                //   xxxx000xb - day of week: 000 = Sunday, 110 = Saturday
                                //   xx00xxxxb - week counter 0..3, relative to programming date
        WORKING_TIME: 0x7E, // 2 bytes - big endian number = minutes
    },

    // SI station modes
    M_CONTROL: 0x02,
    M_START: 0x03,
    M_FINISH: 0x04,
    M_READ_SICARDS: 0x05,
    M_CLEAR: 0x07,
    M_CHECK: 0x0A,
    M_PRINTOUT: 0x0B,

    // Weekday encoding (only for reference, currently unused)
    D_SUNDAY: parseInt('000', 2),
    D_MONDAY: parseInt('001', 2),
    D_TUESDAY: parseInt('010', 2),
    D_WEDNESDAY: parseInt('011', 2),
    D_THURSDAY: parseInt('100', 2),
    D_FRIDAY: parseInt('101', 2),
    D_SATURDAY: parseInt('110', 2),

    // Backup memory record length
    REC_LEN: 8, // Only in extended protocol, otherwise 6!

    // punch trigger in control mode data structure
    T_OFFSET: 8,
    T_CN: 0,
    T_TIME: 5,

    // backup memory in control mode
    BC_CN: 3,
    BC_TIME: 8,
};


// ###### tools ######

si.tools = {
    arr2big: function (arr) {
        var outnum = 0;
        for (var i=0; i<arr.length; i++) outnum += arr[i]*Math.pow(0x100, arr.length-i-1);
        return outnum;
    },
    arr2time: function (arr) {
        if (arr.length==2) {
            if (arr[0]==0xEE && arr[1]==0xEE) return -1;
            return si.tools.arr2big(arr);
        } else {
            console.warn("arr2time: length must be 2, but is "+arr.length);
            return -2;
        }
    },
    arr2date: function (arr) {
        if (arr.length==7 || arr.length==6) {
            var secs = si.tools.arr2big(arr.slice(4, 6));
            return new Date(arr[0]+2000, arr[1]-1, arr[2], (arr[3]&0x01)*12 + Math.floor(secs/3600), Math.floor((secs%3600)/60), secs%60, (arr.length==7?arr[6]*1000/256:0));
        } else if (arr.length==3) {
            return new Date(2000+arr[0], arr[1]-1, arr[2]);
        } else {
            console.warn("arr2date: length must be 3, 6 or 7, but is "+arr.length);
            return new Date(1970, 1, 1);
        }
    },
    arr2cardNumber: function (arr) {
        if (arr.length==4 || arr.length==3) {
        	var cardnum = (arr[1]<<8);
        	cardnum |= arr[0];
            var fourthSet = (arr.length==4 && arr[3]!=0x00);
        	if (!fourthSet && 1<arr[2] && arr[2]<5) {
                cardnum += (arr[2]*100000);
            } else if (fourthSet || 4<arr[2]) {
                cardnum += (arr[2]<<16);
            }
            if (3<arr.length) cardnum |= (arr[3]<<24);
        	return cardnum;
        } else {
            console.warn("arr2cardNumber: length must be 3 or 4, but is "+arr.length);
            return -1;
        }
    },
    prettyHex: function (str) {
        var outstr = "";
        if (typeof str === 'string') {
            for (var i=0; i<str.length; i++) outstr += ("00"+str.charCodeAt(i).toString(16)).slice(-2)+" ";
        } else {
            for (var i=0; i<str.length; i++) outstr += ("00"+str[i].toString(16)).slice(-2)+" ";
        }
        return outstr;
    },
    CRC16: function (s) {
        var CRC_POLYNOM = 0x8005;
        var CRC_BITF = 0x8000;
        if (s.length<3) return [(1<=s.length?s[0]:0x00), (2<=s.length?s[1]:0x00)];
        if (s.length%2==0) s = s.concat([0x00, 0x00]);
        else s = s.concat([0x00]);
        var crc = s[0]*0x100+s[1];
        for (var i=2; i<s.length; i+=2) {
            var c = s.slice(i, i+2);
            var val = c[0]*0x100+c[1];
            for (var j=0; j<16; j++) {
                if ((crc & CRC_BITF) != 0) {
                    crc = (crc << 1);
                    if ((val & CRC_BITF) != 0) crc += 1;
                    crc = (crc ^ CRC_POLYNOM);
                } else {
                    crc = (crc << 1);
                    if ((val & CRC_BITF) != 0) crc += 1;
                }
                val = (val << 1);
            }
            crc = (crc & 0xFFFF);
        }
        return [(crc >> 8), (crc & 0xFF)];
    },
};


// ###### Station ######

si.Station = function (mainStation) {
    console.log("STATION", mainStation);
    this.mainStation = mainStation;
    this._info = {};
    this._infoTime = 0;
    this._infoSubscribers = [];
};

si.Station.Mode = {
    SIACSpecialFunction1: {val: 0x01},
    Control: {val: 0x02},
    Start: {val: 0x03},
    Finish: {val: 0x04},
    Readout: {val: 0x05},
    Clear: {val: 0x07},
    Check: {val: 0x0A},
    Print: {val: 0x0B},
    StartWithTimeTrigger: {val: 0x0C},
    FinishWithTimeTrigger: {val: 0x0D},
    BCControl: {val: 0x12},
    BCStart: {val: 0x13},
    BCFinish: {val: 0x14},
    BCSlave: {val: 0x1F},
};
si.Station.modeLookup = function () {
    if (si.Station._modeLookup) return si.Station._modeLookup;
    si.Station._modeLookup = {};
    for (var k in si.Station.Mode) si.Station._modeLookup[si.Station.Mode[k].val] = k;
    return si.Station._modeLookup;
};
si.Station.Type = { // TODO: meaningful val-s
    Main: {val: 0x00},
    Sprint: {val: 0x01},
    Print: {val: 0x02},
    Field: {val: 0x03},
    Master: {val: 0x04},
};
si.Station.typeLookup = function () {
    if (si.Station._typeLookup) return si.Station._typeLookup;
    si.Station._typeLookup = {};
    for (var k in si.Station.Type) si.Station._typeLookup[si.Station.Type[k].val] = k;
    return si.Station._typeLookup;
};
si.Station.Model = {
    BSF3: {vals:[0x8003], description:"BSF3", type:si.Station.Type.Field, series:3},
    BSF4: {vals:[0x8004], description:"BSF4", type:si.Station.Type.Field, series:4},
    BSF5: {vals:[0x8115], description:"BSF5", type:si.Station.Type.Field, series:5},
    BSF6: {vals:[0x8146], description:"BSF6", type:si.Station.Type.Field, series:6},
    BSF7: {vals:[0x8117, 0x8197], description:"BSF7", type:si.Station.Type.Field, series:7},
    BSF8: {vals:[0x8118, 0x8198], description:"BSF8", type:si.Station.Type.Field, series:8},
    BS7Master: {vals:[0x8187], description:"BS7-Master", type:si.Station.Type.Master, series:7},
    BS8Master: {vals:[0x8188], description:"BS8-Master", type:si.Station.Type.Master, series:8},
    BSM4: {vals:[0x8084], description:"BSM4", type:si.Station.Type.Main, series:4},
    BSM6: {vals:[0x8086], description:"BSM6", type:si.Station.Type.Main, series:6},
    BSM7: {vals:[0x9197], description:"BSM7", type:si.Station.Type.Main, series:7},
    BSM8: {vals:[0x9198], description:"BSM8", type:si.Station.Type.Main, series:8},
    BS7S: {vals:[0x9597], description:"BS7-S", type:si.Station.Type.Sprint, series:7},
    BS7P: {vals:[0xB197], description:"BS7-P", type:si.Station.Type.Print, series:7},
    BS7GSM: {vals:[0xB897], description:"BS7-GSM", type:si.Station.Type.Field, series:7},
    BS8P: {vals:[0xB198], description:"BS8-P", type:si.Station.Type.Print, series:8},
};
si.Station.modelLookup = function () {
    if (si.Station._modelLookup) return si.Station._modelLookup;
    si.Station._modelLookup = {};
    for (var k in si.Station.Model) for (var j=0; j<si.Station.Model[k].vals.length; j++) si.Station._modelLookup[si.Station.Model[k].vals[j]] = k;
    return si.Station._modelLookup;
};

si.Station.prototype.readInfo = function (onSuccess, onError, force) {
    var now = new Date().getTime();
    if (!force && now<this._infoTime+60000) {
        if (onSuccess) onSuccess(this._info);
        return;
    }
    if (!force && 0<this._infoSubscribers.length) {
        this._infoSubscribers.push({onSuccess:onSuccess, onError:onError});
        return;
    }
    this._infoSubscribers.push({onSuccess:onSuccess, onError:onError});
    this.mainStation._sendCommand(si.proto.cmd.GET_SYS_VAL, [0x00, 0x80], 1, (function (st) {return function (data) {
        data = data[0];
        data.splice(0, 3);
        st._infoTime = new Date().getTime();
        st._info = {};
        st._info._raw = data;
        st._info.serialNumber = si.tools.arr2big(data.slice(0x00, 0x04));
        st._info.firmwareVersion = si.tools.arr2big(data.slice(0x05, 0x08));
        st._info.buildDate = si.tools.arr2date(data.slice(0x08, 0x0B));
        st._info.deviceModel = si.Station.modelLookup()[si.tools.arr2big(data.slice(0x0B, 0x0D))];
        st._info.memorySize = si.tools.arr2big(data.slice(0x0D, 0x0E));
        st._info.refreshRate = data[0x10]; // in 3/sec
        st._info.powerMode = data[0x11]; // 06 low power, 08 standard/sprint
        st._info.batteryDate = si.tools.arr2date(data.slice(0x15, 0x18));
        st._info.batteryCapacity = si.tools.arr2big(data.slice(0x19, 0x1B));
        st._info.backupPointer = si.tools.arr2big(data.slice(0x1C, 0x1E).concat(data.slice(0x21, 0x23)));
        st._info.siCard6Mode = si.tools.arr2big(data.slice(0x33, 0x34));
        st._info.memoryOverflow = si.tools.arr2big(data.slice(0x3D, 0x3E));
        st._info.interval = si.tools.arr2big(data.slice(0x48, 0x4A));
        st._info.wtf = si.tools.arr2big(data.slice(0x4A, 0x4C));
        st._info.program = data[0x70];
        st._info.mode = si.Station.modeLookup()[data[0x71]];
        st._info.code = data[0x72] + ((data[0x73] & 0xC0) << 2);
        st._info.beeps = ((data[0x73] >> 2) & 0x01);
        st._info.flashes = (data[0x73] & 0x01);
        st._info.extendedProtocol = (data[0x74] & 0x01);
        st._info.autoSend = ((data[0x74] >> 1) & 0x01);
        st._info.handshake = ((data[0x74] >> 2) & 0x01);
        st._info.sprint4ms = ((data[0x74] >> 3) & 0x01);
        st._info.passwordOnly = ((data[0x74] >> 4) & 0x01);
        st._info.stopOnFullBackup = ((data[0x74] >> 5) & 0x01);
        st._info.autoReadout = ((data[0x74] >> 7) & 0x01);
        st._info.lastWriteDate = si.tools.arr2date(data.slice(0x75, 0x7B));
        //st._info.autoOffTimeout = si.tools.arr2date([0, 1, 1].concat(data.slice(0x7B, 0x7E)));
        st._info.autoOffTimeout = si.tools.arr2big(data.slice(0x7E, 0x80));
        for (var i=0; i<this._infoSubscribers.length; i++) {
            window.setTimeout((function (fn) {return function () {
                if (fn) fn(st._info);
            };})(this._infoSubscribers[i].onSuccess), 1);
        }
        this._infoSubscribers = [];
        console.log("INFO READ", st._info);
    };})(this), (function (st) {return function (err) {
        for (var i=0; i<this._infoSubscribers.length; i++) {
            try {
                window.setTimeout((function (fn) {return function () {
                    if (fn) fn(st._info);
                };})(this._infoSubscribers[i].onError), 1);
            } catch (err) {}
        }
        this._infoSubscribers = [];
    };})(this));
};
si.Station.prototype.getTime = function (onSuccess, onError) {
    this.mainStation._sendCommand(si.proto.cmd.GET_TIME, [], 1, (function (st) {return function (data) {
        data = data[0];
        data.splice(0, 2);
        if (onSuccess) onSuccess(si.tools.arr2date(data));
    };})(this), onError);
};
si.Station.prototype.setTime = function (dat, onSuccess, onError) { // TODO: compensate for waiting time
    var secs = (dat.getHours() % 12) * 3600 + dat.getMinutes() * 60 + dat.getSeconds();
    var params = [dat.getFullYear() % 100, dat.getMonth() + 1, dat.getDate(), (dat.getDay() << 1) + Math.floor(dat.getHours() / 12), secs >> 8, secs & 0xFF, Math.floor(dat.getMilliseconds()*256/1000)];
    this.mainStation._sendCommand(si.proto.cmd.SET_TIME, params, 1, (function (st) {return function (data) {
        data = data[0];
        data.splice(0, 2);
        if (onSuccess) onSuccess(si.tools.arr2date(data));
    };})(this), onError);
};
si.Station.prototype.signal = function (count, onSuccess, onError) {
    if (!count || count<1) count = 1;
    this.mainStation._sendCommand(si.proto.cmd.SIGNAL, [count], 1, (function (count) {return function (data) {
        if (data[0][2]==count) {
            if (onSuccess) onSuccess();
        } else {
            if (onError) onError();
        }
    };})(count), onError);
};
si.Station.prototype.powerOff = function (onSuccess, onError) { // Does not power off BSM8 (USB powered), though
    this.mainStation._sendCommand(si.proto.cmd.OFF, [], 0, onSuccess, onError);
};

var genericInfoGetter = function (property) {
    return function (onSuccess, onError) {
        this.readInfo(function (info) {
            if (onSuccess) onSuccess(info[property]);
        }, onError, false);
    };
};
var genericInfoSetter = function (property, paramsFunc) {
    return function (newValue, onSuccess, onError) {
        this.readInfo((function (st) {return function (info) {
            var params = paramsFunc(st, newValue);
            if (!params) {
                if (onError) onError("INVALID_PARAM");
                return;
            }
            st.mainStation._sendCommand(si.proto.cmd.SET_SYS_VAL, params, 1, (function (params) {return function (data) {
                data = data[0];
                data.splice(0, 2);
                if (data[0]!=params[0]) {
                    if (onError) onError("SET_CODE_RESP_ERR");
                    return;
                }
                st.readInfo(function (info) {
                    if (onSuccess) onSuccess(info[property]);
                }, onError, true);
            };})(params), onError);
        };})(this), onError, false);
    };
};
// TODO: program (0x70)
si.Station.prototype.getCode = genericInfoGetter("code");
si.Station.prototype.setCode = genericInfoSetter("code", function (st, newCode) {
    return [0x72, newCode&0xFF, ((newCode&0x0300)>>2) + (st._info._raw[0x73]&0x3F)];
});
si.Station.prototype.getMode = genericInfoGetter("mode");
si.Station.prototype.setMode = genericInfoSetter("mode", function (st, newMode) {
    var modeLookup = si.Station.modeLookup();
    console.log(modeLookup, newMode);
    if (modeLookup[newMode]==undefined) return false;
    return [0x71, newMode];
});
si.Station.prototype.getBeeps = genericInfoGetter("beeps");
si.Station.prototype.setBeeps = genericInfoSetter("beeps", function (st, newBeeps) {
    return [0x73, (newBeeps?0x04:0x00) + (st._info._raw[0x73] & 0xFB)];
});
si.Station.prototype.getFlashes = genericInfoGetter("flashes");
si.Station.prototype.setFlashes = genericInfoSetter("flashes", function (st, newFlashes) {
    return [0x73, (newFlashes?0x01:0x00) + (st._info._raw[0x73] & 0xFE)];
});
si.Station.prototype.getAutoSend = genericInfoGetter("autoSend");
si.Station.prototype.setAutoSend = genericInfoSetter("autoSend", function (st, newFlashes) {
    return [0x74, (newFlashes?0x02:0x00) + (st._info._raw[0x74] & 0xFD)];
});
si.Station.prototype.getExtendedProtocol = genericInfoGetter("extendedProtocol");
si.Station.prototype.setExtendedProtocol = genericInfoSetter("extendedProtocol", function (st, newFlashes) {
    return [0x74, (newFlashes?0x01:0x00) + (st._info._raw[0x74] & 0xFE)];
});
si.Station.prototype.getSerialNumber = genericInfoGetter("serialNumber");
si.Station.prototype.getFirmwareVersion = genericInfoGetter("firmwareVersion");
si.Station.prototype.getBuildDate = genericInfoGetter("buildDate");
si.Station.prototype.getDeviceModel = genericInfoGetter("deviceModel");
si.Station.prototype.getMemorySize = genericInfoGetter("memorySize");
si.Station.prototype.getBatteryDate = genericInfoGetter("batteryDate");
si.Station.prototype.getBatteryCapacity = genericInfoGetter("batteryCapacity");
si.Station.prototype.getBackupPointer = genericInfoGetter("backupPointer");
si.Station.prototype.getSICard6Mode = genericInfoGetter("siCard6Mode");
si.Station.prototype.getMemoryOverflow = genericInfoGetter("memoryOverflow");
si.Station.prototype.getLastWriteDate = genericInfoGetter("lastWriteDate");
si.Station.prototype.getAutoOffTimeout = genericInfoGetter("autoOffTimeout");


// ###### MainStation ######

si.MainStation = function (device) {
    si.Station.call(this, this);
    this.device = device;
    this.card = false;
    this.onCardInserted = false;
    this.onCard = false;
    this.onCardRemoved = false;
    this._resetSendCommandResp();
    this._respBuffer = [];
    this.state = si.MainStation.State.Uninitialized;
    if (!si.MainStation.allByDevice[device]) si.MainStation.allByDevice[device] = this;
    this._setup();
};

si.MainStation.State = { // TODO: maybe include instructions in description?
    Uninitialized: {val:0, description:"This si.MainStation is not yet initialized. Commands can neither be received nor sent yet."},
    Ready: {val:1, description:"This si.MainStation is initialized and ready. Commands can be received and sent."},
};

si.MainStation.allByDevice = {};
si.MainStation.all = function () {
    var arr = [];
    for (var device in si.MainStation.allByDevice) {
        arr.push(si.MainStation.allByDevice[device]);
    }
    return arr;
};
si.MainStation._detectDevicesUsingChromeApp = function () {
    chrome.serial.getDevices(function(ports) {
        ports.forEach(function (port) {
            var is_si = (port.path.substr(0, 23)=="/dev/tty.SLAB_USBtoUART");
            is_si = is_si || (port.path.substr(0, 11)=="/dev/ttyUSB");
            if (is_si && !si.MainStation.allByDevice[port.path]) new si.MainStation(port.path);
        });
    });
};
/*
si.MainStation._detectDevicesUsingLocalhost = function () {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:1366/devices", true);
    xhr.onReadyStateChange = (function (si, xhr) {return function (e) {
        if (xhr.readyState==4) {
            if (xhr.status==200) {
                var devs = JSON.parse(xhr.responseText);
                for (var i=0; i<devs.length; i++) {
                    if (!si.MainStation.allByDevice[devs[i]]) new si.MainStation(devs[i]);
                }
            } else {
            }
        }
    };})(si, xhr);
    xhr.send();
};
chrome.usb.getDevices({"vendorId":4292, "productId":32778}, function(devices) {
    console.log("USB", devices);
    if (chrome.runtime.lastError != undefined) {
        console.warn("chrome.usb.getDevices error: "+chrome.runtime.lastError.message);
        return;
    }
    for (var device of devices) {
        console.log(device);
    }
});
*/
si.MainStation._startDeviceDetectionUsingChromeApp = function () {
    var fn = function () {
        si.MainStation._detectDevicesUsingChromeApp();
        if (si.MainStation.detectionTimeout) window.clearTimeout(si.MainStation.detectionTimeout);
        si.MainStation.detectionTimeout = window.setTimeout(arguments.callee, 1000);
    };
    fn();
};
/*
si.MainStation._startDeviceDetectionUsingLocalhost = function () {
    if (!si.MainStation._detectionSock || 1<si.MainStation._detectionSock.readyState) {
        si.MainStation._detectionSock = new WebSocket("ws://localhost:1366/devices", "OpenOSportIdent");
        si.MainStation._detectionSock.onopen = function (e) {
            si.MainStation._detectDevicesUsingLocalhost();
        };
        si.MainStation._detectionSock.onmessage = function (e) {
            if (e.data=="A" || e.data=="R") {
                si.MainStation._detectDevicesUsingLocalhost();
            }
        };
        si.MainStation._detectionSock.onclose = function (e) {
            si.MainStation._detectionSock = false;
            if (si.MainStation.detectionTimeout) window.clearTimeout(si.MainStation.detectionTimeout);
            si.MainStation.detectionTimeout = window.setTimeout(si.MainStation._keepDeviceDetectionUsingLocalhost, 1000);
        };
    }
    if (!si.MainStation.detectionTimeout) {
        si.MainStation.detectionTimeout = window.setTimeout(si.MainStation._keepDeviceDetectionUsingLocalhost, 1000);
    }
};
si.MainStation._keepDeviceDetectionUsingLocalhost = function () {
    if (si.MainStation.detectionTimeout) window.clearTimeout(si.MainStation.detectionTimeout);
    if (si.MainStation._detectionSock && si.MainStation._detectionSock.readyState==1) {
        try {
            si.MainStation._detectionSock.send("K");
        } catch (err) {}
        si.MainStation.detectionTimeout = window.setTimeout(si.MainStation._keepDeviceDetectionUsingLocalhost, 10000);
    } else {
        si.MainStation.startDeviceDetection();
        si.MainStation.detectionTimeout = window.setTimeout(si.MainStation._keepDeviceDetectionUsingLocalhost, 1000);
    }
};
*/
si.MainStation.startDeviceDetection = function () {
    try {
        si.MainStation._startDeviceDetectionUsingChromeApp();
    } catch (err) {
        console.error("Could not start device detection", err);
    }
};
si.MainStation.onAdded = function (ms) {};
si.MainStation.onRemoved = function (ms) {};

si.MainStation.prototype = si.Station.prototype;
si.MainStation.prototype.onRemoved = function () {};
si.MainStation.prototype._setup = function () {
    try {
        chrome.serial.connect(this.device, {name:"OpenO"/* TODO: make variable */, bitrate:38400}, (function (ms) {return function (info) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                window.setTimeout(ms._setup.bind(ms), 1000);
                return;
            }
            ms._chromeAppConnID = info.connectionId;
            chrome.serial.onReceive.addListener(function (e) {
                if (e.connectionId!=ms._chromeAppConnID) return;
                var bufView = new Uint8Array(e.data);
                console.debug("<=", si.tools.prettyHex(bufView));
                for (var i=0; i<bufView.length; i++) ms._respBuffer.push(bufView[i]);
                ms._processRespBuffer();
            });
            chrome.serial.onReceiveError.addListener(function (e) {
                if (e.connectionId!=ms._chromeAppConnID) return;
                chrome.serial.disconnect(ms._chromeAppConnID, function (info) {
                    delete si.MainStation.allByDevice[ms.device];
                    try {
                        si.MainStation.onRemoved(ms);
                    } catch (err) {}
                    try {
                        ms.onRemoved()
                    } catch (err) {}
                });
            });
            ms._sendCommand(si.proto.cmd.GET_MS, [0x00], 1, function () {
                ms.state = si.MainStation.State.Ready;
                try {
                    si.MainStation.onAdded(ms);
                } catch (err) {}
            });
        };})(this));
    } catch (err) {
        console.error("Could not connect to serial port \""+this.device+"\"");
        window.setTimeout(this._setup.bind(this), 1000);
    }
    /*
    this._localhostSock = new WebSocket("ws://localhost:1366/devices/"+device, "OpenOSportIdent");
    this._localhostSock.onmessage = (function (ms) {return function (e) {
        var resp_str = window.atob(e.data);
        console.debug("<=", si.tools.prettyHex(resp_str));
        for (var i=0; i<resp_str.length; i++) ms._respBuffer.push(resp_str.charCodeAt(i));
        ms._processRespBuffer();
    };})(this);
    this._localhostSock.onopen = (function (ms) {return function (e) {
        ms._sendCommand(si.proto.cmd.GET_MS, [0x00], 1, function () {
            if (!si.MainStation.allByDevice[ms.device]) si.MainStation.allByDevice[ms.device] = ms;
            try {
                si.MainStation.onAdded(ms);
            } catch (err) {}
        });
    };})(this);
    this._localhostSock.onclose = (function (ms) {return function (e) {
        delete si.MainStation.allByDevice[ms.device];
        try {
            si.MainStation.onRemoved(ms);
        } catch (err) {}
        try {
            ms.onRemoved()
        } catch (err) {}
    };})(this);
    */
};
si.MainStation.prototype._processRespBuffer = function () {
    while (0<this._respBuffer.length) {
        if (this._respBuffer[0]==si.proto.ACK) {
            this._respBuffer.splice(0, 1);
        } else if (this._respBuffer[0]==si.proto.NAK) {
            this._respBuffer.splice(0, 1);
            if (this._send_command_cmd_resp) {
                if (this._send_command_timer_resp) window.clearTimeout(this._send_command_timer_resp);
                this._send_command_onError_resp("NAK");
                this._resetSendCommandResp();
            }
        } else if (this._respBuffer[0]==si.proto.WAKEUP) {
            this._respBuffer.splice(0, 1);
        } else if (this._respBuffer[0]==si.proto.STX) {
            if (this._respBuffer.length<6) break;
            var command = this._respBuffer[1];
            var len = this._respBuffer[2];
            if (this._respBuffer.length<6+len) break;
            if (this._respBuffer[5+len]!=si.proto.ETX) {
                console.warn("Invalid end byte. Flushing buffer.");
                this._respBuffer = [];
                break;
            }
            var parameters = this._respBuffer.slice(3, 3+len);
            var crcContent = si.tools.CRC16(this._respBuffer.slice(1, 3+len));
            var crc = this._respBuffer.slice(3+len, 5+len);
            this._respBuffer.splice(0, 6+len);
            if (crc[0]==crcContent[0] && crc[1]==crcContent[1]) {
                console.debug("Valid Command received.  CMD:0x"+si.tools.prettyHex([command])+" LEN:"+len+"  PARAMS:"+si.tools.prettyHex(parameters)+" CRC:"+si.tools.prettyHex(crc)+" Content-CRC:"+si.tools.prettyHex(crcContent));
                if (command==si.proto.cmd.SI5_DET) {
                    var cn = si.tools.arr2big([parameters[3], parameters[4], parameters[5]]);
                    if (499999<cn) console.warn("card5 Error: SI Card Number inconsistency: SI5 detected, but number is "+nr+" (not in 0 - 500'000)");
                    if (parameters[3]<2) cn = si.tools.arr2big([parameters[4], parameters[5]]);
                    else cn = parameters[3]*100000+si.tools.arr2big([parameters[4], parameters[5]]);
                    this.card = new si.Card(this, cn);
                    console.log("SI5 DET", this.card, parameters);
                    window.setTimeout((function (ms, card) {return function () {
                        if (ms.onCardInserted) ms.onCardInserted(card);
                    };})(this, this.card), 1);
                    this.card.read((function (ms) {return function (card) {
                        window.setTimeout(function () {
                            if (ms.onCard) ms.onCard(card);
                        }, 1);
                    };})(this));
                } else if (command==si.proto.cmd.SI6_DET) {
                    var cn = si.tools.arr2big([parameters[3], parameters[4], parameters[5]]);
                    var typeFromCN = si.Card.typeByCardNumber(cn);
                    if (typeFromCN!="SICard6") console.warn("SICard6 Error: SI Card Number inconsistency: Function SI6 called, but number is "+cn+" (=> "+typeFromCN+")");
                    this.card = new si.Card(this, cn);
                    console.log("SI6 DET", parameters);
                    window.setTimeout((function (ms, card) {return function () {
                        if (ms.onCardInserted) ms.onCardInserted(card);
                    };})(this, this.card), 1);
                    this.card.read((function (ms) {return function (card) {
                        window.setTimeout(function () {
                            if (ms.onCard) ms.onCard(card);
                        }, 1);
                    };})(this));
                } else if (command==si.proto.cmd.SI8_DET) {
                    var cn = si.tools.arr2big([parameters[3], parameters[4], parameters[5]]);
                    var typeFromCN = si.Card.typeByCardNumber(cn);
                    if (!{"SICard8":1, "SICard9":1, "SICard10":1, "SICard11":1}[typeFromCN]) console.warn("SICard8 Error: SI Card Number inconsistency: Function SI8 called, but number is "+cn+" (=> "+typeFromCN+")");
                    this.card = new si.Card(this, cn);
                    console.log("SI8 DET", parameters);
                    window.setTimeout((function (ms, card) {return function () {
                        if (ms.onCardInserted) ms.onCardInserted(card);
                    };})(this, this.card), 1);
                    this.card.read((function (ms) {return function (card) {
                        window.setTimeout(function () {
                            if (ms.onCard) ms.onCard(card);
                        }, 1);
                    };})(this));
                } else if (command==si.proto.cmd.SI_REM) {
                    console.log("SI REM", parameters);
                    window.setTimeout((function (ms, card) {return function () {
                        if (ms.onCardRemoved) ms.onCardRemoved(card);
                    };})(this, this.card), 1);
                    this.card = false;
                } else if (command==si.proto.cmd.TRANS_REC) {
                    var cn = si.tools.arr2big([parameters[3], parameters[4], parameters[5]]);
                    if (cn<500000) {
                        if (parameters[3]<2) cn = si.tools.arr2big([parameters[4], parameters[5]]);
                        else cn = parameters[3]*100000+si.tools.arr2big([parameters[4], parameters[5]]);
                    }
                    this.card = new si.Card(this, cn);
                    console.log("TRANS_REC", this.card, parameters);
                    window.setTimeout((function (ms, card) {return function () {
                        if (ms.onCardInserted) ms.onCardInserted(card);
                    };})(this, this.card), 1);
                    window.setTimeout((function (ms, card) {return function () {
                        if (ms.onCardRemoved) ms.onCardRemoved(card);
                    };})(this, this.card), 1);
                    this.card = false;
                }
                if (this._send_command_cmd_resp==command) {
                    this._send_command_buf_resp.push(parameters);
                    if (this._send_command_buf_resp.length==this._send_command_num_resp) { // TODO: some kind of onProgress, or just call onSuccess with incomplete buf?
                        if (this._send_command_timer_resp) window.clearTimeout(this._send_command_timer_resp);
                        this._send_command_onSuccess_resp(this._send_command_buf_resp);
                        this._resetSendCommandResp();
                    }
                }
            } else {
                console.debug("Invalid Command received.  CMD:0x"+si.tools.prettyHex([command])+" LEN:"+len+"  PARAMS:"+si.tools.prettyHex(parameters)+" CRC:"+si.tools.prettyHex(crc)+" Content-CRC:"+si.tools.prettyHex(crcContent));
            }
        } else {
            console.warn("Invalid start byte", this._respBuffer[0]);
        }
    }
};
si.MainStation.prototype._sendCommand = function (command, parameters, num_resp, onSuccess, onError, timeout) {
    if (this._send_command_cmd_resp) { // If still waiting for response of previous command => postpone
        window.setTimeout((function (ms, command, parameters, num_resp, onSuccess, onError, timeout) {return function () {
            ms._sendCommand(command, parameters, num_resp, onSuccess, onError, timeout);
        };})(this, command, parameters, num_resp, onSuccess, onError, timeout), 100);
        return;
    }

    // Default values
    if (!num_resp) num_resp = 0;
    if (!onSuccess) onSuccess = function (resps) {
        console.log(resps);
    };
    if (!onError) onError = function (errident) {
        console.error(errident);
    };
    if (!timeout) timeout = 10;

    // Build command
    var command_string = [command, parameters.length].concat(parameters);
    var crc = si.tools.CRC16(command_string);
    var cmd = String.fromCharCode(0x02);
    for (var i=0; i<command_string.length; i++) cmd += String.fromCharCode(command_string[i]);
    for (var i=0; i<crc.length; i++) cmd += String.fromCharCode(crc[i]);
    cmd += String.fromCharCode(0x03);
    console.debug("=>", si.tools.prettyHex(cmd));

    // Send command
    var bstr = String.fromCharCode(si.proto.WAKEUP)+cmd;
    try {
        var bytes = new Uint8Array(bstr.length);
        for (var i=0; i<bstr.length; i++) {
            bytes[i] = bstr.charCodeAt(i);
        }
        chrome.serial.send(this._chromeAppConnID, bytes.buffer, function (info) {
            console.log("Sent with Chrome App", info);
        });
    } catch (err) {
        /*
        if (this._localhostSock.readyState==1) {
            try {
                this._localhostSock.send(window.btoa(bstr));
            } catch (err) {
                onError("WS_SEND_ERR");
                return;
            }
        } else {
            onError("WS_SEND_ERR");
            return;
        }
        */
    }

    // Response handling setup
    if (0<num_resp) {
        var timer = window.setTimeout((function (ms, command) {return function () {
            if (ms._send_command_cmd_resp==command) {
                ms._send_command_onError_resp("TIMEOUT");
                ms._resetSendCommandResp();
            }
        };})(this, command), timeout*1000);
        this._setSendCommandResp(command, onSuccess, onError, num_resp, [], timer);
    } else {
        onSuccess([]);
    }
};
si.MainStation.prototype._setSendCommandResp = function (command, onSuccess, onError, num_resp, buf_resp, timer_resp) {
    this._send_command_cmd_resp = command;
    this._send_command_onSuccess_resp = onSuccess;
    this._send_command_onError_resp = onError;
    this._send_command_num_resp = num_resp;
    this._send_command_buf_resp = buf_resp;
    this._send_command_timer_resp = timer_resp;
};
si.MainStation.prototype._resetSendCommandResp = function () {
    this._setSendCommandResp(false, false, false, false, false, false);
};


// ###### Card ######

si.Card = function (mainStation, cardNumber) {
    this.mainStation = mainStation;
    this.cardNumber = cardNumber;
    this.zeroTime = -1;
    this.clearTime = -1;
    this.checkTime = -1;
    this.startTime = -1;
    this.finishTime = -1;
    this.punches = [];
};
si.Card.Type = {
    SICard5: {vals:[1000, 500000], description:"SI Card 5", read:function (card, onSuccess, onError) {
        card.mainStation._sendCommand(si.proto.cmd.GET_SI5, [], 1, (function () {return function (data) {
            data = data[0];
            data.splice(0, 2);
            var cn = si.tools.arr2big([data[6], data[4], data[5]]);
            if (499999<cn) console.warn("SICard5 Error: SI Card Number inconsistency: SI5 detected, but number is "+nr+" (not in 0 - 500'000)");
            if (data[6]<2) cn = si.tools.arr2big([data[4], data[5]]);
            else cn = data[6]*100000+si.tools.arr2big([data[4], data[5]]);
            if (card.cardNumber!=cn) console.warn("SICard5 Error: SI Card Number inconsistency");

            card.startTime = si.tools.arr2time(data.slice(19, 21));
            card.finishTime = si.tools.arr2time(data.slice(21, 23));
            card.checkTime = si.tools.arr2time(data.slice(25, 27));
            // TODO: also read the 6(?) additional punch codes without times
            var len = Math.min(data[23]-1, 30);
            card.punches = new Array(len);
            var ind = 32;
            for (var i=0; i<len; i++) {
                if ((ind%16)==0) ind++;
                var time = si.tools.arr2time(data.slice(ind+1, ind+3));
                if (0<=time) card.punches[i] = {code:data[ind+0], time:time};
                else console.warn("SICard5 Error: Undefined Time in punched range");
                ind += 3;
            }
            card.mainStation._sendCommand(si.proto.ACK, [], 0);
            if (onSuccess) onSuccess(card);
        };})());
    }},
    SICard6: {vals:[500000, 1000000, 2003000, 2004000], description:"SI Card 6", read:function (card, onSuccess, onError) {
        card.mainStation._sendCommand(si.proto.cmd.GET_SI6, [0x08], 3, (function () {return function (data) {
            if (data[0][2]!=0) console.warn("SICard6 Error: First read block is "+data[0][2]+" (expected 0)");
            if (data[1][2]!=6) console.warn("SICard6 Error: Second read block is "+data[1][2]+" (expected 6)");
            if (data[2][2]!=7) console.warn("SICard6 Error: Third read block is "+data[2][2]+" (expected 7)");
            data[0].splice(0, 3);
            data[1].splice(0, 3);
            data[2].splice(0, 3);
            var cn = si.tools.arr2big([data[0][11], data[0][12], data[0][13]]);
            if (card.cardNumber!=cn) console.warn("SICard6 Error: SI Card Number inconsistency");

            card.startTime = si.tools.arr2time(data[0].slice(26, 28));
            card.finishTime = si.tools.arr2time(data[0].slice(22, 24));
            card.checkTime = si.tools.arr2time(data[0].slice(30, 32));
            card.clearTime = si.tools.arr2time(data[0].slice(34, 36));
            var len = Math.min(data[0][18]-1, 64);
            card.punches = new Array(len);
            var blk = 1;
            var ind = 0;
            for (var i=0; i<len; i++) {
                if (128<=ind) {
                    blk++;
                    ind = 0;
                }
                var time = si.tools.arr2time(data[blk].slice(ind+2, ind+4));
                if (0<=time) card.punches[i] = {code:data[blk][ind+1], time:time};
                else console.warn("SICard6 Error: Undefined Time in punched range");
                ind += 4;
            }
            card.mainStation._sendCommand(si.proto.ACK, [], 0);
            if (onSuccess) onSuccess(card);
        };})());
    }},
    SICard8: {vals:[2000000, 2003000, 2004000, 3000000], description:"SI Card 8", read:function (card) {

    }},
    SICard9: {vals:[1000000, 2000000], description:"SI Card 9", read:function (card) {

    }},
    SICard10: {vals:[7000000, 8000000], description:"SI Card 10", read:function (card, onSuccess, onError) {
        card.mainStation._sendCommand(si.proto.cmd.GET_SI8, [0x08], 5, (function () {return function (data) {
            if (data[0][2]!=0) console.warn("SICard10 Error: First read block is "+data[0][2]+" (expected 0)");
            if (data[1][2]!=4) console.warn("SICard10 Error: Second read block is "+data[1][2]+" (expected 4)");
            if (data[2][2]!=5) console.warn("SICard10 Error: Third read block is "+data[2][2]+" (expected 5)");
            if (data[3][2]!=6) console.warn("SICard10 Error: Third read block is "+data[3][2]+" (expected 6)");
            if (data[4][2]!=7) console.warn("SICard10 Error: Third read block is "+data[4][2]+" (expected 7)");
            data[0].splice(0, 3);
            data[1].splice(0, 3);
            data[2].splice(0, 3);
            data[3].splice(0, 3);
            data[4].splice(0, 3);
            var cn = si.tools.arr2big([data[0][25], data[0][26], data[0][27]]);
            if (card.cardNumber!=cn) console.warn("SICard6 Error: SI Card Number inconsistency");

            card.startTime = si.tools.arr2time(data[0].slice(14, 16));
            card.finishTime = si.tools.arr2time(data[0].slice(18, 20));
            card.checkTime = si.tools.arr2time(data[0].slice(10, 12));
            var len = Math.min(data[0][22]-1, 128);
            card.punches = new Array(len);
            var blk = 1;
            var ind = 0;
            for (var i=0; i<len; i++) {
                if (128<=ind) {
                    blk++;
                    ind = 0;
                }
                var time = si.tools.arr2time(data[blk].slice(ind+2, ind+4));
                if (0<=time) card.punches[i] = {code:data[blk][ind+1], time:time};
                else console.warn("SICard6 Error: Undefined Time in punched range");
                ind += 4;
            }
            card.mainStation._sendCommand(si.proto.ACK, [], 0);
            if (onSuccess) onSuccess(card);
        };})());
    }},
    SICard11: {vals:[9000000, 10000000], description:"SI Card 11", read:function (card) {

    }},
    SIAC: {vals:[8000000, 9000000], description:"SIAC", read:function (card) {

    }},
    PCard: {vals:[4000000, 5000000], description:"pCard", read:function (card) {

    }},
    TCard: {vals:[6000000, 7000000], description:"tCard", read:function (card) {

    }},
    FCard: {vals:[14000000, 15000000], description:"fCard", read:function (card) {

    }},
};
si.Card.typeByCardNumber = function (cn) {
    if (!si.Card._typeLookup) {
        si.Card._typeLookup = {borderList:[], borderLookup:{}}
        for (var k in si.Card.Type) {
            var vals = si.Card.Type[k].vals;
            if ((vals.length%2)!=0) throw "si.Card.Type."+k+": vals length is "+vals.length+"?!? (must be even)";
            var lastEvenVal = 0;
            for (var i=0; i<vals.length; i++) {
                var borderList = si.Card._typeLookup.borderList;
                for (var j=0; j<borderList.length && borderList[j]<vals[i]; j++); // TODO: binary search here
                var borderExisted = (si.Card._typeLookup.borderList[j]==vals[i]);
                if (!borderExisted) si.Card._typeLookup.borderList.splice(j, 0, vals[i]);
                if ((i%2)==0) {
                    if (borderExisted) {
                        var collidingRange = si.Card._typeLookup.borderLookup[vals[i]];
                        if (collidingRange) throw "si.Card.Type."+k+": "+vals[i]+" would collide with "+collidingRange;
                    }
                    if (!borderExisted && 0<j) {
                        var collidingRange = si.Card._typeLookup.borderLookup[si.Card._typeLookup.borderList[j-1]];
                        if (collidingRange) throw "si.Card.Type."+k+": "+vals[i]+" would collide with "+collidingRange;
                    }
                    si.Card._typeLookup.borderLookup[vals[i]] = k;
                    lastEvenVal = vals[i];
                } else {
                    if (lastEvenVal!=si.Card._typeLookup.borderList[j-1]) throw "si.Card.Type."+k+": "+vals[i]+" is not an immediate follow-up of "+lastEvenVal;
                    if (!si.Card._typeLookup.borderLookup[vals[i]]) si.Card._typeLookup.borderLookup[vals[i]] = false;
                }
            }
        }
    }
    for (var j=0; j<si.Card._typeLookup.borderList.length && si.Card._typeLookup.borderList[j]<=cn; j++);// TODO: binary search here
    if (j==0) return false;
    return si.Card._typeLookup.borderLookup[si.Card._typeLookup.borderList[j-1]];
};

si.Card.prototype.read = function (onSuccess) {
    var typeFromCN = si.Card.typeByCardNumber(this.cardNumber);
    si.Card.Type[typeFromCN].read(this, onSuccess);
};


// ###### General ######

si.onLoad = function () {};
window.addEventListener("load", function () {
    si.MainStation.startDeviceDetection();
    if (si.onLoad) si.onLoad();
}, true);
