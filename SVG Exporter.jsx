/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Waybury
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

/**
 * Declare the target app.
 */
#target illustrator

/**
 * Include the libraries we need.
 */
// #includepath "/Users/scott/github/iconify/jsx-common/";


#include "JSON.jsx";
#include "utils.jsx";
#include "/Users/scott/github/iconify/jsx-common/Logger.jsxinc";


var LOGGING = true;

/**
 * Disable Illustrator's alerts.
 */
Utils.displayAlertsOff();

app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

var logger = new Logger('000-svg-exporter.log', '~/Downloads/');

info(' ---------------------------- START : ' + new Date().getTime() + ' ----------------------------');

var exportFolder,
    sourceDoc,
    itemsToExport,
    exportDoc,
    svgOptions;

var SVGExportOptions = function() {
    svgOptions = new ExportOptionsSVG();
    svgOptions.embedRasterImages   = false;
    svgOptions.cssProperties       = SVGCSSPropertyLocation.PRESENTATIONATTRIBUTES;
    svgOptions.fontSubsetting      = SVGFontSubsetting.None;
    svgOptions.documentEncoding    = SVGDocumentEncoding.UTF8;
    svgOptions.coordinatePrecision = 4;
    return svgOptions;
};

function log(message, level) {
    if (! level) level = 'info';
    if (LOGGING && typeof logger != 'undefined') {
        logger[level](message);
    }
}

function info(message) {
    log(message, 'info');
}

function error(message) {
    log(message, 'error');
}

try {
    if ( app.documents.length > 0 ) {

        svgOptions    = new SVGExportOptions();
        itemsToExport = [];
        sourceDoc     = app.activeDocument;
        exportFolder  = Folder.selectDialog('Select Folder to Save Files');
        // exportDoc     = documents.add( DocumentColorSpace.RGB );

        main();

        // exportDoc.close(SaveOptions.DONOTSAVECHANGES);
    }
    else{
        error(new Error('There are no documents open. Open a document and try again.'));
        throw new Error('There are no documents open. Open a document and try again.');
    }
}
catch(e) {
    error(e.message);
    alert(e.message, "Script Alert", true);
}

function main() {

    var idx,
        item;

    try {
        info('Set activeDocument to sourceDoc');

        app.activeDocument = sourceDoc;

        info('Mark random artbaords for export');

        getRandomNamedItems(sourceDoc, 100);

        info('Get indices of exportable artboards');

        itemsToExport = getNamedArtboardsByIndex(sourceDoc);

        info('Indices : ' + itemsToExport);
        info('Show progress bar');

        Utils.showProgressBar(itemsToExport.length);

        for ( var i = 0; i < itemsToExport.length; i++ ) {

            try {

                info('Set activeDocument to sourceDoc');

                app.activeDocument = sourceDoc;

                idx = itemsToExport[i];

                info('Set active artboard to ' + idx);

                sourceDoc.artboards.setActiveArtboardIndex(idx);

                item = sourceDoc.artboards[sourceDoc.artboards.getActiveArtboardIndex()];

                info('Update progress bar');
                info("Exporting item " + item.name);

                Utils.updateProgressMessage( "Exporting item " + item.name );

                exportArtboard(item);

                // redraw();
            }
            catch(e) { error(e) }

            Utils.updateProgress( item.name + " was exported" );
        }

        resetArtboardNames();
    }
    catch(e) { error(e) }

    Utils.progress.close();

}

function exportArtboard(artboard) {

    var name,
        aBounds,
        gBounds,
        aWidth,
        aHeight,
        gWidth,
        gHeight,
        gPosition,
        pastedItem,
        theGroupItem;

    app.activeDocument = sourceDoc;

    name = artboard.name;

    info('name : ' + name);
    info('Clear previous selections');

    sourceDoc.selection = null;

    info('Select items on artboard ' + name);

    sourceDoc.selectObjectsOnActiveArtboard();

    info('Group selection');
    info('Selection length : ' + sourceDoc.selection.length);

    app.executeMenuCommand('group');

    info('Get selection');

    theGroupItem = sourceDoc.selection[0];

    aBounds   = artboard.artboardRect;
    gBounds   = theGroupItem.geometricBounds;
    gWidth    = theGroupItem.width;
    gHeight   = theGroupItem.height;
    gPosition = theGroupItem.position;
    aWidth    = aBounds[2] - aBounds[2];
    aHeight   = aBounds[1] - aBounds[3];

    info('aBounds : ' + aBounds);
    info('gBounds : ' + gBounds);
    info('Copy the Group Item');

    app.executeMenuCommand('copy');

    info('Add export document');

    exportDoc = app.documents.add(DocumentColorSpace.RGB);

    info('Set active document to exportDoc');

    app.activeDocument = exportDoc;

    info('fit to window');

    app.executeMenuCommand('fitall');

    info('app.coordinateSystem is ' + app.coordinateSystem);
    info('Set app.coordinateSystem to ' + CoordinateSystem.ARTBOARDCOORDINATESYSTEM );

    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

    info('pasteFront in exportDoc');

    try {
        info('Delete items in exportDoc before pasting new image');
        exportDoc.selectObjectsOnActiveArtboard();
        exportDoc.selection[0].remove();
    }
    catch(e) {
        info('No items to delete before pasting');
    }

    app.executeMenuCommand('paste');

    info('Tested successfully to this point');
    info('Selected copied item');

    exportDoc.selectObjectsOnActiveArtboard();

    info('Get selection');

    pastedItem = exportDoc.selection[0];

    info('Set pasted item position to ' + gPosition);

    pastedItem.position = gPosition;

    if (! exportDoc.pageItems.length) return;

    info('Set exportDoc layer name');

    exportDoc.layers[0].name = name;

    info('Attempt to export SVG');

    exportSVG( exportDoc, name, aBounds, svgOptions );
}

function exportSVG(doc, name, bounds, exportOptions) {

    doc.artboards[0].artboardRect = bounds;

    doc.exportFile(
        new File( exportFolder.fsName + '/' + name ),
        ExportType.SVG,
        exportOptions
    );

    doc.close(SaveOptions.DONOTSAVECHANGES);
}

function resize(target, scale) {
    if (typeof(target.resize) == "function") {
        target.resize(
            scale,
            scale,
            true,
            true,
            true,
            true,
            scale
        );
    }
    else {

    }
}


function centerOnArtboard() {

    var doc    = app.activeDocument;
    var count  = doc.artboards.length;
    var __SCALE = 22.222;

    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

    for (var i = 0; i < count; i++) {
        doc.artboards.setActiveArtboardIndex(i);
        // doc.selection = null;

        var board  = doc.artboards[doc.artboards.getActiveArtboardIndex()];
        var right  = board.artboardRect[2];
        var bottom = board.artboardRect[3];

        doc.selectObjectsOnActiveArtboard();

        app.executeMenuCommand('group');

        for (var x = 0 ; x < doc.selection.length; x++) {
            try {
                doc.selection[x].position = [
                    Math.round((right - doc.selection[x].width)/2),
                    Math.round((bottom + doc.selection[x].height)/2)
                ];

                // resize(doc.selection[x], __SCALE);

                resizeArtboard();

            }
            catch(e) {
                alert(e);
            }
        }
    }

    redraw();
}

function resizeArtboard() {

    var OPTIONS = {
        size   : 32,
        width  : 32,
        height : 32
    };

    if (app.documents.length > 0) {

        var idoc  = app.activeDocument;
        var title = "Resize All Artboards";

        OPTIONS.size = "64x64";

        if (OPTIONS.size.indexOf('x') != -1) {
            var bits = OPTIONS.size.split('x');
            OPTIONS.width  = parseInt(bits[0]);
            OPTIONS.height = parseInt(bits[1]);
        }
        else {
            OPTIONS.width  = OPTIONS.size;
            OPTIONS.height = OPTIONS.size;
        }

        try {
            var width  = OPTIONS.width;
            var height = OPTIONS.height;

            for (i=0; i<idoc.artboards.length; i++) {
                var abBounds = idoc.artboards[i].artboardRect;// left, top, right, bottom

                var ableft   = abBounds[0]; // 0
                var abtop    = abBounds[1]; // 612
                var abwidth  = abBounds[2] - ableft; // 792 // width
                var abheight = abtop- abBounds[3]; // 0 // height

                var abctrx   = abwidth / 2 + ableft;
                var abctry   = abtop - abheight / 2;

                var ableft   = abctrx - width  / 2;
                var abtop    = abctry + height / 2;
                var abright  = abctrx + width  / 2;
                var abbottom = abctry - height / 2;

                idoc.artboards[i].artboardRect = [ableft, abtop, abright, abbottom];
            }
        }
        catch(e) {
            alert(e.message);
            /** Exist gracfully for now */
        }
    }
    else  {
        alert ("there are no open documents");
    }
}

function getNamedArtboardsByIndex(doc) {
    var artboard,
        indices;

    indices   = [];

    for ( var i = 0, len = doc.artboards.length; i < len; i++ ) {
        artboard = doc.artboards[i];
        if ( artboard.name.split('.').pop() === 'svg' ) {
            indices.push(i);
        }
    }

    return indices;
}

function getNamedArtboards(doc) {
    var artboard,
        artboards;

    artboards = [];

    for ( var i = 0, len = doc.artboards.length; i < len; i++ ) {
        artboard = doc.artboards[i];
        if ( artboard.name.split('.').pop() === 'svg' ) {
            artboards.push(artboard);
        }
    }

    return artboards;
}

function getNamedItems(doc) {
    var item,
        items,
        indices,
        doclayers,
        artboards;

    artboards = [];
    indices   = [];

    // Check all artboards for name match
    // artboards = [];

    for ( var i = 0, len = doc.artboards.length; i < len; i++ ) {
        artboard = doc.artboards[i];
        if ( artboard.name.split('.').pop() === 'svg' ) {
            artboards.push(artboard);
            indices.push(i);
        }
    }

    return items;

    // Check all layers for name match
    doclayers = [];
    recurseLayers( doc.layers, doclayers );

    for ( i = 0, len = doclayers.length; i < len; i++ ) {
        item = doclayers[i];

        if ( item.name.split('.').pop() === 'svg' && !item.locked && !anyParentLocked(item) ) {
            items.push(item);
        }
    }

    // Check all pageItems for name match
    for ( i = 0, len = doc.pageItems.length; i < len; i++ ) {
        item =  doc.pageItems[i];

        if ( item.name.split('.').pop() === 'svg' && !item.locked && !anyParentLocked(item) ) {
            items.push(item);
        }
    }

    return items;
}

function resetArtboardNames() {

    var artboards = app.activeDocument.artboards;
    /*
     * Remove .svg from any artboard names
     */
    for (var i = 0; i < artboards.length; i++) {
        artboards[i].name = artboards[i].name.replace('.svg', '');
    }
}

function getRandomNamedItems(doc, count) {

    var random = [],
        used   = [],
        items  = app.activeDocument.artboards;

    /*
     * Remove .svg from any artboard names
     */
    resetArtboardNames();

    info(items);

    if (items.length < count) return items;

    // count = 5;

    /*
     * Pick new random artboards and add .svg to name
     * so they will be exported.
     */
    for (var i = 0; i < count; i++) {
        var rand = Utils.getRandomInt(0, items.length-1, used);
        used.push(rand);
        items[rand].name = items[rand].name + '.svg';
        random.push(items[rand]);
    }

    info(random);

    return random;
}

function recurseLayers(layers, layerArray) {

    var layer;

    for ( var i = 0, len = layers.length; i < len; i++ ) {
        layer = layers[i];
        if ( !layer.locked ) {
            layerArray.push(layer);
        }
        if (layer.layers.length > 0) {
            recurseLayers( layer.layers, layerArray );
        }
    }
}

function recurseItems(layers, items) {

    var layer;

    for ( var i = 0, len = layers.length; i < len; i++ ) {
        layer = layers[i];
        if ( layer.pageItems.length > 0 && !layer.locked ) {
            for ( var j = 0, plen = layer.pageItems.length; j < plen; j++ ) {
                if ( !layer.pageItems[j].locked ) {
                    items.push(layer.pageItems[j]);
                }
            }
        }

        if ( layer.layers.length > 0 ) {
            recurseItems( layer.layers, items );
        }
    }
}

function anyParentLocked(item) {
    while ( item.parent ) {
        if ( item.parent.locked ) {
            return true;
        }
        item = item.parent;
    }

    return false;
}


/* Code derived from John Wundes ( john@wundes.com ) www.wundes.com
 * Copyright (c) 2005 wundes.com
 * All rights reserved.
 *
 * This code is derived from software contributed to or originating on wundes.com
 */

function hitTest(a,b){
    if (!hitTestX(a,b)){
        return false;
    }
    if (!hitTestY(a,b)){
        return false;
    }
    return true;
}

function hitTestX(a,b){
    var p1 = a.visibleBounds[0];
    var p2 = b.visibleBounds[0];
    if ( (p2<=p1 && p1<=p2+b.width) || (p1<=p2 && p2<=p1+a.width) ) {
        return true;
    }
    return false;
}

function hitTestY(a,b){
    var p3 = a.visibleBounds[1];
    var p4 = b.visibleBounds[1];
    if ( (p3>=p4 && p4>=(p3-a.height)) || (p4>=p3 && p3>=(p4-b.height)) ) {
        return true;
    }
    return false;
}
