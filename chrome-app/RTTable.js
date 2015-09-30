var RTTable = function (elem, onNeedIDs, onNeedRowForID, columns) {
    this.IDs = [];
    this.columns = columns;
    this.onNeedIDs = onNeedIDs;
    this.onNeedRowForID = onNeedRowForID;
    this.onReorder = false;

    try {
        var tmp = (elem.substr(0,1).length!=1);
        elem = document.getElementById(elem);
    } catch (err) {}
    this._rootElem = elem;
    this._headerElem = false;
    this._contentElem = false;
    this._contentSimulationElem = false;
    this._filterElems = {};
    this._dragElem = false;
    this._dropMarkerElem = false;

    this._colWids = {};
    this._filters = {};
    this._rows = {};
    this._rowCells = {};
    this._rowIndices = {};
    this._touches = {};
    this._scrollTimer = false;
    this._scrollSequenceNum = 0;
    this.style = {"scrollBarWidth":-1, "scrollBarHeight":-1, "headerHeight":20, "rowHeight":20, "headerBarStyle":"background-color:rgb(220,220,220);", "headerCellStyle":"color:rgb(0,0,0);", "headerRightStyle":"background-color:rgb(210,210,210);", "contentStyle":"-webkit-overflow-scrolling:touch; background-color:rgb(245,245,245);", "evenRowBGColor":"rgb(255,255,255)", "evenRowColor":"rgb(0,0,0)", "oddRowBGColor":"rgb(240,240,240)", "oddRowColor":"rgb(0,0,0)", "selectedEvenRowBGColor":"rgb(75,75,75)", "selectedEvenRowColor":"rgb(255,255,255)", "selectedOddRowBGColor":"rgb(60,60,60)", "selectedOddRowColor":"rgb(255,255,255)"};
    this.state = {"pxYOff":0, "pxXOff":0, "selection":{}, "lastSelection":false};
    onNeedIDs({}, (function (tbl) {return function (ids) {
        tbl.IDs = ids;
        tbl.forceRefresh();
    };})(this));
    /*
    window.setTimeout((function (tbl) {return function () {
        tbl.draw();
    };})(this), 1);
    */
};
RTTable.prototype.draw = function () {
    console.log("DRAW", this._rootElem.id);
    // TODO: determine scrollbarwid/hei if -1
    this._rootElem.innerHTML = "";
    var rootWid = this._rootElem.offsetWidth;
    var rootHei = this._rootElem.offsetHeight;
    this._headerElem = document.createElement("div");
    this._headerElem.setAttribute("style", "position:absolute; left:0px; top:0px; width:"+rootWid+"px; height:"+this.style["headerHeight"]+"px; line-height:"+this.style["headerHeight"]+"px; "+this.style["headerBarStyle"]);
    var collen = this.columns.length;
    var xoff = 0;
    for (var i=0; i<collen; i++) {
        var col = this.columns[i];
        var wid = col.getWidthFunc(rootWid-this.style["scrollBarWidth"]);
        this._colWids[i] = wid;
        var headerCellElem = document.createElement("div");
        headerCellElem.setAttribute("style", "position:absolute; top:0px; left:"+xoff+"px; width:"+wid+"px; height:"+this.style["headerHeight"]+"px; overflow:hidden; "+this.style["headerCellStyle"]);
        headerCellElem.innerHTML = col.title;
        if (col.filterFunc) {
            var filterSpan = document.createElement("span");
            filterSpan.setAttribute("style", "position:relative;");
            var filterCnv = document.createElement("canvas");
            var cnvsiz = this.style["headerHeight"]*2;
            filterCnv.setAttribute("width", cnvsiz);
            filterCnv.setAttribute("height", cnvsiz);
            filterCnv.setAttribute("style", "position:absolute; width:"+(this.style["headerHeight"])+"px; height:"+(this.style["headerHeight"])+"px; margin:0px;");
            var drawFilter = (function (filterCnv) {return function (active) {
                var ctx = filterCnv.getContext("2d");
                ctx.strokeStyle = headerCellElem.style.color;
                ctx.fillStyle = headerCellElem.style.color;
                var tmp = (48<cnvsiz)?4:cnvsiz/12;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cnvsiz*2/5, cnvsiz*1/5);
                ctx.lineTo(cnvsiz*4/5, cnvsiz*1/5);
                ctx.lineTo(cnvsiz/2+tmp, cnvsiz/2-tmp);
                ctx.lineTo(cnvsiz/2+tmp, cnvsiz*4/5-2*tmp);
                ctx.lineTo(cnvsiz/2-tmp, cnvsiz*4/5);
                ctx.lineTo(cnvsiz/2-tmp, cnvsiz/2-tmp);
                ctx.lineTo(cnvsiz*1/5, cnvsiz*1/5);
                ctx.lineTo(cnvsiz*3/5, cnvsiz*1/5);
                ctx.stroke();
                if (active) ctx.fill();
            };})(filterCnv);
            drawFilter("_col_filter_"+col.title in this._filters);
            filterSpan.appendChild(filterCnv);
            filterSpan.onclick = (function (tbl, col, headerCellElem, drawFilter) {return function () {
                if ("_col_filter_"+col.title in tbl._filterElems) {
                    var filterElem = tbl._filterElems["_col_filter_"+col.title];
                    var parent = filterElem.parentElement;
                    if (parent) parent.removeChild(filterElem);
                    delete tbl._filterElems["_col_filter_"+col.title];
                } else {
                    for (var key in tbl._filterElems) {
                        var filterElem = tbl._filterElems[key];
                        var parent = filterElem.parentElement;
                        if (parent) parent.removeChild(filterElem);
                        delete tbl._filterElems["_col_filter_"+col.title];
                    }
                    var rect = headerCellElem.getBoundingClientRect();
                    var filterElem = document.createElement("div");
                    filterElem.style.width = rect.width+"px";
                    headerCellElem.parentElement.appendChild(filterElem);
                    col.filterFunc(filterElem, tbl._filters["_col_filter_"+col.title], (function (filterElem) {return function (newDesc) {
                        if (newDesc===false) {
                            delete tbl._filters["_col_filter_"+col.title];
                            drawFilter(false);
                        } else {
                            tbl._filters["_col_filter_"+col.title] = newDesc;
                            drawFilter(true);
                        }
                        tbl.onNeedIDs(tbl._filters, function (ids) {
                            tbl.IDs = ids;
                            tbl.forceRefresh();
                        });
                    };})(filterElem));
                    filterElem.setAttribute("style", "position:absolute; top:"+(tbl.style.headerHeight)+"px; left:"+(headerCellElem.offsetLeft)+"px; z-index:10000;");
                    tbl._filterElems["_col_filter_"+col.title] = filterElem;
                }
            };})(this, col, headerCellElem, drawFilter);
            headerCellElem.appendChild(filterSpan);
        }
        this._headerElem.appendChild(headerCellElem);
        xoff += wid;
    }
    var headerRightElem = document.createElement("div");
    headerRightElem.setAttribute("style", "position:absolute; left:"+xoff+"px; top:0px; width:"+this.style["scrollBarWidth"]+"px; height:"+this.style["headerHeight"]+"px; "+this.style["headerRightStyle"]);
    this._headerElem.appendChild(headerRightElem);
    this._rootElem.appendChild(this._headerElem);

    this._contentElem = document.createElement("div");
    this._contentElem.setAttribute("style", "position:absolute; left:0px; top:"+this.style["headerHeight"]+"px; width:"+rootWid+"px; height:"+(rootHei-this.style["headerHeight"])+"px; overflow:scroll; "+this.style["contentStyle"]);
    this._rootElem.appendChild(this._contentElem);
    this._contentElem.onscroll = (function (tbl) {return function (e) {
        if (tbl._scrollTimer) window.clearTimeout(tbl._scrollTimer);
        tbl._scrollSequenceNum++;
        if (1024<tbl._scrollSequenceNum) tbl._scrollSequenceNum -= 1024;
        var localScrollSequenceNum = tbl._scrollSequenceNum;
        var pxXOff = tbl._contentElem.scrollLeft;
        var pxYOff = tbl._contentElem.scrollTop;
        tbl._headerElem.scrollLeft = pxXOff;
        tbl.state.pxXOff = pxXOff;
        tbl.state.pxYOff = pxYOff;
        tbl._scrollTimer = window.setTimeout((function (localScrollSequenceNum) {return function () {
            tbl.refresh(localScrollSequenceNum);
        };})(localScrollSequenceNum), 100);
    };})(this);

    var rowHei = this.style["rowHeight"];
    var visibleRows = Math.ceil(this._contentElem.offsetHeight/rowHei);
    visibleRows = Math.floor(visibleRows/2+1)*2;
    this._contentSimulationElem = document.createElement("div");
    this._contentSimulationElem.setAttribute("style", "background-color:rgb(255,255,255); "+this.style["contentStyle"]+"; position:absolute; left:0px; top:0px; width:"+(rootWid-this.style["scrollBarWidth"])+"px; height:"+rowHei+"px; -moz-user-select:none; -webkit-user-select:none; -ms-user-select:none;");
    this._contentElem.appendChild(this._contentSimulationElem);
    for (var y=0; y<visibleRows; y++) {
        this._rowCells[y] = {};
        this._rowIndices[y] = -1;
        var tmpRow = document.createElement("div");
        tmpRow.setAttribute("style", "position:absolute; left:0px; top:0px; height:"+rowHei+"px; line-height:"+rowHei+"px; font-size:"+Math.floor(rowHei*3/4)+"px;  overflow:hidden; white-space:nowrap; cursor:default;");
        tmpRow.draggable = true;
        tmpRow.ondragstart = (function (tbl) {return function (e) {
            var dragElem = document.createElement("div");
            dragElem.setAttribute("style", "position:absolute; top:0px; left:0px; width:1px; height:1px; overflow:hidden; cursor:default; opacity:0.5; z-index:-1;");
            var rowHei = tbl.style.rowHeight;
            var ind = 0;
            var data = [];
            for (var i=0; i<tbl.IDs.length; i++) {
                var tmpID = tbl.IDs[i];
                if (tmpID in tbl.state.selection) { // For all selected Rows (but in the right order!)
                    data.push(parseInt(tmpID));
                    var xoff = 0;
                    for (var x=0; x<tbl.columns.length; x++) {
                        var colwid = tbl._colWids[x];
                        var tmp = document.createElement("div");
                        tmp.setAttribute("style", "position:absolute; left:"+xoff+"px; top:"+(ind*rowHei)+"px; width:"+colwid+"px; height:"+rowHei+"px; line-height:"+rowHei+"px; font-size:"+Math.floor(rowHei*3/4)+"px;  background-color:"+(ind%2==0?tbl.style.selectedEvenRowBGColor:tbl.style.selectedOddRowBGColor)+"; color:"+(ind%2==0?tbl.style.selectedEvenRowColor:tbl.style.selectedOddRowColor)+"; overflow:hidden; white-space:nowrap; cursor:default;");
                        dragElem.appendChild(tmp);
                        xoff += colwid;
                        tbl.columns[x].renderCellFunc(tbl, tmp, tbl._rows[tmpID]);
                    }
                    dragElem.style.width = xoff+"px";
                    ind++;
                }
            }
            dragElem.style.height = (ind*rowHei)+"px";
            tbl._contentSimulationElem.appendChild(dragElem);
            tbl._dragElem = dragElem;
            e.dataTransfer.setDragImage(dragElem, 0, 0);
            e.dataTransfer.setData("application/x-buefflae-tablerow-"/* TODO */, JSON.stringify(data));
            e.dataTransfer.setData("text/plain", "text/plain"+dragElem.contentText);
            e.dataTransfer.setData("text/html", "text/html"+dragElem.innerHTML);
        };})(this);
        tmpRow.ondragend = (function (tbl) {return function (e) {
            e.preventDefault();
            tbl._dragElem.parentElement.removeChild(tbl._dragElem);
        };})(this);
        tmpRow.ondragover = (function (tbl, tmpRow) {return function (e) {
            if (tbl.onReorder) {
                var success = false;
                for (var i=0; i<e.dataTransfer.types.length; i++) {
                    if (e.dataTransfer.types[i]=="application/x-buefflae-tablerow-"/* TODO */) {
                        e.dataTransfer.dropEffect = "move";
                        e.preventDefault();
                        success = true;
                        break;
                    }
                }
                if (success) {
                    var dropMarkerElem = tbl._dropMarkerElem;
                    if (!dropMarkerElem) {
                        dropMarkerElem = document.createElement("div");
                        dropMarkerElem.setAttribute("style", "position:fixed; height:2px; background-color:rgb(0,0,0); z-index:1; pointer-events:none;");
                        document.body.appendChild(dropMarkerElem);
                        tbl._dropMarkerElem = dropMarkerElem;
                    }
                    var rowRect = tmpRow.getBoundingClientRect();
                    var contentRect = tbl._contentElem.getBoundingClientRect();
                    var isTop = (e.clientY-rowRect.top-rowRect.height/2<0);
                    dropMarkerElem.style.width = Math.min(contentRect.width, rowRect.width)+"px";
                    dropMarkerElem.style.top = (isTop?rowRect.top-1:rowRect.bottom-1)+"px";
                    dropMarkerElem.style.left = contentRect.left+"px";
                }
            }
        };})(this, tmpRow);
        tmpRow.ondragleave = (function (tbl) {return function (e) {
            e.preventDefault();
            if (tbl.onReorder) {
                if (tbl._dropMarkerElem) {
                    tbl._dropMarkerElem.parentElement.removeChild(tbl._dropMarkerElem);
                    tbl._dropMarkerElem = false;
                }
            }
        };})(this);
        tmpRow.ondrop = (function (tbl, tmpRow, y) {return function (e) {
            e.preventDefault();
            if (tbl.onReorder) {
                if (tbl._dropMarkerElem) {
                    tbl._dropMarkerElem.parentElement.removeChild(tbl._dropMarkerElem);
                    tbl._dropMarkerElem = false;
                }
                var sourceIDs = JSON.parse(e.dataTransfer.getData("application/x-buefflae-tablerow-"/* TODO */));
                var rowRect = tmpRow.getBoundingClientRect();
                var isTop = (e.clientY-rowRect.top-rowRect.height/2<0);
                var ind = tbl._rowIndices[y];
                var destinationIDs = [tbl.IDs[ind], tbl.IDs[ind+1]];
                if (isTop) destinationIDs = [tbl.IDs[ind-1], tbl.IDs[ind]];
                var finished = function (ids) {
                    tbl.IDs = ids;
                    tbl.forceRefresh();
                };
                var newIDs = [];
                if (destinationIDs[0]==undefined) newIDs = sourceIDs;
                var sourceIDsDict = {};
                for (var i=0; i<sourceIDs.length; i++) sourceIDsDict[sourceIDs[i]] = true;
                for (var i=0; i<tbl.IDs.length; i++) {
                    var tmpID = tbl.IDs[i];
                    if (!(tmpID in sourceIDsDict)) newIDs.push(tmpID);
                    if (destinationIDs[0]==tmpID) newIDs = newIDs.concat(sourceIDs);
                }
                tbl.onReorder(sourceIDs, destinationIDs, tbl.IDs, newIDs, finished);
                return false;
            }
        };})(this, tmpRow, y);
        var xoff = 0;
        for (var x=0; x<collen; x++) {
            var colwid = this._colWids[x];
            var tmpCell = document.createElement("div");
            tmpCell.setAttribute("style", "position:absolute; left:"+xoff+"px; top:0px; width:"+colwid+"px; height:"+rowHei+"px; line-height:"+rowHei+"px; font-size:"+Math.floor(rowHei*3/4)+"px;  overflow:hidden; white-space:nowrap; cursor:default;");
            tmpRow.appendChild(tmpCell);
            this._rowCells[y][x] = tmpCell;
            xoff += colwid;
        }
        tmpRow.style.width = xoff+"px";
        this._contentSimulationElem.style.width = xoff+"px";
        this._rowCells[y].row = tmpRow;
        this._contentSimulationElem.appendChild(tmpRow);
    }
    this._contentElem.scrollLeft = this.state.pxXOff;
    this._contentElem.scrollTop = this.state.pxYOff;
    if (this.state.pxYOff==0) window.setTimeout((function (tbl) {return function () {
        tbl.forceRefresh();
    };})(this), 1);
};

RTTable.prototype.refresh = function (localScrollSequenceNum) {
    if (!this._contentElem) return;
    var collen = this.columns.length;
    var rowNum = this.IDs.length;
    var rowHei = this.style.rowHeight;
    var pxYOff = this._contentElem.scrollTop;
    var visibleRows = Math.ceil(this._contentElem.offsetHeight/rowHei);
    visibleRows = Math.floor(visibleRows/2+1)*2;
    var rowsYOff = Math.floor(pxYOff/rowHei);
    var limit = rowsYOff+visibleRows;
    if (rowNum<limit) limit = rowNum;
    this._contentSimulationElem.style.height = (rowNum*rowHei)+"px";
    var loadIDs = [];
    var loadYMods = [];
    var loadYs = [];
    for (var y=limit-visibleRows; y<limit && (localScrollSequenceNum==undefined || localScrollSequenceNum==this._scrollSequenceNum); y++) {
        var ymod = y%visibleRows;
        var visible = (0<=y);
        while (ymod<0) ymod += visibleRows;
        this._rowCells[ymod].row.style.top = (y*rowHei)+"px";
        this._rowCells[ymod].row.style.visibility = (visible?"visible":"hidden")+"px";
        if (!visible) continue;
        var ind = this._rowIndices[ymod];
        var tmpID = this.IDs[y];
        if (ind!=y) {
            for (var x=0; x<collen && (localScrollSequenceNum==undefined || localScrollSequenceNum==this._scrollSequenceNum); x++) {
                var tmp = this._rowCells[ymod][x];
                var refreshView = (function (tbl, tmpID, visibleRows) {return function () {
                    var collen = tbl.columns.length;
                    for (var j=0; j<visibleRows; j++) {
                        var ind = tbl._rowIndices[j];
                        var tmpID = tbl.IDs[ind];
                        for (var x=0; x<collen; x++) {
                            var tmp = tbl._rowCells[j][x];
                            if (tmpID in tbl.state.selection) {
                                tmp.style.backgroundColor = tbl.style[((j%2)==0?"selectedEvenRowBGColor":"selectedOddRowBGColor")];
                                tmp.style.color = tbl.style[((j%2)==0?"selectedEvenRowColor":"selectedOddRowColor")];
                            } else {
                                tmp.style.backgroundColor = tbl.style[((j%2)==0?"evenRowBGColor":"oddRowBGColor")];
                                tmp.style.color = tbl.style[((j%2)==0?"evenRowColor":"oddRowColor")];
                            }
                        }
                    }
                };})(this, tmpID, visibleRows);
                /*
                tmp.ontouchstart = function (e) {
                    document.body.style.backgroundColor = "blue";
                    document.getElementById("status").innerHTML = (e.changedTouches[0].identifier);
                };
                */
                tmp.onmousedown = (function (tbl, tmpID, tmpCol, refreshView) {return function (e) { // TODO: touch?
                    tbl._touches["mouse"] = {"ox":e.clientX, "oy":e.clientY, "x":e.clientX, "y":e.clientY, "oid":tmpID};
                    if (e.metaKey) {
                        if (!(tmpID in tbl.state.selection)) {
                            tbl.state.lastSelection = tmpID;
                            tbl.state.selection[tmpID] = tmpCol;
                            refreshView();
                            tbl._touches["mouse"].metaSelected = true;
                        }
                    } else if (e.shiftKey && tbl.state.lastSelection!==false) {
                        var active = 0;
                        for (var i=0; i<tbl.IDs.length; i++) {
                            if (!active) {
                                if (tbl.IDs[i]==tbl.state.lastSelection) active = 1;
                                if (tbl.IDs[i]==tmpID) active = 2;
                            }
                            if (0<active) {
                                tbl.state.selection[tbl.IDs[i]] = tmpCol;
                                if (tbl.IDs[i]==tbl.state.lastSelection && active==2) break;
                                if (tbl.IDs[i]==tmpID && active==1) break;
                            }
                        }
                        refreshView();
                    } else {
                        if (!(tmpID in tbl.state.selection)) {
                            tbl.state.selection = {};
                            tbl.state.lastSelection = tmpID;
                            tbl.state.selection[tmpID] = tmpCol;
                            refreshView();
                        }
                    }
                };})(this, tmpID, this.columns[x], refreshView);
                tmp.onmouseup = (function (tbl, tmpID, tmpCol, refreshView) {return function (e) { // TODO: touch?
                    if (e.metaKey) {
                        if (tmpID in tbl.state.selection && !tbl._touches["mouse"].metaSelected) {
                            delete tbl.state.selection[tmpID];
                            refreshView();
                        }
                    } else if (e.shiftKey && tbl.state.lastSelection!==false) {
                    } else {
                        tbl.state.selection = {};
                        tbl.state.lastSelection = tmpID;
                        tbl.state.selection[tmpID] = tmpCol;
                        refreshView();
                    }
                    delete tbl._touches["mouse"];
                    e.preventDefault();
                };})(this, tmpID, this.columns[x], refreshView);
                tmp.onclick = (function (tbl, tmpID, tmpCol) {return function (e) {
                    console.log("Click", tmpID, tmpCol);
                };})(this, tmpID, this.columns[x]);
                tmp.ondblclick = (function (tbl, tmpID, tmpCol) {return function (e) {
                    console.log("DblClick", tmpID, tmpCol);
                };})(this, tmpID, this.columns[x]);
                if (tmpID in this.state.selection) {
                    tmp.style.backgroundColor = this.style[((y%2)==0?"selectedEvenRowBGColor":"selectedOddRowBGColor")];
                    tmp.style.color = this.style[((y%2)==0?"selectedEvenRowColor":"selectedOddRowColor")];
                } else {
                    tmp.style.backgroundColor = this.style[((y%2)==0?"evenRowBGColor":"oddRowBGColor")];
                    tmp.style.color = this.style[((y%2)==0?"evenRowColor":"oddRowColor")];
                }
                if (tmpID in this._rows) {
                    this.columns[x].renderCellFunc(this, tmp, this._rows[tmpID]);
                } else {
                    tmp.innerHTML = "";
                }
            }
            this._rowIndices[ymod] = y;
            if (!(tmpID in this._rows)) {
                loadIDs.push(tmpID);
                loadYMods.push(ymod);
                loadYs.push(y);
            }
        }
    }
    if (0<loadIDs.length) {
        this.onNeedRowForID(loadIDs, (function (tbl, loadIDs, loadYMods, loadYs) {return function (rows) {
            var beg = new Date().getTime();
            for (var j=0; j<loadIDs.length; j++) {
                var id = loadIDs[j];
                var ymod = loadYMods[j];
                var y = loadYs[j];
                var row = rows[j];
                tbl._rows[id] = row;
                if (tbl._rowIndices[ymod]==y) {
                    var collen = tbl.columns.length;
                    for (var x=0; x<collen; x++) {
                        var tmp = tbl._rowCells[ymod][x];
                        tbl.columns[x].renderCellFunc(tbl, tmp, row);
                    }
                }
            }
        };})(this, loadIDs, loadYMods, loadYs));
    }
};
RTTable.prototype.forceRefresh = function (localScrollSequenceNum) {
    // Consider changes in selection, ids, scroll
    this._rowIndices = {};
    this.refresh(localScrollSequenceNum);
};
RTTable.prototype.forceReload = function (localScrollSequenceNum) {
    // Consider changes in data of rows
    this._rows = {};
    this.forceRefresh(localScrollSequenceNum);
};

var RTTableColumn = function (title, getWidthFunc, renderCellFunc, filterFunc) {
    this.title = title;
    this.getWidthFunc = getWidthFunc;
    if (!this.getWidthFunc) this.getWidthFunc = function (wid) {
        return 200;
    };
    this.renderCellFunc = renderCellFunc;
    this.filterFunc = filterFunc;
};
var RTTableCellRenderText = function (gettext) {
    return function (tbl, cell, row) {
        try {
            cell.innerHTML = gettext(row);
        } catch (err) {}
    }
};
var RTTableCellRender = function (dorender) {
    return function (tbl, cell, row) {
        try {
            dorender(row, cell);
        } catch (err) {}
    }
};
var RTTableCellRenderHTMLJS = function (gethtmljs) {
    return function (tbl, cell, row) {
        try {
            var dict = gethtmljs(row);
            cell.innerHTML = dict["html"];
            dict["js"]();
        } catch (err) {}
    }
};
