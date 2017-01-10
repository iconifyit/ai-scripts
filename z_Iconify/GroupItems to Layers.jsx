#target Illustrator  

var logging = true;
var logger  = getLogger();
var startTime;

var CONST = {
    LOG_FILE_PATH: "~/Desktop/ai-log-groups-to-layers.txt",
    CHOOSE_FOLDER: "Where do you want to save the SVG files?",
    CHOOSE_PREFIX: "Enter a prefix for layer names",
    NO_DOCUMENT:   "Please create a document with something in it before running this script.",
    NO_ITEMS:      "No selection",
    BASE_NAME:     "flat-icon"
}

function main() {  

    startTime = new Date().getTime();
  
    // My function variables…  
    var doc, i, n, x, boards, bounds, 
        items, _items, srcLayer, 
        newLayer, count, first, 
        firstIndex, stop, start, 
        svgFolder, baseName,
        maxTries; 
        
    baseName = "untitled";
    maxTries =  3;

    if (app.documents.length == 0) {
        alert(CONST.NO_DOCUMENT);
        logger.error(CONST.NO_DOCUMENT);
        throw new Error(CONST.NO_DOCUMENT);
        return;
    }
    
    x = 0;
    while ((baseName == "" || baseName == "untitled") && x < maxTries) {
        baseName = trim(prompt(CONST.CHOOSE_PREFIX));
        x++;
    }
    CONST.BASE_NAME = baseName;

    doc      = app.activeDocument;
    srcLayer = doc.layers[0];
    items    = srcLayer.groupItems;
    count    = items.length;
    
    _items = [];
    for (i=0; i<items.length; i++) {
        item = items[i];
        item.name = CONST.BASE_NAME + "-" + i + ".svg";
        _items.push(item);
    }
    
    n = 0;
    start = 0;
    stop = _items.length;

    dupes = [];
    for (i=0; i<_items.length; i++) {
        item = _items[i];
        newLayer = doc.layers.add();
        newLayer.name = item.name; // + ".svg";
        dupes.push(item.duplicate(newLayer, ElementPlacement.PLACEATBEGINNING));
    }

    logger.info("Execution time: " + millisecondsToStr((new Date()).getTime() - startTime));
    alert("Done!");
};

function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
};

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