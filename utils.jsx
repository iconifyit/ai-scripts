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
 * Get a value from an object or array.
 * @param subject
 * @param key
 * @param _default
 * @returns {*}
 */
Utils.get = function( subject, key, _default ) {
    var value = _default;
    if (typeof(subject[key]) != 'undefined') {
        value = subject[key];
    }
    return value;
};

/**
 * Gets the screen dimensions and bounds.
 * @returns {{left: *, top: *, right: *, bottom: *}}
 * ,,-605,263,1893,-1048
 */
Utils.getScreenSize = function() {

    if (view = app.activeDocument.views[0] ) {
        view.zoom = 1;
        return {
            left   : parseInt(view.bounds[0]),
            top    : parseInt(view.bounds[1]),
            right  : parseInt(view.bounds[2]),
            bottom : parseInt(view.bounds[3]),
            width  : parseInt(view.bounds[2]) - parseInt(view.bounds[0]),
            height : parseInt(view.bounds[1]) - parseInt(view.bounds[3])
        };
    }
    return null;
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
    }
    catch(ex) {
        try { file.close(); }
        catch(ex) {/* Exit Gracefully*/}
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