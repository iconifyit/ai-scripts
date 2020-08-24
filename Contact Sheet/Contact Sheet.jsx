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

// #target Illustrator

#include "Progress.js"
#include "FileList.js"
#include "../utils.jsx"
#include "../JSON.jsx"
#include "../polyfills.js"

var ContactSheet = function() {

    if (typeof(Utils) != 'object') {
        alert('Missing required class Utils (/Adobe Illustrator/presets/en_us/scripts/utils.jsx)');
    }

    // #include "CSConfig.jsx";

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
    var CSConfig = {

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

        VOFF: 0,

        /**
         * Left & Right page margins
         */

        HOFF: 0,

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

        PG_WIDTH: 1120,

        /**
         * Artboard height
         *
         * 20 rows 128 px tall, with 64 px page margins
         */

        PG_HEIGHT: 1400,

        /**
         * Page margin
         */
        MARGIN : 32,

        /**
         * Page Count
         */

        PG_COUNT: 1,

        /**
         * Not yet fully-implemented. Will support multiple units
         */

        PG_UNITS: "px",

        /**
         * @deprecated
         */

        GUTTER: 2,

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

        LOG_FILE_PATH: '~/ai-contact-sheet/logs/' + Utils.dateFormat(new Date()) + '.log',

        /**
         * Default path separator
         */

        PATH_SEPATATOR: "/"
    };

    if (typeof(CSConfig) != 'object') {
        alert('Missing required class CSConfig (/Adobe Illustrator/presets/en_us/scripts/Contact Sheet/CSConfig.jsx)');
    }

    /**
     * Logger method.
     */
    var logger = function(theText) {
        Utils.folder( CSConfig.LOG_FOLDER );
        Utils.write_file(CSConfig.LOG_FILE_PATH, "[" + new Date().toUTCString() + "] " + theText);
    };

    var originalInteractionLevel = userInteractionLevel;
    userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

    CONFIG = CSConfig;

    /**
     * Displays the settings dialog
     *
     * Inputs:
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

        var response, dialog;

        var dialogWidth  = 450;
        var dialogHeight = 450;
        var dialogLeft   = 550;
        var dialogTop    = 300;

        if ( bounds = Utils.getScreenSize() ) {
            dialogLeft = Math.abs(Math.ceil((bounds.width/2) - (dialogWidth/2)));
        }

        response = false;

        /**
         * Dialog bounds: [ Left, TOP, RIGHT, BOTTOM ]
         * default: //550, 350, 1000, 800
         */

        dialog = new Window(
            "dialog", "Contact Sheet Settings", [
                dialogLeft,
                dialogTop,
                dialogLeft + dialogWidth,
                dialogTop + dialogHeight
            ]
        );

        try {

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

            dialog.sizePanel         = dialog.add('panel',      [p1, 16, p3, 230],    "Size");
            dialog.presetsPanel      = dialog.add('panel',      [p4, 16, p5, 230],    "Presets");
            dialog.outputPanel       = dialog.add('panel',      [p1, 230, p2, 320],   "Output");
            dialog.sourcePanel       = dialog.add('panel',      [p1, 320, p2, 380],   "Input");

            dialog.pageWidthLabel    = dialog.add("statictext", [c1, r1, c1w, 70],    "Page Width");
            dialog.pageWidth         = dialog.add("edittext",   [c2, r1, c2w, 70],    CSConfig.PG_WIDTH);
            dialog.pageWidth.active  = true;

            dialog.pageHeightLabel   = dialog.add("statictext", [c1, 70, c1w, 100],   "Page Height");
            dialog.pageHeight        = dialog.add("edittext",   [c2, 70, c2w, 100],   CSConfig.PG_HEIGHT);
            dialog.pageHeight.active = true;

            dialog.colsLabel         = dialog.add("statictext", [c1, 100, c1w, 130],  "Columns");
            dialog.cols              = dialog.add("edittext",   [c2, 100, c2w, 130],  CSConfig.COLS);
            dialog.cols.active       = true;

            dialog.rowsLabel         = dialog.add("statictext", [c1, 130, c1w, 160],  "Rows");
            dialog.rows              = dialog.add("edittext",   [c2, 130, c2w, 160],  CSConfig.ROWS);
            dialog.rows.active       = true;

            dialog.scaleLabel        = dialog.add('statictext', [c1, 160, c1w, 190],  "Scale");
            dialog.scale             = dialog.add('edittext',   [c2, 160, c2w, 190],  CSConfig.SCALE);
            dialog.scale.active      = true;

            dialog.marginLabel       = dialog.add('statictext', [c1, 190, c1w, 220],  "Page Margin");
            dialog.margin            = dialog.add('edittext',   [c2, 190, c2w, 220],  CSConfig.MARGIN);
            dialog.margin.active     = true;

            dialog.filenameLabel     = dialog.add('statictext', [c1, 250, c1w, 280],  "Output file name");
            dialog.filename          = dialog.add('edittext',   [c2, 250, 334, 280],  '');
            dialog.filename.active   = true;

            dialog.logging           = dialog.add('checkbox',   [c1, 290, c1w, 360],  "Logging");
            dialog.logging.value     = CSConfig.LOGGING;

            dialog.folderBtn         = dialog.add('button',     [c1, 340, c1w, 370],  "Choose Folder", {name: 'folder'});

            dialog.srcFolder         = dialog.add('edittext',   [140, 340, 424, 370], '');
            dialog.srcFolder.active  = false;

            dialog.presets           = dialog.add("listbox",    [p4 + 16, 48, p5 - 16, 214]);

            dialog.cancelBtn         = dialog.add('button',     [232, 390, 332, 420], "Cancel", {name: 'cancel'});
            dialog.openBtn           = dialog.add('button',     [334, 390, 434, 420], "OK", {name: 'ok'});
            dialog.saveBtn           = dialog.add('button',     [p1,  390, p1 + 120, 420], "Save", {name: 'save'});

            initPresetsList(dialog);
            initButtons();

            /*
             * Update the Output file name based on form values.
             */

            function setOutputFilename() {
                dialog.filename.text = "contact-"
                    + CSConfig.PG_WIDTH
                    + "x" + CSConfig.COLS
                    + "x" + CSConfig.ROWS
                    + "@" + CSConfig.SCALE + ".ai";
                CSConfig.OUTPUT_FILENAME = dialog.filename.text;
            }
            dialog.setOutputFilename = setOutputFilename;

            dialog.setOutputFilename();

            /*
             * Update the CSConfig values.
             */

            function updateConfig() {

                CSConfig.PG_WIDTH        = parseInt(dialog.pageWidth.text);
                CSConfig.PG_HEIGHT       = parseInt(dialog.pageHeight.text);
                CSConfig.LOGGING         = dialog.logging.value;
                CSConfig.SCALE           = parseInt(dialog.scale.text);
                CSConfig.COLS            = parseInt(dialog.cols.text);
                CSConfig.ROWS            = parseInt(dialog.rows.text);
                CSConfig.MARGIN          = parseInt(dialog.margin.text);
                CSConfig.COL_WIDTH       = parseInt((CSConfig.PG_WIDTH  - (CSConfig.MARGIN * 2)) / CSConfig.COLS);
                CSConfig.ROW_HEIGHT      = parseInt((CSConfig.PG_HEIGHT - (CSConfig.MARGIN * 2)) / CSConfig.ROWS);
                CSConfig.FRM_WIDTH       = CSConfig.COL_WIDTH;
                CSConfig.FRM_HEIGHT      = CSConfig.ROW_HEIGHT;
                CSConfig.OUTPUT_FILENAME = dialog.filename.text;
            }
            dialog.updateConfig = function() {
                updateConfig();
            }

            /*
             * Initialize the dialog button actions.
             */

            function initButtons() {

                dialog.saveBtn.enabled = false;
                dialog.openBtn.enabled = false;

                if (Utils.trim(dialog.pageWidth.text) == "") return;
                if (Utils.trim(dialog.pageHeight.text) == "") return;
                if (Utils.trim(dialog.cols.text) == "") return;
                if (Utils.trim(dialog.rows.text) == "") return;
                if (Utils.trim(dialog.scale.text) == "") return;
                if (parseInt(dialog.pageWidth.text) < 10 ) return;
                if (parseInt(dialog.pageHeight.text) < 10 ) return;
                if (parseInt(dialog.cols.text) < 1 ) return;
                if (parseInt(dialog.rows.text) < 1 ) return;
                if (parseInt(dialog.scale.text) < 1 ) return;

                dialog.saveBtn.enabled = true;

                if (Utils.trim(dialog.filename.text) == "") return;
                if (Utils.trim(dialog.srcFolder.text) == "") return;

                var testFolder = new Folder(dialog.srcFolder.text);
                // if (! testFolder.exists) return;

                dialog.openBtn.enabled = true;
            }
            dialog.initButtons = function() {
                initButtons();
            }

            /*
             * Add form event handlers.
             */

            dialog.pageWidth.onChange = function() {
                CSConfig.PG_WIDTH = dialog.pageWidth.text;
                initButtons();
                dialog.setOutputFilename();
            }

            dialog.cols.onChange = function() {
                CSConfig.COLS = dialog.cols.text;
                initButtons();
                dialog.setOutputFilename();
            }

            dialog.rows.onChange = function() {
                CSConfig.ROWS = dialog.rows.text;
                initButtons();
                dialog.setOutputFilename();
            }

            dialog.scale.onChange = function() {
                CSConfig.SCALE = dialog.scale.text;
                initButtons();
                dialog.setOutputFilename();
            }

            dialog.pageHeight.onChange = initButtons;
            dialog.filename.onChange   = initButtons;
            dialog.srcFolder.onChange  = initButtons;

            dialog.cancelBtn.onClick = function() {
                dialog.close();
                response = false;
                return false;
            };

            dialog.saveBtn.onClick = function() {

                updateConfig();
                savePresetsFile(CSConfig);
                initPresetsList(dialog);
                initButtons();
            };

            dialog.folderBtn.onClick = function() {
                var srcFolder;
                if ( srcFolder = Folder.selectDialog( CSConfig.CHOOSE_FOLDER ) ) {

                    if ( srcFolder.fs == 'Windows' ) {
                        CSConfig.PATH_SEPATATOR = "\\"
                    }

                    dialog.srcFolder.text = srcFolder.path + CSConfig.PATH_SEPATATOR + srcFolder.name;
                    CSConfig.SRC_FOLDER = srcFolder;

                    if ( Utils.trim(dialog.filename.text) == '' ) {
                        setOutputFilename();
                        CSConfig.OUTPUT_FILENAME = dialog.filename.text;
                    }
                    initButtons();
                }
            };

            dialog.openBtn.onClick = function() {

                updateConfig();

                dialog.close();
                response = true;
                return true;
            };

            /*
             * Update the form.
             */

            updatePresetsSelection(dialog, CSConfig);
            setOutputFilename();
            updateConfig();

            dialog.show();
        }
        catch(ex) {
            logger('doDisplayDialog - ' + ex);
        }
        return response;
    }

    /**
     * Saves presets to JSON file.
     * @param {object} presets  Presets object
     */
    function savePresetsFile(presets) {
        var filename = presets.PG_WIDTH + "x" + presets.PG_HEIGHT + "@" + presets.SCALE + ".json";
        Utils.write_file(
            CSConfig.PRESETS_FOLDER + "/" + filename,
            JSON.stringify({
                "PG_WIDTH"  : presets.PG_WIDTH,
                "PG_HEIGHT" : presets.PG_HEIGHT,
                "COLS"      : presets.COLS,
                "ROWS"      : presets.ROWS,
                "SCALE"     : presets.SCALE,
                "MARGIN"    : presets.MARGIN
            }), true
        );
    }

    /**
     * Initialize the presets select list
     * @param dialog
     */
    function initPresetsList(dialog) {

        var presets, presetsFolder;

        try {
            presetsFolder = Utils.folder( CSConfig.PRESETS_FOLDER );

            if (presets = presetsFolder.getFiles("*.json")) {

                if (dialog.presets) {
                    dialog.presets.removeAll();
                }

                for (var i=0; i<presets.length; i++) {
                    item = dialog.presets.add("item", new File(presets[i]).name);

                    if (i == presets.length-1) {
                        dialog.presets.defaultValue = new File(presets[i]).name;
                        item.selected = true;
                    }
                }

                dialog.presets.onChange = function() {
                    updatePresetsSelection(dialog, CSConfig);
                }

                dialog.presets.onDoubleClick = function() {
                    if ( filename = dialog.presets.selection.text ) {
                        Utils.deleteFile(CSConfig.PRESETS_FOLDER + "/" + filename, true);
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
     * Update the dialog based on presets selection
     * @param dialog
     * @param CSConfig
     */
    function updatePresetsSelection(dialog, CSConfig) {
        if ( dialog.presets.selection ) {
            initSettingsForm(dialog, CSConfig.PRESETS_FOLDER + "/" + dialog.presets.selection.text);
        }
    }

    /**
     * Opens a session
     *
     */
    function initSettingsForm( dialog, filepath ) {

        var presets;
        if (presets = Utils.read_json_file(filepath)) {
            dialog.pageWidth.text  = Utils.get(presets, 'PG_WIDTH',  '');
            dialog.pageHeight.text = Utils.get(presets, 'PG_HEIGHT', '');
            dialog.cols.text       = Utils.get(presets, 'COLS',      '');
            dialog.rows.text       = Utils.get(presets, 'ROWS',      '');
            dialog.scale.text      = Utils.get(presets, 'SCALE',     '');
            dialog.margin.text     = Utils.get(presets, 'MARGIN',    0);
            dialog.updateConfig();
        }

        dialog.setOutputFilename();
    }

    /**
     * Adds a new artboard and rearranges the artboards.
     * @param   {Document}  doc
     * @param   {object}    Settings
     * @returns {*}
     */
    function addArtboard(doc, Settings) {

        var w, h, x1, y1, x2, y2, rect, rect2;

        try {
            rect = doc.artboards[doc.artboards.length-1].artboardRect;

            w = rect[2] - rect[0];
            h = Math.abs(rect[3]) - Math.abs(rect[1]);

            x1 = rect[0];
            y1 = rect[1] + h;
            x2 = rect[2];
            y2 = rect[3] + h;

            rect2 = [x1, y1, x2, y2];

            board = doc.artboards.add(rect2);

            doc.rearrangeArtboards(
                Settings.layout,
                Settings.rowsOrCols,
                Settings.spacing,
                true
            );
        }
        catch(e) { alert(e) }

        return board;
    }

    /**
     * Returns existing or new layer.
     * @param layerName
     * @param parent
     * @returns {*}
     */
    function getOrAddLayer(layerName, parent) {
        var newLayer;
        try {
            newLayer = parent.layers.getByName(layerName);
        }
        catch(e) {
            newLayer = parent.layers.add();
        }
        return newLayer;
    }

    /**
     * Main logic to create the contact sheet.
     * @return void
     */
    function doCreateContactSheet() {

        var doc, srcFolder, svgFile, srcFileList, saveCompositeFile;

        saveCompositeFile = false;

        doc = activeDocument;

        if (! doDisplayDialog()) {
            return;
        }

        if (CSConfig.SRC_FOLDER === null) return;

        srcFolder = CSConfig.SRC_FOLDER;

        srcFileList = new FileList(srcFolder, [FileTypes.SVG]);

        if (srcFileList.length) {

            srcFileList = Utils.sortBySetAndName(srcFileList);

            if (Utils.trim(CSConfig.OUTPUT_FILENAME) == "") {
                CSConfig.OUTPUT_FILENAME = srcFolder.name.replace(" ", "-") + "-contact-sheet.ai";
            }

            CSConfig.PG_COUNT = Math.ceil(srcFileList.length / (CSConfig.ROWS * CSConfig.COLS));

            Settings = {
                colorSpace : DocumentColorSpace.RGB,
                layout     : DocumentArtboardLayout.GridByCol,
                spacing    : 32,
                columns    : Math.round(Math.sqrt(CSConfig.PG_COUNT)),
                rowsOrCols : 2
            };

            try {
                doc = app.documents.add(
                    Settings.colorSpace,
                    CSConfig.PG_WIDTH,
                    CSConfig.PG_HEIGHT,
                    CSConfig.PG_COUNT,
                    Settings.layout,
                    Settings.spacing,
                    Settings.columns
                );
            }
            catch( ex ) {
                logger("Document was not created. " + ex);
                return;
            }

            var progress = new Progress({
                label    : 'Create Contact Sheet',
                maxvalue : srcFileList.length
            }, true);

            var vLayer,
                sLayer,
                boardName,
                setName,
                volName;

            var board,
                boards,
                bounds,
                boardWidth,
                rowCount,
                colCount,
                myY1, myY2,
                x1, y1, x2, y2,
                myRowHeight,
                myColumnWidth;

            for (var i = 0; i < srcFileList.length; i++) {

                x1 = y1 = x2 = y2 = 0;

                myRowHeight   = CSConfig.ROW_HEIGHT + CSConfig.GUTTER;
                myColumnWidth = CSConfig.COL_WIDTH  + CSConfig.GUTTER;

                for (var pageCounter = 0; pageCounter < CSConfig.PG_COUNT; pageCounter++) {

                    setName   = new File(srcFileList[i]).parent.name;
                    volName   = new File(srcFileList[i]).parent.parent.name;
                    boardName = volName + '-' + setName + '-' + String(doc.artboards.length-1);

                    boards = doc.artboards;
                    boards.setActiveArtboardIndex(pageCounter);
                    app.executeMenuCommand('fitall');

                    board       = boards[pageCounter];
                    board.name  = boardName;
                    bounds      = board.artboardRect;
                    boardWidth  = Math.round(bounds[2] - bounds[0]);

                    if (Utils.get(vLayer, 'name', null ) != volName) {
                        vLayer = doc.layers.add();
                        vLayer.name = volName;
                    }

                    /**
                     * loop through rows
                     * @type {number}
                     */

                    rowCount = Math.ceil((srcFileList.length / CSConfig.COLS));
                    rowCount = CSConfig.ROWS > rowCount ? rowCount : CSConfig.ROWS ;

                    for (var rowCounter = 1 ; rowCounter <= rowCount; rowCounter++) {

                        myY1 = bounds[1] + CSConfig.MARGIN + (myRowHeight * (rowCounter-1));
                        myY2 = myY1 + CSConfig.FRM_HEIGHT;

                        /**
                         * loop through columns
                         * @type {Number}
                         */

                        colCount = CSConfig.COLS;

                        if (rowCounter > 1) {

                            var remaining = Math.ceil(srcFileList.length - i);
                            if (remaining < colCount) {
                                colCount = remaining;
                            }
                        }

                        for (var columnCounter = 1 ; columnCounter <= colCount; columnCounter++) {
                            try {

                                var f = new File(srcFileList[i]);

                                if (f.exists) {

                                    // Add layers

                                    sLayer = getOrAddLayer(f.parent.name, vLayer);
                                    sLayer.name = f.parent.name;

                                    try {
                                        sLayer.layers.add().name = f.name.replace(new RegExp(/\s/g), '-');
                                    }
                                    catch(ex) {
                                        logger("Layer " + f.name + " was not created. Error : " + ex);
                                    }

                                    svgFile = sLayer.groupItems.createFromFile(f);

                                    progress.update('icons imported');

                                    var myX1   = bounds[0] + (myColumnWidth * (columnCounter-1));

                                    var shiftX = Math.ceil((CSConfig.FRM_WIDTH - svgFile.width) / 2);
                                    var shiftY = Math.ceil((CSConfig.FRM_WIDTH - svgFile.height) / 2);

                                    x1 = myX1 + shiftX;
                                    y1 = (myY1 + shiftY) * -1;

                                    try {
                                        svgFile.position = [ x1, y1 ];
                                        saveCompositeFile = true;
                                    }
                                    catch(ex) {
                                        logger(ex);
                                        try { svgFile.position = [0, 0]; }
                                        catch(ex) {/*Exit Gracefully*/}
                                    }

                                    try {
                                        if (typeof(svgFile.resize) == "function") {
                                            svgFile.resize(
                                                CSConfig.SCALE,
                                                CSConfig.SCALE,
                                                true,
                                                true,
                                                true,
                                                true,
                                                CSConfig.SCALE
                                            );
                                        }
                                    }
                                    catch(e) {
                                        logger(ex);
                                    }

                                    redraw();
                                }
                                else {
                                    logger(srcFileList[i] + " does not exist");
                                }
                            }
                            catch(ex) {
                                logger(ex);
                            }
                            i++;
                        }
                    }
                }
            }

            progress.text('Saving contact sheet');

            if (saveCompositeFile) {
                Utils.saveFileAsAi(doc, srcFolder.path + "/" + CSConfig.OUTPUT_FILENAME, CSConfig.AIFORMAT);
            }

            progress.close();
        }
    }

    doCreateContactSheet();

    userInteractionLevel = originalInteractionLevel;

    Utils.gc();
}


new ContactSheet();
