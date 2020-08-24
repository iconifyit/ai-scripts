/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Scott Lewis
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

var Utils = {};

/**
 * Add global progress bar.
 */
Utils.progress = {};

/**
 * Get a value from an object or array.
 * @param subject
 * @param key
 * @param _default
 * @returns {*}
 */
Utils.get = function( subject, key, dfault ) {
    var value = dfault;
    if (typeof subject == 'object' && subject.hasOwnProperty(key)) {
        value = subject[key];
    }
    return value;
};


/**
 * Turn off displaying alerts.
 */
Utils.displayAlertsOff = function() {
    userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
};

/**
 * Turn on displaying alerts.
 */
Utils.displayAlertsOn = function() {
    try {
        userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
    }
    catch(e) {/* Exit Gracefully */}
}

/**
 * Gets the screen dimensions and bounds.
 * @returns {{left: *, top: *, right: *, bottom: *}}
 * ,,-605,263,1893,-1048
 */
Utils.getScreenSize = function() {

    try {
        if (view = app.activeDocument.views[0] ) {
            var zoom = view.zoom;
            view.zoom = 1;
            var screenSize = {
                left   : parseInt(view.bounds[0]),
                top    : parseInt(view.bounds[1]),
                right  : parseInt(view.bounds[2]),
                bottom : parseInt(view.bounds[3]),
                width  : parseInt(view.bounds[2]) - parseInt(view.bounds[0]),
                height : parseInt(view.bounds[1]) - parseInt(view.bounds[3])
            };
            view.zoom = zoom;
            return screenSize;
        }
    }
    catch(e) {/* Exit Gracefully */}
    return null;
};

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
Utils.getRandomInt = function(min, max, omit) {

    var x, num;

    if (typeof(omit) == 'number')    omit = [omit];
    if (typeof(omit) == 'undefined') omit = [];
    min = Math.ceil(min);
    max = Math.floor(max);
    num = Math.floor(Math.random() * (max - min + 1)) + min;
    x = 0;
    while (omit.indexOf(num) != -1 && x <= 9999) {
        x++;
        num = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return num;
};

/**
 * Fisher-Yates shuffle an array.
 * @link https://www.frankmitchell.org/2015/01/fisher-yates/
 * @param array
 */
Utils.shuffleArray_1 = function(_array) {
    var i = 0,
        j = 0,
        temp = null;

    for (i = _array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1))
        temp = _array[i]
        _array[i] = _array[j]
        _array[j] = temp
    }

    return _array;
};

Utils.shuffleArray_2 = function(array) {

    var currentIndex = array.length;
    var temporaryValue,
        randomIndex,
        randomValue,
        currentValue;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex  = Math.floor(Math.random() * currentIndex);
        currentIndex = currentIndex - 1;

        // And swap it with the current element.
        temporaryValue      = array[currentIndex];
        randomValue         = array[randomIndex];
        currentValue        = array[currentIndex];

        array[currentIndex] = randomValue;
        array[randomIndex]  = temporaryValue;
    }

    return array;

};

Utils.knuthShuffle = function(arr) {
    var rand, temp, i;

    var len = arr.length - 1;

    for (i = len; i > 0; i--) {
        rand = Math.floor((i + 1) * Math.random());//get random between zero and i (inclusive)
        temp = arr[rand]; //swap i and the zero-indexed number
        arr[rand] = arr[i];
        arr[i] = temp;
    }
    return arr;
};

/**
 * Saves the file in AI format.
 * @param {document} doc        The document object to save
 * @param {string}   path       The file destination path
 * @param {int}      aiformat   The Adobe Illustrator format (version)
 * @return void
 */
Utils.saveFileAsAi = function( doc, path, aiformat ) {
    if (app.documents.length > 0) {
        var theDoc  = new File(path);
        var options = new IllustratorSaveOptions();
        options.compatibility = aiformat;
        options.flattenOutput = OutputFlattening.PRESERVEAPPEARANCE;
        options.pdfCompatible = true;
        doc.saveAs(theDoc, options);
    }
};

/**
 *
 * @param str
 * @returns {XML|string|void}
 */
Utils.trim = function(str) {
    return str.replace(/^\s+|\s+$/g, '');
};

/**
 * Cleans up the filename/artboardname.
 * @param   {String}    name    The name to filter and reformat.
 * @returns  {String}            The cleaned up name.
 */
Utils.filterName = function(name) {
    return decodeURIComponent(name).replace(' ', '-');
};

/**
 * Sorts a file list.
 * @param theList
 * @returns {*}
 */
Utils.sortFileList = function(theList) {
    /**
     * Callback for sorting the file list.
     * @param   {File}  a
     * @param   {File}  b
     * @returns {number}
     */
    theList.sort(function (a, b) {
        var nameA = Utils.filterName(a.name.toUpperCase());
        var nameB = Utils.filterName(b.name.toUpperCase());
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        // names must be equal
        return 0;
    });
    return theList;
};

/**
 * Sort first by set then my file.
 * @param fileList
 * @returns {*[]}
 */
Utils.sortBySetAndName = function(fileList) {

    var sets   = {},
        keys   = [],
        sorted = [];

    try {

        for (var i = 0; i < fileList.length; i++) {
            var file = fileList[i];
            if (keys.indexOf(file.parent.name) == -1) {
                keys.push(file.parent.name);
                logger('Adding key ' + file.parent.name);
            }
        }

        keys.sort();

        for (var i = 0; i < keys.length; i++) {
            sets[keys[i]] = [];
        }

        for (var i = 0; i < fileList.length; i++) {
            sets[file.parent.name].push(fileList[i]);
        }

        for (setName in sets) {
            sets[setName] = Utils.sortFileList(sets[setName]);
            sorted = Array.prototype.concat(sorted, sets[setName]);
        }
    }
    catch(e) { alert(e) }

    return sorted;
};

/**
 * Logging for this script.
 * @param <string> The logging text
 * @return void
 */
Utils.logger = function(txt) {

    if (CONFIG.LOGGING == 0) return;
    Utils.folder( CONFIG.LOG_FOLDER );
    Utils.write_file(CONFIG.LOG_FILE_PATH, "[" + new Date().toUTCString() + "] " + txt);
};

/**
 * Get a unique file name that avoids name colllisions with existing files.
 * @param targetFolder
 * @param fileName
 * @returns {string|*}
 */
Utils.getUniqueFileName = function(targetFolder, fileName) {

    var newFile, newFileName;

    newFile = targetFolder + "/" + fileName;

    if (new File(newFile).exists) {
        newFileName = Utils.shortUUID() + "@" + fileName;
        logger.info(newFileName);
        newFile = targetFolderPath + "/" + newFileName;
    }

    return newFile;
};

/**
 * Logging for this script.
 * @param {string}  path        The file path
 * @param {string}  txt         The text to write
 * @param {bool}    replace     Replace the file
 * @return void
 */
Utils.write_file = function( path, txt, replace ) {
    try {
        var file = new File( path );
        if (replace && file.exists) {
            file.remove();
            file = new File( path );
        }
        file.open("e", "TEXT", "????");
        file.seek(0,2);
        $.os.search(/windows/i)  != -1 ? file.lineFeed = 'windows'  : file.lineFeed = 'macintosh';
        file.writeln(txt);
        file.close();
        return true;
    }
    catch(ex) {
        try {
            file.close();
        }
        catch(ex) {/* Exit Gracefully*/}
        throw ex;
    }
};

/**
 * Logging for this script.
 * @param {string}  path        The file path
 * @param {string}  txt         The text to write
 * @param {bool}    replace     Replace the file
 * @return void
 */
Utils.write_and_call = function( path, txt, callback ) {
    try {
        var file = new File( path );
        if (file.exists) {
            file.remove();
            file = new File( path );
        }
        file.open("e", "TEXT", "????");
        file.seek(0,2);
        $.os.search(/windows/i)  != -1 ? file.lineFeed = 'windows'  : file.lineFeed = 'macintosh';
        file.writeln(txt);
        file.close();
        callback.call(file);
    }
    catch(ex) {
        try {
            file.close();
        }
        catch(ex) {/* Exit Gracefully*/}
        throw ex;
    }
};

/**
 *
 * @param path
 * @param json
 * @param replace
 */
Utils.write_json_file = function( path, json, replace ) {
    try {
        Utils.write_file(path, Utils.objectToString(json), replace);
    }
    catch(ex) {
        Utils.logger('savePresetsFile - ' + ex);
    }
};

/**
 * Reads the contents of a file.
 * @param filepath
 * @returns {string}
 */
Utils.read_file = function( filepath ) {

    var content = "";

    var theFile = new File(filepath);

    if (theFile) {

        try {
            if (theFile.alias) {
                while (theFile.alias) {
                    theFile = theFile.resolve().openDlg(
                        LANG.CHOOSE_FILE,
                        txt_filter,
                        false
                    );
                }
            }
        }
        catch(ex) {
            dialog.presetsMsgBox.text = ex.message;
        }

        try {
            theFile.open('r', undefined, undefined);
            if (theFile !== '') {
                content = theFile.read();
                theFile.close();
            }
        }
        catch(ex) {

            try { theFile.close(); }catch(ex){};
            logger("read_file - " + ex);
        }
    }

    return content;
};

/**
 *
 * @param filepath
 * @returns {*}
 */
Utils.read_json_file = function(filepath) {
    var contents, result;
    try {
        if ( contents = Utils.read_file( filepath ) ) {
            result = eval("(" + contents + ")" );
            if ( typeof(result) != 'object') {
                result = null;
            }
        }
    }
    catch(ex) {
        logger('doUpdatePresets - ' + ex.message);
    }
    return result;
};

/**
 *
 * @param filepath
 * @param mustconfirm
 */
Utils.deleteFile = function( filepath, mustconfirm ) {
    try {
        if (mustconfirm && ! confirm(LANG.CONFIRM_DELETE_PRESET)) {
            return;
        }
        new File(filepath).remove();
    }
    catch(ex) {
        Utils.logger('Utils.deleteFile - ' + ex.message);
    }
};

/**
 * Initialize a folder.
 */
Utils.folder = function( path ) {
    var theFolder = new Folder( path );
    if (! theFolder.exists) {
        theFolder.create();
    }
    return theFolder;
};

/**
 * Get all files in sub-folders.
 * @param srcFolder
 * @returns {Array}
 */
Utils.getFilesInSubfolders = function( srcFolder ) {

    var allFiles, theFolders, svgFileList;

    if ( ! srcFolder instanceof Folder) return;

    allFiles    = srcFolder.getFiles();
    theFolders  = [];
    svgFileList = [];

    for (var x=0; x < allFiles.length; x++) {
        if (allFiles[x] instanceof Folder) {
            theFolders.push(allFiles[x]);
        }
    }

    if (theFolders.length == 0) {
        svgFileList = srcFolder.getFiles(/\.svg$/i);
    }
    else {
        for (var x=0; x < theFolders.length; x++) {
            fileList = theFolders[x].getFiles(/\.svg$/i);
            for (var n = 0; n<fileList.length; n++) {
                svgFileList.push(fileList[n]);
            }
        }
    }

    return svgFileList;
};

/**
 * Format the date in YYYY-MM-DD format
 * @param string date  The date in timestring format
 * @return date string in YYYY-MM-DD format (2015-10-06)
 */
Utils.doDateFormat = function(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

Utils.dateFormat = Utils.doDateFormat;

/**
 * Stringify an object.
 * @param obj
 * @returns {string}
 */
Utils.objectToString = function(obj) {
    var items = [];
    for (key in obj) {
        var value = obj[key];
        if (typeof(value) == "array") {
            for (var i=0; i<value.length; i++) {
                value[i] = '"' + value[i] + '"';
            }
            value = '[' + value.join(',') + ']';
        }
        else if (typeof(value) == 'object') {
            value = objectToString(value);
        }
        items.push('"' + key + '": "' + value + '"');
    }
    return "{" + items.join(',') + "}";
};

/**
 * Align objects to nearest pixel.
 * @param sel
 */
Utils.alignToNearestPixel = function(sel) {

    try {
        if (typeof sel != "object") {
            Utils.logger(LANG.NO_SELECTION);
        }
        else {
            for (i = 0 ; i < sel.length; i++) {
                sel[i].left = Math.round(sel[i].left);
                sel[i].top = Math.round(sel[i].top);
            }
            redraw();
        }
    }
    catch(ex) {
        Utils.logger(ex);
    }
};

/**
 * Test if all parents are visible & unlocked.
 * @param {object} item
 * @returns {boolean}
 */
Utils.isVisibleAndUnlocked = function(item) {
    return ! Utils.anyParentLocked(item) && ! Utils.anyParentHidden(item);
};

/**
 * Derived from P. J. Onori's Iconic SVG Exporter.jsx
 * @param {object} item
 * @returns {boolean}
 */
Utils.anyParentLocked = function(item) {
    while ( item.parent ) {
        if ( item.parent.locked ) {
            return true;
        }
        item = item.parent;
    }
    return false;
}

/**
 * Derived from P. J. Onori's Iconic SVG Exporter.jsx
 * @param {object} item
 * @returns {boolean}
 */
Utils.anyParentHidden = function(item) {
    while ( item.parent ) {
        if ( item.parent.hidden ) {
            return true;
        }
        item = item.parent;
    }
    return false;
};

/**
 * Groups selected items.
 * @param {Object} selection
 * @returns void
 */
//TODO: Does not currently work.
Utils.groupSelection = function(selection){
    if (selection.length > 0) {
        for (i = 0; i < selection.length; i++) {
            selection[i].moveToEnd(newGroup);
        }
    }
};

/**
 * Display a new progress bar.
 * @param maxvalue
 * @returns {*}
 */
Utils.showProgressBar = function(maxvalue) {

    var top, right, bottom, left;

    if ( bounds = Utils.getScreenSize() ) {
        left = Math.abs(Math.ceil((bounds.width/2) - (450/2)));
        top = Math.abs(Math.ceil((bounds.height/2) - (100/2)));
    }

    var progress = new Window("palette", 'Progress', [left, top, left + 450, top + 120]);
    progress.pnl = progress.add("panel", [10, 10, 440, 100], 'Progress');
    progress.pnl.progBar = progress.pnl.add("progressbar", [20, 45, 410, 60], 0, maxvalue);
    progress.pnl.progBarLabel = progress.pnl.add("statictext", [20, 20, 320, 35], "0 of " + maxvalue);

    progress.show();

    Utils.progress = progress;
};

/**
 * Hides and destroys the progress bar.
 */
Utils.hideProgressBar = function() {
    Utils.progress.hide();
    Utils.progress = null;
}
/**
 * Updates the progress bar.
 * @param progress
 * @returns {*}
 */
Utils.updateProgress = function(message) {
    Utils.progress.pnl.progBar.value++;
    var val = Utils.progress.pnl.progBar.value;
    var max = Utils.progress.pnl.progBar.maxvalue;
    Utils.progress.pnl.progBarLabel.text = val + ' of ' + max + ' ' + message;
    $.sleep(10);
    Utils.progress.update();
};

/**
 * Updates the progress bar.
 * @param message
 * @returns void(0)
 */
Utils.updateProgressMessage = function(message, val, max) {
    var val = val || Utils.progress.pnl.progBar.value;
    var max = max || Utils.progress.pnl.progBar.maxvalue;
    Utils.progress.pnl.progBarLabel.text = val + ' of ' + max + ' ' + message;
    $.sleep(10);
    Utils.progress.update();
};

/**
 * Updates the progress bar.
 * @param message
 * @returns void(0)
 */
Utils.progressBarText = function(message) {
    Utils.progress.pnl.progBarLabel.text = message;
    $.sleep(10);
    Utils.progress.update();
};

/**
 * Display a new progress bar.
 * @param maxvalue
 * @returns {*}
 */
function showProgressBar(maxvalue) {

    var top, right, bottom, left;

    if ( bounds = Utils.getScreenSize() ) {
        left = Math.abs(Math.ceil((bounds.width/2) - (450/2)));
        top = Math.abs(Math.ceil((bounds.height/2) - (100/2)));
    }

    var progress = new Window("palette", 'Progress', [left, top, left + 450, top + 100]);
    progress.pnl = progress.add("panel", [10, 10, 440, 100], 'Progress');
    progress.pnl.progBar = progress.pnl.add("progressbar", [20, 35, 410, 60], 0, maxvalue);
    progress.pnl.progBarLabel = progress.pnl.add("statictext", [20, 20, 320, 35], "0 of " + maxvalue);

    progress.show();

    return progress;
}

/**
 * Updates the progress bar.
 * @param progress
 * @returns {*}
 */
function updateProgress(progress, message) {
    progress.pnl.progBar.value++;
    var val = progress.pnl.progBar.value;
    var max = progress.pnl.progBar.maxvalue;
    progress.pnl.progBarLabel.text = val + ' of ' + max;
    $.sleep(10);
    progress.update();
    return progress;
}

/**
 * Add leading zeros to a number.
 * @param {integer} value
 * @param {integer} width
 * @returns {string}
 */
Utils.padNumber = function(value, width) {
    return ( value + 100000 ).toString().slice( width * -1 );
};

/**
 * Garbage Collect.
 */
Utils.gc = function() {
    try {$.gc()}catch(e){}
}
