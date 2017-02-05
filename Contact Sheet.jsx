/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Iconfinder
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
 * @author  Iconfinder <scott@iconfinder.com>
 * @date    2017-02-04
 *
 *  Installation:
 *
 *      1. Copy this file to Illustrator > Presets > Scripting
 *      2. Restart Adobe Illustrator
 *      3. Go to File > Scripts > Contact Sheet
 *      4. Follow the prompts
 *
 *  Usage:
 *
 *      This script will create a contact sheet of vector objects from a folder structure
 *      that you specify. The resulting contact sheet will have margins that are calculated
 *      thus: subtracting Left & Right Margins = (Page Width - Column Width * Column Count) / 2
 *      Top & Bottom Margins = (Page Height - Row Height * Row Count) / 2
 */

#target Illustrator

var originalInteractionLevel = userInteractionLevel;
userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

/**
 * Global strings object.
 * @type {{
 *     LABEL_DIALOG_WINDOW : string,
 *     NO_SELECTION        : string,
 *     LABEL_PG_WIDTH      : int,
 *     LABEL_PG_HEIGHT     : int,
 *     LABEL_COL_COUNT     : int,
 *     LABEL_ROW_COUNT     : int,
 *     LABEL_SCALE         : number,
 *     LABEL_FILE_NAME     : string,
 *     LABEL_LOGGING       : boolean,
 *     BUTTON_CANCEL       : string,
 *     BUTTON_OK           : string,
 *     DOES_NOT_EXIST      : string,
 *     LAYER_NOT_CREATED   : string,
 *     LABEL_SRC_FOLDER    : string,
 *     LABEL_CHOOSE_FOLDER : string,
 *     LABEL_INPUT         : string,
 *     LABEL_SIZE          : string,
 *     LABEL_OUTPUT        : string
 * }}
 */
var LANG = {
    /**
     * Dialog window label
     */

    LABEL_DIALOG_WINDOW: "Contact Sheet Settings",

    /**
     * Confirm delete preset
     */
    CONFIRM_DELETE_PRESET: 'Are you sure you want to delete the preset file?',

    /**
     * Choose file string
     */
    CHOOSE_FILE: "Choose a file",

    /**
     * No selection error string.
     */

    NO_SELECTION: "No selection",

    /**
     * Page width field label.
     */

    LABEL_PG_WIDTH: "Page Width:",

    /**
     * Page height field label.
     */

    LABEL_PG_HEIGHT: "Page Height:",

    /**
     * Column count field label.
     */

    LABEL_COL_COUNT: "Column Count:",

    /**
     * Row count field label.
     */

    LABEL_ROW_COUNT: "Row Count:",

    /**
     * Scale field label.
     */

    LABEL_SCALE: "Scale:",

    /**
     * File name field label.
     */

    LABEL_FILE_NAME: "File Name:",

    /**
     * Logging field label.
     */

    LABEL_LOGGING: "Logging?",

    /**
     * Cancel button text.
     */

    BUTTON_CANCEL: "Cancel",

    /**
     * OK button text.
     */

    BUTTON_OK: "Ok",

    /**
     * Save button text
     */

    BUTTON_SAVE: "Save Preset",

    /**
     * Delete button text
     */
    BUTTON_DELETE: "Delete",

    /**
     * Object does not exist error string.
     */

    DOES_NOT_EXIST: " does not exist",

    /**
     * Could not create layer error string.
     */

    LAYER_NOT_CREATED: "Could not create layer. ",

    /**
     * Source folder field label.
     */

    LABEL_SRC_FOLDER: "Source Folder",

    /**
     * Choose folder label.
     */

    LABEL_CHOOSE_FOLDER: "Choose Folder",

    /**
     * Input field label.
     */

    LABEL_INPUT: "Input",

    /**
     * Size field label.
     */

    LABEL_SIZE: "Size",

    /**
     * Output field label.
     */

    LABEL_OUTPUT: "Output",

    /**
     * Presets label
     */
    LABEL_PRESETS: "Presets"
};

/**
 * Global options object used to avoid having to pass a large number of variables in function calls.
 * @type {{
 *     ROWS          : int,
 *     COLS          : int,
 *     VOFF          : number,
 *     HOFF          : number,
 *     ROW_WIDTH     : number,
 *     COL_WIDTH     : number,
 *     FRM_WIDTH     : number,
 *     FRM_HEIGHT    : number,
 *     PG_WIDTH      : number,
 *     PG_HEIGHT     : number,
 *     PG_UNITS      : string,
 *     GUTTER        : number,
 *     SCALE         : number,
 *     AIFORMAT      : [*],
 *     SHRINK_TO_FIT : boolean,
 *     START_FOLDER  : string,
 *     FILENAME      : string,
 *     LOGGING       : boolean,
 *     LOG_FILE_PATH : string,
 *     DEBUG         : boolean,
 *     SKIP_COLS     : number,
 *     STRIP         : [*]
 * }}
 */
//#TODO: Add ability to save presets
var CONFIG = {

    /**
     * Number of rows
     */

    ROWS: 10,

    /**
     * Number of columns
     */

    COLS: 10,

    /**
     * Top & bottom page margins
     */

    VOFF: 64,

    /**
     * Left & Right page margins
     */

    HOFF: 64,

    /**
     * Row height. This is set programmatically.
     */

    ROW_WIDTH: 64,

    /**
     * Column Height. This is set programmatically.
     */

    COL_WIDTH: 64,

    /**
     * @deprecated
     */
    FRM_WIDTH: 64,

    /**
     * @deprecated
     */
    FRM_HEIGHT: 64,

    /**
     * Artboard width
     *
     * 10 columns 128 px wide, with 64 px page margins
     */

    PG_WIDTH: 1120, // 2112, // 1408, // 792, // 1060,

    /**
     * Artboard height
     *
     * 20 rows 128 px tall, with 64 px page margins
     */

    PG_HEIGHT: 1400, // 2688, // 1300, // 6000,

    /**
     * Not yet fully-implemented. Will support multiple units
     */

    PG_UNITS: "px",

    /**
     * @deprecated
     */

    GUTTER: 0,

    /**
     * Enter scale in percentage 1-100
     */

    SCALE: 100,

    /**
     * Illustrator version compatibility
     */

    AIFORMAT: Compatibility.ILLUSTRATOR10,

    /**
     * If the icon is larger than the cell size, shrink it to the cell size
     */

    SHRINK_TO_FIT: true,

    /**
     * Starting folder for folder selector dialog
     */

    START_FOLDER: "~/github/iconify",

    /**
     * The contact sheet file name
     */

    FILENAME: "contact-sheet",

    /**
     * Enable logging?
     */

    LOGGING: true,

    /**
     * Verbose logging output?
     */
    DEBUG: true,

    /**
     * @deprecated
     */

    SKIP_COLS: 0,

    /**
     * Not fully-implemented
     */

    STRIP: ["svg", "ai", "eps", "txt", "pdf"],

    /**
     * Presets folder path
     */
    PRESETS_FOLDER: '~/ai-contact-sheet/presets',

    /**
     * Log folder path
     */

    LOG_FOLDER: '~/ai-contact-sheet/logs/',

    /**
     * Log file location
     */

    LOG_FILE_PATH: '~/ai-contact-sheet/logs/' + doDateFormat(new Date()) + '-log.txt',

    /**
     * Default path separator
     */

    PATH_SEPATATOR: "/"
};

/**
 * Get a value from an object or array.
 * @param subject
 * @param key
 * @param _default
 * @returns {*}
 */
function get( subject, key, _default ) {
    var value = _default;
    if (typeof(subject[key]) != 'undefined') {
        value = subject[key];
    }
    return value;
}

/**
 * Gets the screen dimensions and bounds.
 * @returns {{left: *, top: *, right: *, bottom: *}}
 * ,,-605,263,1893,-1048
 */
function getScreenSize() {

    var view;
    var result = null;
    if ( view = app.activeDocument.views[0] ) {
        view.zoom = 1;
        result = {
            left   : parseInt(view.bounds[0]),
            top    : parseInt(view.bounds[1]),
            right  : parseInt(view.bounds[2]),
            bottom : parseInt(view.bounds[3]),
            width  : parseInt(view.bounds[2]) - parseInt(view.bounds[0]),
            height : parseInt(view.bounds[1]) - parseInt(view.bounds[3])
        };
    }
    return result;
}

/**
 * Displays the settings dialog
 *
 * Inputs:
 *    - skip columns
 *    - page width
 *    - page height
 *    - cell width
 *    - cell height
 *    - scale
 *    - logging enabled
 *
 *    - number of cols        = divide page width by cell width
 *    - number of rows        = divide page height by cell height
 *    - side margins          = (page width - (col count * col width))/2
 *    - top/bottom margins    = (page height - (row count * row width))/2
 *
 * @return boolean|Settings object
 */
function doDisplayDialog() {

    var dialogWidth  = 450;
    var dialogHeight = 410;

    var dialogLeft = 550;
    var dialogTop  = 300;

    if ( bounds = getScreenSize() ) {
        dialogLeft = Math.abs(Math.ceil((bounds.width/2) - (dialogWidth/2)));
        // dialogTop  = Math.abs(Math.ceil((bounds.height) - (dialogHeight/2)));
    }

    /**
     * Dialog bounds: [ Left, TOP, RIGHT, BOTTOM ]
     * default: //550, 350, 1000, 800
     */

    var dialog   = new Window(
        "dialog", LANG.LABEL_DIALOG_WINDOW, [
            dialogLeft,
            dialogTop,
            dialogLeft + dialogWidth,
            dialogTop + dialogHeight
        ]
    );
    var response = false;

    try {

        /**
         * Row height
         * @type {number}
         */
        var rh = 30;

        /**
         * Column width
         * @type {number}
         */
        var cw  = 112;

        var c1  = 28;
        var c1w = c1 + 112;

        var c2  = 142;
        var c2w = c2 + 50;

        var p1 = 16;
        var p2 = dialogWidth - 16;
        var p3 = (dialogWidth / 2 ) - 16
        var p4 = p3 + 16
        var p5 = p4 +  p3;

        var r1 = 40;

        dialog.sizePanel         = dialog.add('panel',      [p1, 16, p3, 200],    LANG.LABEL_SIZE);
        dialog.presetsPanel      = dialog.add('panel',      [p4, 16, p5, 200],    LANG.LABEL_PRESETS);
        dialog.outputPanel       = dialog.add('panel',      [p1, 200, p2, 290],   LANG.LABEL_OUTPUT);
        dialog.sourcePanel       = dialog.add('panel',      [p1, 290, p2, 350],   LANG.LABEL_INPUT);

        dialog.pageWidthLabel    = dialog.add("statictext", [c1, r1, c1w, 70],    LANG.LABEL_PG_WIDTH);
        dialog.pageWidth         = dialog.add("edittext",   [c2, r1, c2w, 70],    CONFIG.PG_WIDTH);
        dialog.pageWidth.active  = true;

        dialog.pageHeightLabel   = dialog.add("statictext", [c1, 70, c1w, 100],   LANG.LABEL_PG_HEIGHT);
        dialog.pageHeight        = dialog.add("edittext",   [c2, 70, c2w, 100],   CONFIG.PG_HEIGHT);
        dialog.pageHeight.active = true;

        dialog.colsLabel         = dialog.add("statictext", [c1, 100, c1w, 130],  LANG.LABEL_COL_COUNT);
        dialog.cols              = dialog.add("edittext",   [c2, 100, c2w, 130],  CONFIG.COLS);
        dialog.cols.active       = true;

        dialog.rowsLabel         = dialog.add("statictext", [c1, 130, c1w, 160],  LANG.LABEL_ROW_COUNT);
        dialog.rows              = dialog.add("edittext",   [c2, 130, c2w, 160],  CONFIG.ROWS);
        dialog.rows.active       = true;

        dialog.scaleLabel        = dialog.add('statictext', [c1, 160, c1w, 190],  LANG.LABEL_SCALE);
        dialog.scale             = dialog.add('edittext',   [c2, 160, c2w, 190],  CONFIG.SCALE);
        dialog.scale.active      = true;

        dialog.filenameLabel     = dialog.add('statictext', [c1, 220, c1w, 250],  LANG.LABEL_FILE_NAME);
        dialog.filename          = dialog.add('edittext',   [c2, 220, 334, 250],  '');
        dialog.filename.active   = true;

        dialog.logging           = dialog.add('checkbox',   [c1, 260, c1w, 330],  LANG.LABEL_LOGGING);
        dialog.logging.value     = CONFIG.LOGGING;

        dialog.folderBtn         = dialog.add('button',     [c1, 310, c1w, 340],  LANG.LABEL_CHOOSE_FOLDER, {name: 'folder'});

        dialog.srcFolder         = dialog.add('edittext',   [140, 310, 424, 340], '');
        dialog.srcFolder.active  = false;

        dialog.presets           = dialog.add("listbox",    [p4 + 16, 48, p5 - 16, 184]);

        dialog.cancelBtn         = dialog.add('button',     [232, 360, 332, 390], LANG.BUTTON_CANCEL, {name: 'cancel'});
        dialog.openBtn           = dialog.add('button',     [334, 360, 434, 390], LANG.BUTTON_OK, {name: 'ok'});
        dialog.saveBtn           = dialog.add('button',     [p1,  360, p1 + 120, 390], LANG.BUTTON_SAVE, {name: 'save'});

        dialog.saveBtn.enabled = false;
        dialog.openBtn.enabled = false;

        initPresetsList(dialog);
        initButtons();

        function captureSettings() {

            CONFIG.PG_WIDTH        = parseInt(dialog.pageWidth.text);
            CONFIG.PG_HEIGHT       = parseInt(dialog.pageHeight.text);
            CONFIG.LOGGING         = dialog.logging.value;
            CONFIG.SCALE           = parseInt(dialog.scale.text);
            CONFIG.COLS            = parseInt(dialog.cols.text);
            CONFIG.ROWS            = parseInt(dialog.rows.text);
            CONFIG.COL_WIDTH       = parseInt((CONFIG.PG_WIDTH - (CONFIG.HOFF * 2)) / CONFIG.COLS);
            CONFIG.ROW_HEIGHT      = parseInt((CONFIG.PG_HEIGHT - (CONFIG.VOFF * 2)) / CONFIG.ROWS);
            CONFIG.FRM_WIDTH       = CONFIG.COL_WIDTH;
            CONFIG.FRM_HEIGHT      = CONFIG.ROW_HEIGHT;
            CONFIG.OUTPUT_FILENAME = dialog.filename.text;
        }

        function initButtons() {

            dialog.saveBtn.enabled = false;
            dialog.openBtn.enabled = false;

            if (trim(dialog.pageWidth.text) == "") return;
            if (trim(dialog.pageHeight.text) == "") return;
            if (trim(dialog.cols.text) == "") return;
            if (trim(dialog.rows.text) == "") return;
            if (trim(dialog.scale.text) == "") return;
            if (parseInt(dialog.pageWidth.text) < 10 ) return;
            if (parseInt(dialog.pageHeight.text) < 10 ) return;
            if (parseInt(dialog.cols.text) < 10 ) return;
            if (parseInt(dialog.rows.text) < 10 ) return;
            if (parseInt(dialog.scale.text) < 1 ) return;

            dialog.saveBtn.enabled = true;

            if (trim(dialog.filename.text) == "") return;
            if (trim(dialog.srcFolder.text) == "") return;

            var testFolder = new Folder(dialog.srcFolder.text);
            if (! testFolder.exists) return;

            dialog.openBtn.enabled = true;
        }

        dialog.pageWidth.onChange  = initButtons;
        dialog.pageHeight.onChange = initButtons;
        dialog.cols.onChange       = initButtons;
        dialog.rows.onChange       = initButtons;
        dialog.scale.onChange      = initButtons;
        dialog.filename.onChange   = initButtons;
        dialog.srcFolder.onChange  = initButtons;

        dialog.cancelBtn.onClick = function() {
            dialog.close();
            response = false;
            return false;
        };

        dialog.saveBtn.onClick = function() {

            captureSettings();

            try {
                var filename = CONFIG.PG_WIDTH + "x" + CONFIG.PG_HEIGHT + "@" + CONFIG.SCALE + ".json";

                write_file(
                    CONFIG.PRESETS_FOLDER + "/" + filename,
                    objectToString({
                        "PG_WIDTH"  : CONFIG.PG_WIDTH,
                        "PG_HEIGHT" : CONFIG.PG_HEIGHT,
                        "COLS"      : CONFIG.COLS,
                        "ROWS"      : CONFIG.ROWS,
                        "SCALE"     : CONFIG.SCALE
                    }),
                    true
                );
            }
            catch(ex) {
                logger('dialog.saveBtn.onClick - ' + ex);
            }

            initPresetsList(dialog);
            initButtons();

            response = false;
        };

        dialog.folderBtn.onClick = function() {
            var srcFolder;
            if ( srcFolder = Folder.selectDialog( CONFIG.CHOOSE_FOLDER ) ) {

                if ( srcFolder.fs == 'Windows' ) {
                    CONFIG.PATH_SEPATATOR = "\\"
                }

                dialog.srcFolder.text = srcFolder.path + CONFIG.PATH_SEPATATOR + srcFolder.name;
                CONFIG.SRC_FOLDER = srcFolder;

                if ( trim(dialog.filename.text) == '' ) {
                    dialog.filename.text = srcFolder.name + '-merged.ai';
                    CONFIG.OUTPUT_FILENAME = dialog.filename.text;
                }
                initButtons();
            }
        };

        dialog.openBtn.onClick = function() {

            captureSettings();

            dialog.close();
            response = true;
            return true;
        };

        dialog.show();
    }
    catch(ex) {
        logger('doDisplayDialog - ' + ex);
        alert(ex);
    }
    return response;
}

/**
 * Initialize a folder.
 */
function initFolder( path ) {
    var theFolder = new Folder( path );
    if (! theFolder.exists) {
        theFolder.create();
    }
    return theFolder;
}

/**
 * Stringify an object.
 * @param obj
 * @returns {string}
 */
function objectToString(obj) {
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
}

/**
 * Initialize the presets select list
 * @param dialog
 */
function initPresetsList(dialog) {

    var presets, presetsFolder;

    try {
        presetsFolder = initFolder( CONFIG.PRESETS_FOLDER );

        if (presets = presetsFolder.getFiles("*.json")) {

            if (dialog.presets) {
                dialog.presets.removeAll();
            }

            for (i=0; i<presets.length; i++) {
                item = dialog.presets.add("item", (new File(presets[i])).name);
            }

            dialog.presets.onChange = function() {
                if ( dialog.presets.selection ) {
                    doUpdatePresets( dialog, CONFIG.PRESETS_FOLDER + "/" + dialog.presets.selection.text);
                }
            }

            dialog.presets.onDoubleClick = function() {
                if ( filename = dialog.presets.selection.text ) {
                    try {
                        if (confirm(LANG.CONFIRM_DELETE_PRESET)) {
                            new File(CONFIG.PRESETS_FOLDER + "/" + filename).remove();
                        }
                    }
                    catch(ex) {
                        logger('removePresetsFile - ' + ex.message);
                    }
                    initPresetsList(dialog);
                }
            }
        }
    }
    catch(ex) {
        logger('initPresetsList - ' + ex.message);
    }
}

/**
 * Opens a session
 *
 */
function doUpdatePresets( dialog, filepath ) {

    var contents;
    try {
        if ( contents = read_file( filepath ) ) {

            var obj = eval("(" + contents + ")" );

            if (typeof(obj) == "object") {

                dialog.pageWidth.text  = get(obj, 'PG_WIDTH',  '');
                dialog.pageHeight.text = get(obj, 'PG_HEIGHT', '');
                dialog.cols.text       = get(obj, 'COLS',      '');
                dialog.rows.text       = get(obj, 'ROWS',      '');
                dialog.scale.text      = get(obj, 'SCALE',     '');
            }
        }
        else {
            dialog.presetsMsgBox.text = "Presets file was empty";
            setTimeout(function() {
                dialog.presetsMsgBox.text = "";
            }, 5000 );
        }
    }
    catch(ex) {
        logger('doUpdatePresets - ' + ex.message);
    }

}

/**
 * Reads the contents of a file.
 * @param filepath
 * @returns {string}
 */
function read_file( filepath ) {

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
}

/**
 * Utility function to strip the file extension from a user-supplied file name
 * @param {string} filename
 * @return {string} The new file name sans extension
 */
function stripFileExtension(filename) {
    var bits = filename.split(".");
    var bit  = bits[bits.length-1];
    var found = false;
    if (bits.length > 1 && bit) {
        for (var ext in CONFIG.STRIP) {
            if (ext.toLowerCase() == bit.toLowerCase()) {
                found = true;
            }
        }
    }
    if (found) bits = bits[bits.length-1] = "";
    return bits.join(".");
}

/**
 * Main logic to create the contact sheet.
 * @return void
 */
function doCreateContactSheet() {

    var doc, fileList, srcFolder, svgFile, allFiles,
        theFolders, svgFileList, theLayer;

    var saveCompositeFile = false;

    if (! doDisplayDialog()) {
        return;
    }

    srcFolder = CONFIG.SRC_FOLDER;

    if ( srcFolder == null ) return;

    if (svgFileList = getFilesInSubfolders( srcFolder )) {

        if (trim(CONFIG.FILENAME) == "") {
            CONFIG.FILENAME = srcFolder.name.replace(" ", "-") + "-all";
        }

        app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

        doc = app.documents.add(
            DocumentColorSpace.RGB,
            CONFIG.PG_WIDTH,
            CONFIG.PG_HEIGHT,
            CONFIG.PG_COUNT = Math.ceil(svgFileList.length / (CONFIG.ROWS * CONFIG.COLS)),
            DocumentArtboardLayout.GridByCol,
            CONFIG.GUTTER,
            Math.round(Math.sqrt(Math.ceil(svgFileList.length / (CONFIG.ROWS * CONFIG.COLS))))
        );

        for (var i = 0; i < svgFileList.length; i++) {

            var board;
            var bounds;
            var boardWidth;
            var rowCount, colCount;
            var myY1, myY2;
            var x1 = y1 = x2 = y2 = 0;

            var myRowHeight   = CONFIG.ROW_HEIGHT + CONFIG.GUTTER;
            var myColumnWidth = CONFIG.COL_WIDTH  + CONFIG.GUTTER;

            for (var pageCounter = CONFIG.PG_COUNT -1; pageCounter >= 0; pageCounter--) {

                doc.artboards.setActiveArtboardIndex(pageCounter);
                board  = doc.artboards[pageCounter];
                bounds = board.artboardRect;
                boardWidth = Math.round(bounds[2] - bounds[0]);

                /**
                 * loop through rows
                 * @type {number}
                 */

                rowCount = Math.ceil((svgFileList.length / CONFIG.COLS));

                rowCount = CONFIG.ROWS > rowCount ? rowCount : CONFIG.ROWS ;

                /**
                 * If we are skipping a column, chances are we need to
                 * add a new row for the overflow of the shift. Even if there
                 * is not a new row needed, there are no consequences for
                 * adding one, so just in case.
                 */

                if (CONFIG.SKIP_COLS > 0) {
                    rowCount++;
                }

                for (var rowCounter = 1 ; rowCounter <= rowCount; rowCounter++) {

                    myY1 = bounds[1] + CONFIG.VOFF + (myRowHeight * (rowCounter-1));
                    myY2 = myY1 + CONFIG.FRM_HEIGHT;

                    /**
                     * loop through columns
                     * @type {Number}
                     */

                    colCount = CONFIG.COLS;

                    if (rowCounter > 1) {

                        var remaining = Math.ceil(svgFileList.length - i);
                        if (remaining < colCount) {
                            colCount = remaining;
                        }
                    }

                    for (var columnCounter = 1 ; columnCounter <= colCount; columnCounter++) {
                        try {

                            /**
                             * A hack to allow merging multiple contact sheets
                             * Shift the starting row so it aligns nicely with
                             * the icons already in the master contact sheet.
                             */

                            if (CONFIG.SKIP_COLS > 0 && rowCounter == 1 && columnCounter <= CONFIG.SKIP_COLS) {
                                continue;
                            }

                            var f = new File(svgFileList[i]);

                            if (f.exists) {

                                try {
                                    if (i == 0) {
                                        theLayer = doc.layers[0];
                                    }
                                    else {
                                        theLayer = doc.layers.add();
                                    }

                                    theLayer.name = f.name;
                                }
                                catch(ex) {
                                    logger(LANG.LAYER_NOT_CREATED + ex);
                                }

                                var svgFile = doc.groupItems.createFromFile(f);

                                var liveWidth = (CONFIG.COLS * (CONFIG.FRM_WIDTH + CONFIG.GUTTER)) - CONFIG.GUTTER;
                                var hoff = Math.ceil((CONFIG.PG_WIDTH - liveWidth) / 2);

                                var myX1 = bounds[0] + hoff + (myColumnWidth * (columnCounter-1));

                                var shiftX = Math.ceil((CONFIG.FRM_WIDTH - svgFile.width) / 2);
                                var shiftY = Math.ceil((CONFIG.FRM_WIDTH - svgFile.height) / 2);

                                var x1 = myX1 + shiftX;
                                var y1 = (myY1 + shiftY) * -1;

                                try {
                                    svgFile.position = [ x1, y1 ];

                                    if (typeof(svgFile.resize) == "function") {
                                        svgFile.resize(
                                            CONFIG.SCALE,
                                            CONFIG.SCALE,
                                            true,
                                            true,
                                            true,
                                            true,
                                            CONFIG.SCALE
                                        );
                                    }

                                    /**
                                     * Only save the composite file if at least one
                                     * icon exists and is successfully imported.
                                     * @type {boolean}
                                     */
                                    saveCompositeFile = true;
                                }
                                catch(ex) {
                                    try {
                                        svgFile.position = [0, 0];
                                        logger(ex);
                                    }
                                    catch(ex) {/*Exit Gracefully*/}
                                }
                            }
                            else {
                                logger(svgFileList[i] + LANG.DOES_NOT_EXIST);
                            }
                        }
                        catch(ex) {
                            logger(ex);
                            alert(ex);
                        }
                        i++;
                    }
                }
            }
            if (saveCompositeFile)
                saveFileAsAi(srcFolder.path + "/" + CONFIG.FILENAME);
        }
    }
}

/**
 * Get all files in sub-folders.
 * @param srcFolder
 * @returns {Array}
 */
function getFilesInSubfolders( srcFolder ) {

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
}

/**
 * Saves the file in AI format.
 * @param <string> The file destination path
 * @return void
 */
function saveFileAsAi(dest) {
    if (app.documents.length > 0) {
        var options = new IllustratorSaveOptions();
        var theDoc = new File(dest);
        options.compatibility = CONFIG.AIFORMAT;
        options.flattenOutput = OutputFlattening.PRESERVEAPPEARANCE;
        options.pdfCompatible = true;
        app.activeDocument.saveAs(theDoc, options);
    }
}

/**
 * Trims a string.
 * @param str
 * @returns {XML|string|void}
 */
function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
}

/**
 * Logging for this script.
 * @param <string> The logging text
 * @return void
 */
function logger(txt) {

    if (CONFIG.LOGGING == 0) return;
    initFolder( CONFIG.LOG_FOLDER );
    write_file(CONFIG.LOG_FILE_PATH, "[" + new Date().toUTCString() + "] " + txt);
}

/**
 * Logging for this script.
 * @param {string}  path        The file path
 * @param {string}  txt         The text to write
 * @param {bool}    replace     Replace the file
 * @return void
 */
function write_file( path, txt, replace ) {

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

/**
 * Format the date in YYYY-MM-DD format
 * @param string date  The date in timestring format
 * @return date string in YYYY-MM-DD format (2015-10-06)
 */
function doDateFormat(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

doCreateContactSheet();

userInteractionLevel = originalInteractionLevel;