#target Illustrator  

var logging = true;
var logger = getLogger();
var explain = getExplainer();
var startTime;

var CONST = {
    LOG_FILE_PATH: "~/Desktop/ai-sort-and-reorder-log.txt",
    CHOOSE_FOLDER: "Where do you want to save the SVG files?",
    NO_DOCUMENT: "Please create a document with something in it before running this script.",
    NO_ITEMS: "No selection",
    VDELTA: 100,
    HDELTA: 266,
    BASE_NAME: "glyph-icon",
    DO_SORT: false
}

function main() {  

    startTime = new Date().getTime();
  
    // My function variables…  
    var doc, i, n, boards, bounds, 
        items, _items, srcLayer, newLayer,
        count, sorted, first, firstIndex,
        stop, start, max, svgFolder; 

    if (app.documents.length == 0) {
        alert(CONST.NO_DOCUMENT);
        logger.error(CONST.NO_DOCUMENT);
        throw new Error(CONST.NO_DOCUMENT);
        return;
    }

    doc      = app.activeDocument;
    srcLayer = doc.layers[0];
    items    = srcLayer.groupItems;
    count    = items.length;
    sorted   = [];
    
    _items = [];
    for (i=0; i<items.length; i++) {
        item = items[i];
        item.name = CONST.BASE_NAME + "-" + i + ".svg";
        _items.push(item);
    }
    
    alert("Done!");
    return;
    
    n = 0;
    max = 100000;
    start = 0;
    stop = _items.length;
    
    if (CONST.DO_SORT) {
        _items.sort(function(a, b) {
            if (Math.abs(a.top - b.top) < CONST.VDELTA) {
                if (a.left < b.left) {

                    explain.samerow(a.name, b.name);
                    return -1;
                }
                else {
            
                    explain.samerownoswap(a.name, b.name);
                    return 0;
                }
            }
            else {
                explain.notsamerow(a.name, b.name);
        
                if (a.top > b.top) {
            
                    explain.aboveswap(
                        a.name, 
                        b.name, 
                        Math.ceil(Math.abs(a.top - b.top) / ( CONST.VDELTA * 2))
                    );
            
                    return -1;
                }
                else {
                    explain.belownoswap(
                        a.name, 
                        b.name, 
                        Math.ceil(Math.abs(a.top - b.top) / ( CONST.VDELTA * 2))
                    );
                    return 0;
                }
            }
        });
    }
    
//     do {
//         first = _items[0];
// 
//         explain.next("A", first.name);
//         
//         firstIndex = 0;
//         for (i=1; i<_items.length; i++) {
//             item = _items[i];
//             
//             explain.next("B", item.name);
//             explain.comparing(first.name, item.name);
//             explain.top("B", item.name, item.top);
//             explain.top("A", first.name, first.top);
//             explain.distance(first.name, item.name, Math.abs(item.top - first.top));
//             
//             if (Math.abs(item.top - first.top) < CONST.VDELTA) {
//                 if (item.left < first.left) {
//                     
//                     explain.samerow(item.name, first.name);
//                     
//                     first = item;
//                     firstIndex = i;
//                 }
//                 else {
//                     explain.samerownoswap(item.name, first.name);
//                 }
//             }
//             else {
//                 explain.notsamerow(item.name, first.name);
//                 
//                 if (item.top > first.top) {
//                     
//                     explain.aboveswap(
//                         item.name, 
//                         first.name, 
//                         Math.ceil(Math.abs(item.top - first.top) / ( CONST.VDELTA * 2))
//                     );
//                     
//                     first = item;
//                     firstIndex = i;
//                 }
//                 else {
//                     explain.belownoswap(
//                         item.name, 
//                         first.name, 
//                         Math.ceil(Math.abs(item.top - first.top) / ( CONST.VDELTA * 2))
//                     );
//                 }
//             }
// 
//         }
// 
//         sorted.push(first);
//         _items.splice(firstIndex, 1);
//         n++;
//         if (n > max) break;
//     }
//     while (sorted.length < count && _items.length > 0);
    
//     sorted.reverse();
//     dupes = [];
//     for (i=0; i<sorted.length; i++) {
//         item = sorted[i];
//         newLayer = doc.layers.add();
//         newLayer.name = item.name + ".svg";
//         dupes.push(item.duplicate(newLayer, ElementPlacement.PLACEATBEGINNING));
//     }

    // sorted.reverse();
    dupes = [];
    for (i=0; i<_items.length; i++) {
        item = _items[i];
        newLayer = doc.layers.add();
        newLayer.name = item.name + ".svg";
        dupes.push(item.duplicate(newLayer, ElementPlacement.PLACEATBEGINNING));
    }

    
    // TODO: Remove from production code
//     dupes.reverse();
    if (CONST.DO_SORT) doHighlights(dupes = dupes.reverse());

    // alert("Done!");
    
    logger.info("Execution time: " + millisecondsToStr((new Date()).getTime() - startTime));

};

function getExplainer() {
    if (typeof(logging) == "undefined" || ! logging) return;
    if (typeof(logger) == "undefined") {
        alert("Explainer requires the logger class");
        logger = {info: function(){}}
    }
    return {
        next: function(a, name) {
            logger.info("Getting next item [" + a + "] (" + name + ")");
        },
        comparing: function(a, b) {
            logger.info("Comparing [A] (" + a + ") and [B] (" + b + ")");
        },
        top: function(a, name, top) {
            logger.info("[" + a + "] (" + name + ") top is " + top + " px");
        },
        distance: function(a, b, distance) {
            logger.info(
                "Vertical distance between [A] (" 
                + a + ") and [B] (" 
                + b + ") is " 
                + distance
                + " px"
            );
        },
        samerow: function(b, a) {
            logger.info(
                "[B] (" + b + ") is on the same row and to the left of [A] (" + a + "), so we swap them"
            );
        },
        samerownoswap: function(b, a) {
            logger.info(
                "[B] (" + b + ") is on the same row, but to the right of [A] (" + a + "), so we don't swap them"
            );
        },
        notsamerow: function(b, a) {
            logger.info(
                "[B] (" + b + ") and [A] (" + a + ") are NOT on the same row, but we still might swap them"
            );
        },
        aboveswap: function(b, a, rdiff) {
            rstr = rdiff > 1 ? " rows" : " row";
            logger.info(
                "[B] (" + b + ") is " + rdiff + rstr + " above [A] (" + a + ") , so we swap them"
            );
        },
        belownoswap: function(b, a, rdiff) {
            rstr = rdiff > 1 ? " rows" : " row";
            logger.info(
                "[B] (" + b + ") is " + rdiff + rstr + " below [A] (" + a + ") , so we don't swap them"
            );
        }
    }
};

function doHighlights(items) {
    try {
//         items[0].pathItems[0].fillColor = rgbColor(255, 0, 0);
//         items[items.length-1].pathItems[0].fillColor = rgbColor(0, 255, 0);
        
        var red   = rgbColor(255, 0, 0);
        for (i=0; i<items[0].pathItems.length; i++) {
            items[0].pathItems[i].fillColor = red;
        }
        
        var green = rgbColor(0, 255, 0);
        for (i=0; i<items[items.length-1].pathItems.length; i++) {
            items[items.length-1].pathItems[i].fillColor = green;
        }
        var names = [];
        for (i=0; i<items.length; i++) {
            names.push(items[i].name);
        }
        logger.info("The visible order is: " + names.join(", "));
    }
    catch(e) {
        logger.error("Could not highlight results because: " + e);
    }
};

function rgbColor(r, g, b) {
    var rgb = new RGBColor();
    rgb.red = r;
    rgb.green = g;
    rgb.blue = b;
    return rgb;
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


function alignToNearestPixel(sel) {
    
    try {
        if (typeof sel != "object") {
        
            logger.error(CONST.NO_ITEMS);
        } 
        else {
        
            for (i = 0 ; i < sel.length; i++) {
                sel[i].left = Math.round(sel[i].left);
                sel[i].top = Math.round(sel[i].top);
            }
            redraw();
        }
    }
    catch(e) {
        logger.error(e);
    }
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

main(); 