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

#target illustrator

var logging = true;
var logger  = getLogger();
var startTime = (new Date()).getTime();

var originalInteractionLevel = userInteractionLevel;
userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

var CONST = {
    LOG_FILE_PATH: "~/Desktop/ai-svg-exporter-log.txt",
    CHOOSE_FOLDER: "Where do you want to save the SVG files?",
    NO_DOCUMENT: "Please create a document with something in it before running this script.",
    ARTBOARD_SIZE: 680
}

// var tmp = false;
// var max = 10;
// var x = 0;
// while (isNaN(tmp) && x < max) {
//     tmp = Number(prompt("Enter a size for the artboards", CONST.ARTBOARD_SIZE));
//     x++;
// }
// CONST.ARTBOARD_SIZE = tmp;

var exportFolder,
    sourceDoc,
    itemsToExport,
    exportDoc,
    svgOptions;

try {
  if (app.documents.length > 0) {
    svgOptions = new ExportOptionsSVG();
    svgOptions.embedRasterImages = false;
    svgOptions.cssProperties = SVGCSSPropertyLocation.PRESENTATIONATTRIBUTES;
    svgOptions.fontSubsetting = SVGFontSubsetting.None;
    svgOptions.documentEncoding = SVGDocumentEncoding.UTF8;
    svgOptions.coordinatePrecision = 4;

    itemsToExport = [];
    sourceDoc = app.activeDocument;
    exportFolder = Folder.selectDialog(CONST.CHOOSE_FOLDER);
    exportDoc = documents.add(DocumentColorSpace.RGB);

    main();

    exportDoc.close(SaveOptions.DONOTSAVECHANGES);
  }
  else{
    throw new Error(CONST.NO_DOCUMENT);
  }
}
catch(e) {
  alert(e.message, "Script Alert", true);
}

userInteractionLevel = originalInteractionLevel;

var endTime = (new Date()).getTime();
var execTime = millisecondsToStr(endTime - startTime);

logger.info("Execution time: " + execTime);


/**
 * Recurse through any un-locked layers and export named groupItems to SVG files.
 */
function main() {
  var item, folders;
  app.activeDocument = sourceDoc;
  // itemsToExport = getNamedItems(sourceDoc);
  
  sourceLayers = sourceDoc.layers;
  var rootFolder = exportFolder;
  
  for (x = 0; x<sourceLayers.length; x++) {
      
      sourceLayer = sourceLayers[x];
      
      // If the layer is locked, don't do anything. 
      // Just go to the next layer
      
      if (sourceLayer.locked) continue;
      
      // Create a subfolder named after the layer
      
      //if (sourceLayer.layers.length) {
          var subFolder = new Folder(rootFolder.absoluteURI + "/" + sourceLayer.name.replace(" ", "-"));
          if (! subFolder.exists) {
              logger.info("[main()] Creating folder " + subFolder.name + " in folder " + rootFolder.absoluteURI);
              subFolder.create();
          }
          exportFolder = subFolder;
          logger.info("[main()] Current exportFolder is " + exportFolder.absoluteURI);
      //}
      // Get any named groupItems on the layer
      
      itemsToExport = getItemsToExport(sourceLayer);
      
      for (var i = 0, len = itemsToExport.length; i < len; i++) {

        item = itemsToExport[i];
        logger.info("[main()] trying to export item " + item.name + " in folder " + exportFolder.name);
        exportItem(item);

        // Empty export document
        exportDoc.pageItems.removeAll();
      }
      
      // After exporting the layer's items, lock the layer 
      // so we don't accidentally export them more than once
      
      sourceLayer.locked = true;
  }

}

/*
 // Original
 function main() {
  var item;
  app.activeDocument = sourceDoc;
  itemsToExport = getNamedItems(sourceDoc);

  for (var i = 0, len = itemsToExport.length; i < len; i++) {


    item = itemsToExport[i];

    if (item.typename === 'Artboard') {
      exportArtboard(item);
    } else if (item.typename === 'Layer') {
      exportLayer(item);
    } else {
      exportItem(item);
    }

    // Empty export document
    exportDoc.pageItems.removeAll();
  }

}
*/

function getItemsToExport(source) {
    var item,
        items,
        sourcelayers;

    items = [];
    
    sourcelayers = [source];
    recurseLayers(source.layers, sourcelayers);

    for (x=0; x<sourcelayers.length; x++) {
        var sourcelayer = sourcelayers[x];
        for (i = 0, len = sourcelayer.groupItems.length; i < len; i++) {
            item =  sourcelayer.groupItems[i];
            if (item.name.split('.').pop() === 'svg' && !item.locked && !anyParentLocked(item)) {
                items.push(item);
            }
        }      
    }
    logger.info(
        "Found " + items.length + 
        " items to export in " + source.name
    );
    return items;
}

function exportArtboard(artboard) {

  var item,
      name,
      prettyName,
      doc,
      rect,
      bbox;

  app.activeDocument = sourceDoc;
  rect = artboard.artboardRect;

  bbox = sourceDoc.pathItems.rectangle(rect[1], rect[0], rect[2]-rect[0], rect[1]-rect[3]);
  bbox.stroked = false;
  bbox.name = '__ILSVGEX__BOUNDING_BOX';

  name = artboard.name;
  prettyName = name.slice(0, -4).replace(/[^\w\s]|_/g, " ").replace(/\s+/g, "-").toLowerCase();

  app.activeDocument = exportDoc;

  for (var i = 0, len = sourceDoc.pageItems.length; i < len; i++) {
    item = sourceDoc.pageItems[i];

    if(hitTest(item, bbox) && !item.locked && !anyParentLocked(item) ) {
      item.duplicate(exportDoc, ElementPlacement.PLACEATEND);
    }
  }

  app.activeDocument = exportDoc;
  exportDoc.pageItems.getByName('__ILSVGEX__BOUNDING_BOX').remove();

  // Check if artboard is blank, clean up and exit
  if(!exportDoc.pageItems.length) {
    sourceDoc.pageItems.getByName('__ILSVGEX__BOUNDING_BOX').remove();
    return;
  }

  for (i = 0, len = exportDoc.pageItems.length; i < len; i++) {
    item = exportDoc.pageItems[i];

    /*
     * For the moment, all pageItems are made visible and exported
     * unless they are locked. This may not make sense, but it'll
     * work for now.
     */
    item.hidden = false;
  }

  exportDoc.layers[0].name = prettyName;
  exportSVG(exportDoc, name, bbox.visibleBounds, svgOptions);

  sourceDoc.pageItems.getByName('__ILSVGEX__BOUNDING_BOX').remove();
}

function exportLayer(layer) {

  var item,
      startX,
      startY,
      endX,
      endY,
      name,
      prettyName,
      itemName,
      layerItems;

  layerItems = [];

  for (var i = 0, len = layer.pageItems.length; i < len; i++) {
    layerItems.push(layer.pageItems[i]);
  }
  recurseItems(layer.layers, layerItems);

  if (!layerItems.length) {
    return;
  }

  name = layer.name;
  prettyName = name.slice(0, -4).replace(/[^\w\s]|_/g, " ").replace(/\s+/g, "-").toLowerCase();

  for (i = 0, len = layerItems.length; i < len; i++) {
    app.activeDocument = sourceDoc;
    item = layerItems[i];
    var newItem = item.duplicate(exportDoc, ElementPlacement.PLACEATEND);
    newItem.top = Math.floor(newItem.top - ((CONST.ARTBOARD_SIZE - newItem.height) / 2));
    newItem.left = Math.floor(newItem.left - ((CONST.ARTBOARD_SIZE - newItem.width) / 2));
  }

  app.activeDocument = exportDoc;

  for (i = 0, len = exportDoc.pageItems.length; i < len; i++) {

    item = exportDoc.pageItems[i];

    /*
     * For the moment, all pageItems are made visible and exported
     * unless they are locked. This may not make sense, but it'll
     * work for now.
     */
    item.hidden = false;

    if(item.name) {
      itemName = item.name;
      if(itemName.split('.').pop() === 'svg') {
        itemName = itemName.slice(0, -4);
      }
      itemName = itemName.replace(/[^\w\s]|_/g, " ").replace(/\s+/g, "-").toLowerCase()

      item.name = prettyName + '-' + itemName;
    }
    /*
     * We want the smallest startX, startY for obvious reasons.
     * We also want the smallest endX and endY because Illustrator
     * Extendscript treats this coordinate reversed to how the UI
     * treats it (e.g., -142 in the UI is 142).
     *
     */
    startX = (!startX || startX > item.visibleBounds[0]) ? item.visibleBounds[0] : startX;
    startY = (!startY || startY < item.visibleBounds[1]) ? item.visibleBounds[1] : startY;
    endX = startX + CONST.ARTBOARD_SIZE; // (!endX || endX < item.visibleBounds[2]) ? item.visibleBounds[2] : endX;
    endY = startY - CONST.ARTBOARD_SIZE; // (!endY || endY > item.visibleBounds[3]) ? item.visibleBounds[3] : endY;
  }
  
  exportDoc.layers[0].name = name.slice(0, -4);
  exportSVG(exportDoc, name, [startX, startY, endX, endY], svgOptions);
}

function exportItem(item) {

  var name,
      newItem;

  name = item.name;
  newItem = item.duplicate(exportDoc, ElementPlacement.PLACEATEND);
  newItem.hidden = false;
  newItem.name = item.name.slice(0, -4);
  app.activeDocument = exportDoc;

  exportDoc.layers[0].name = ' ';
  exportSVG(exportDoc, name, item.visibleBounds, svgOptions);
}

function exportSVG(doc, name, bounds, exportOptions) {

  var file;
  doc.artboards[0].artboardRect = bounds;
  
  centerGroupItems(doc);
  
  file = new File(exportFolder.fsName + '/' + name);
  
  doc.exportFile(file, ExportType.SVG, exportOptions);
}

function centerGroupItems(doc) {

    var board, items, group, 
        width, hieght, 
        theSize, x1, y1, x2, y2;
    
//     theSize = CONST.ARTBOARD_SIZE;

    board  = doc.artboards[0]; // doc.artboards.getActiveArtboardIndex()];
    bounds = board.artboardRect;
    
    // The bounds are plotted on a Cartesian Coordinate System.
    // So a 32 x 32 pixel artboard with have the following coords:
    // (assumes the artboard is positioned at 0, 0)
    // x1 = -16, y1 = 16, x2 = 16, y2 = -16

    x1 = bounds[0];
    y1 = bounds[1];
    x2 = bounds[0] + CONST.ARTBOARD_SIZE;
    y2 = bounds[1] - CONST.ARTBOARD_SIZE;
    
    board.artboardRect = [x1, y1, x2, y2];
    
    items = doc.layers[0].groupItems;

    for (i=0; i<items.length; i++) {
        
        try {
            item = items[i];
        
            width  = item.width;
            height = item.height;
        
            item.selected = true;
    
            // Insanely, objects are positioned by top and left coordinates and not 
            // centered using the X/Y formmat above so we have to move the item 
            // from the center point of the item
  
            item.top  = Math.floor(y1 - ((CONST.ARTBOARD_SIZE - height) / 2));
            item.left = Math.ceil(x1 + ((CONST.ARTBOARD_SIZE - width) / 2));
            logger.info("[centerGroupItems()] Centering item " + item.name + " to: {top: " + item.top + ", left: " + item.left + "}");

            redraw();
        }
        catch(e) {
            logger.warn(e);
        }
    }

    var zoom = doc.activeView.zoom;
    doc.activeView.zoom = zoom + .01;
    doc.activeView.zoom = zoom;
}

function getNamedItems(doc) {
  var item,
      items,
      doclayers,
      artboards;

  items = [];

  // Check all artboards for name match
  artboards = [];

  for (var i = 0, len = doc.artboards.length; i < len; i++) {
    item = doc.artboards[i];
    if (item.name.split('.').pop() === 'svg') {
      items.push(item);
    }
  }

  // Check all layers for name match
  doclayers = [];
  recurseLayers(doc.layers, doclayers);

  for (i = 0, len = doclayers.length; i < len; i++) {
    item = doclayers[i];

    if (item.name.split('.').pop() === 'svg' && !item.locked && !anyParentLocked(item)) {
      items.push(item);
    }
  }

  // Check all pageItems for name match
  for (i = 0, len = doc.pageItems.length; i < len; i++) {
    item =  doc.pageItems[i];

    if (item.name.split('.').pop() === 'svg' && !item.locked && !anyParentLocked(item)) {
      items.push(item);
    }
  }

  return items;
}

function recurseLayers(layers, layerArray) {

  var layer;

  for (var i = 0, len = layers.length; i < len; i++) {
    layer = layers[i];
    if (!layer.locked) {
      layerArray.push(layer);
    }
    if (layer.layers.length > 0) {
      recurseLayers(layer.layers, layerArray);
    }
  }
}

function recurseItems(layers, items) {

  var layer;

  for (var i = 0, len = layers.length; i < len; i++) {
    layer = layers[i];
    if (layer.pageItems.length > 0 && !layer.locked) {
      for (var j = 0, plen = layer.pageItems.length; j < plen; j++) {
        if (!layer.pageItems[j].locked) {
          items.push(layer.pageItems[j]);
        }
      }
    }

    if (layer.layers.length > 0) {
      recurseItems(layer.layers, items);
    }
  }
}

function anyParentLocked(item) {
  while (item.parent) {
    if (item.parent.locked) {
      return true;
    }
    item = item.parent;
  }

  return false;
}


/* Code derived from John Wundes (john@wundes.com) www.wundes.com
 * Copyright (c) 2005 wundes.com
 * All rights reserved.
 *
 * This code is derived from software contributed to or originating on wundes.com
 */

function hitTest(a,b) {
  if(!hitTestX(a,b)) {
    return false;
  }
  if(!hitTestY(a,b)) {
    return false;
  }
  return true;
}

function hitTestX(a,b) {
  var p1 = a.visibleBounds[0];
  var p2 = b.visibleBounds[0];
  if((p2<=p1 && p1<=p2+b.width) || (p1<=p2 && p2<=p1+a.width)) {
     return true;
  }
  return false;
}

function hitTestY(a,b) {
  var p3 = a.visibleBounds[1];
  var p4 = b.visibleBounds[1];
  if((p3>=p4 && p4>=(p3-a.height)) || (p4>=p3 && p3>=(p4-b.height))) {
    return true;
  }
  return false;
}

function getLogger() {
    return {
        info: function(txt) {
            logger._out("[INFO] " + txt);
        },
        warn: function(txt) {
            logger._out("[WARN] " + txt);
        },
        error: function(txt) {
            logger._out("[ERROR] " + txt);
        },
        fatal: function(txt) {
            logger._out("[FATAL] " + txt);
        },
        _out: function(txt) {
            if (logging == 0) return;
            var file = new File(CONST.LOG_FILE_PATH);  
            file.open("e", "TEXT", "????");  
            file.seek(0,2);  
            $.os.search(/windows/i)  != -1 ? file.lineFeed = 'windows'  : file.lineFeed = 'macintosh';
            file.writeln("[" + new Date().toUTCString() + "] " + txt);  
            file.close(); 
        }
    }
}

Date.prototype.format = function (format, utc) {
    return formatDate(this, format, utc);
};
function formatDate(date, format, utc) {
    var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    function ii(i, len) { var s = i + ""; len = len || 2; while (s.length < len) s = "0" + s; return s; }

    var y = utc ? date.getUTCFullYear() : date.getFullYear();
    format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
    format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
    format = format.replace(/(^|[^\\])y/g, "$1" + y);

    var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
    format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
    format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
    format = format.replace(/(^|[^\\])M/g, "$1" + M);

    var d = utc ? date.getUTCDate() : date.getDate();
    format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
    format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
    format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
    format = format.replace(/(^|[^\\])d/g, "$1" + d);

    var H = utc ? date.getUTCHours() : date.getHours();
    format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
    format = format.replace(/(^|[^\\])H/g, "$1" + H);

    var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
    format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
    format = format.replace(/(^|[^\\])h/g, "$1" + h);

    var m = utc ? date.getUTCMinutes() : date.getMinutes();
    format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
    format = format.replace(/(^|[^\\])m/g, "$1" + m);

    var s = utc ? date.getUTCSeconds() : date.getSeconds();
    format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
    format = format.replace(/(^|[^\\])s/g, "$1" + s);

    var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])f/g, "$1" + f);

    var T = H < 12 ? "AM" : "PM";
    format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
    format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

    var t = T.toLowerCase();
    format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
    format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

    var tz = -date.getTimezoneOffset();
    var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
    if (!utc)
    {
        tz = Math.abs(tz);
        var tzHrs = Math.floor(tz / 60);
        var tzMin = tz % 60;
        K += ii(tzHrs) + ":" + ii(tzMin);
    }
    format = format.replace(/(^|[^\\])K/g, "$1" + K);

    var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
    format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
    format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

    format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
    format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

    format = format.replace(/\\(.)/g, "$1");

    return format;
};

function millisecondsToStr(milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding (number) {
        return (number > 1) ? 's' : '';
    }

    var temp = Math.floor(milliseconds / 1000);
    var years = Math.floor(temp / 31536000);
    if (years) {
        return years + ' year' + numberEnding(years);
    }
    //TODO: Months! Maybe weeks? 
    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
        return days + ' day' + numberEnding(days);
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
        return hours + ' hour' + numberEnding(hours);
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
        return minutes + ' minute' + numberEnding(minutes);
    }
    var seconds = temp % 60;
    if (seconds) {
        return seconds + ' second' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
};