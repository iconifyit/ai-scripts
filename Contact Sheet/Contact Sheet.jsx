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

#include "../utils.jsx";

if (typeof(Utils) != 'object') {
    alert('Missing required class Utils (/Adobe Illustrator/presets/en_us/scripts/utils.jsx)');
}

#include "config.jsx";

if (typeof(CONFIG) != 'object') {
    alert('Missing required class CONFIG (/Adobe Illustrator/presets/en_us/scripts/Contact Sheet/config.jsx)');
}

#include "lang.jsx";

if (typeof(LANG) != 'object') {
    alert('Missing required class LANG (/Adobe Illustrator/presets/en_us/scripts/Contact Sheet/lang.jsx)');
}

var originalInteractionLevel = userInteractionLevel;
userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

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
    var dialogHeight = 410;
    var dialogLeft   = 550;
    var dialogTop    = 300;

    if ( bounds = Utils.getScreenSize() ) {
        dialogLeft = Math.abs(Math.ceil((bounds.width/2) - (dialogWidth/2)));
        // dialogTop  = Math.abs(Math.ceil((bounds.height) - (dialogHeight/2)));
    }

    response = false;

    /**
     * Dialog bounds: [ Left, TOP, RIGHT, BOTTOM ]
     * default: //550, 350, 1000, 800
     */

    dialog   = new Window(
        "dialog", LANG.LABEL_DIALOG_WINDOW, [
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

        function updateConfig() {

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

            if (Utils.trim(dialog.pageWidth.text) == "") return;
            if (Utils.trim(dialog.pageHeight.text) == "") return;
            if (Utils.trim(dialog.cols.text) == "") return;
            if (Utils.trim(dialog.rows.text) == "") return;
            if (Utils.trim(dialog.scale.text) == "") return;
            if (parseInt(dialog.pageWidth.text) < 10 ) return;
            if (parseInt(dialog.pageHeight.text) < 10 ) return;
            if (parseInt(dialog.cols.text) < 10 ) return;
            if (parseInt(dialog.rows.text) < 10 ) return;
            if (parseInt(dialog.scale.text) < 1 ) return;

            dialog.saveBtn.enabled = true;

            if (Utils.trim(dialog.filename.text) == "") return;
            if (Utils.trim(dialog.srcFolder.text) == "") return;

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

            updateConfig();
            savePresetsFile(CONFIG);
            initPresetsList(dialog);
            initButtons();
        };

        dialog.folderBtn.onClick = function() {
            var srcFolder;
            if ( srcFolder = Folder.selectDialog( CONFIG.CHOOSE_FOLDER ) ) {

                if ( srcFolder.fs == 'Windows' ) {
                    CONFIG.PATH_SEPATATOR = "\\"
                }

                dialog.srcFolder.text = srcFolder.path + CONFIG.PATH_SEPATATOR + srcFolder.name;
                CONFIG.SRC_FOLDER = srcFolder;

                if ( Utils.trim(dialog.filename.text) == '' ) {
                    dialog.filename.text = srcFolder.name + '-contact-sheet.ai';
                    CONFIG.OUTPUT_FILENAME = dialog.filename.text;
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

        dialog.show();
    }
    catch(ex) {
        Utils.logger('doDisplayDialog - ' + ex);
    }
    return response;
}

/**
 * Saves presets to JSON file.
 * @param {object} presets  Presets object
 */
function savePresetsFile(presets) {
    var filename = presets.PG_WIDTH + "x" + presets.PG_HEIGHT + "@" + presets.SCALE + ".json";
    Utils.write_json_file(
        CONFIG.PRESETS_FOLDER + "/" + filename, {
            "PG_WIDTH"  : presets.PG_WIDTH,
            "PG_HEIGHT" : presets.PG_HEIGHT,
            "COLS"      : presets.COLS,
            "ROWS"      : presets.ROWS,
            "SCALE"     : presets.SCALE
        }, true
    );
}

/**
 * Initialize the presets select list
 * @param dialog
 */
function initPresetsList(dialog) {

    var presets, presetsFolder;

    try {
        presetsFolder = Utils.folder( CONFIG.PRESETS_FOLDER );

        if (presets = presetsFolder.getFiles("*.json")) {

            if (dialog.presets) {
                dialog.presets.removeAll();
            }

            for (var i=0; i<presets.length; i++) {
                item = dialog.presets.add("item", new File(presets[i]).name);
            }

            dialog.presets.onChange = function() {
                if ( dialog.presets.selection ) {
                    initSettingsForm(dialog, CONFIG.PRESETS_FOLDER + "/" + dialog.presets.selection.text);
                }
            }

            dialog.presets.onDoubleClick = function() {
                if ( filename = dialog.presets.selection.text ) {
                    Utils.deleteFile(CONFIG.PRESETS_FOLDER + "/" + filename, true);
                    initPresetsList(dialog);
                }
            }
        }
    }
    catch(ex) {
        Utils.logger('initPresetsList - ' + ex.message);
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
    }
}

/**
 * Main logic to create the contact sheet.
 * @return void
 */
function doCreateContactSheet() {

    var doc, srcFolder, svgFile, svgFileList, saveCompositeFile;

    saveCompositeFile = false;

    if (! doDisplayDialog()) {
        return;
    }

    srcFolder = CONFIG.SRC_FOLDER;

    if ( srcFolder == null ) return;

    if (svgFileList = Utils.getFilesInSubfolders( srcFolder )) {

        if (Utils.trim(CONFIG.OUTPUT_FILENAME) == "") {
            CONFIG.OUTPUT_FILENAME = srcFolder.name.replace(" ", "-") + "-contact-sheet.ai";
        }

        CONFIG.PG_COUNT = Math.ceil(svgFileList.length / (CONFIG.ROWS * CONFIG.COLS));

        app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

        doc = app.documents.add(
            DocumentColorSpace.RGB,
            CONFIG.PG_WIDTH,
            CONFIG.PG_HEIGHT,
            CONFIG.PG_COUNT,
            DocumentArtboardLayout.GridByCol,
            CONFIG.GUTTER,
            Math.round(Math.sqrt(CONFIG.PG_COUNT))
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

                            var f = new File(svgFileList[i]);

                            if (f.exists) {

                                try {
                                    if (i == 0) {
                                        doc.layers[0].name = f.name;
                                    }
                                    else {
                                        doc.layers.add().name = f.name;
                                    }
                                }
                                catch(ex) {
                                    Utils.logger(LANG.LAYER_NOT_CREATED + ex);
                                }

                                svgFile = doc.groupItems.createFromFile(f);

                                var liveWidth = (CONFIG.COLS * (CONFIG.FRM_WIDTH + CONFIG.GUTTER)) - CONFIG.GUTTER;
                                var hoff = Math.ceil((CONFIG.PG_WIDTH - liveWidth) / 2);

                                var myX1 = bounds[0] + hoff + (myColumnWidth * (columnCounter-1));

                                var shiftX = Math.ceil((CONFIG.FRM_WIDTH - svgFile.width) / 2);
                                var shiftY = Math.ceil((CONFIG.FRM_WIDTH - svgFile.height) / 2);

                                x1 = myX1 + shiftX;
                                y1 = (myY1 + shiftY) * -1;

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
                                    Utils.logger(ex);
                                    try { svgFile.position = [0, 0]; }
                                    catch(ex) {/*Exit Gracefully*/}
                                }
                            }
                            else {
                                Utils.logger(svgFileList[i] + LANG.DOES_NOT_EXIST);
                            }
                        }
                        catch(ex) {
                            Utils.logger(ex);
                        }
                        i++;
                    }
                }
            }
            if (saveCompositeFile) {
                Utils.saveFileAsAi(doc, srcFolder.path + "/" + CONFIG.OUTPUT_FILENAME, CONFIG.AIFORMAT);
            }
        }
    }
}

doCreateContactSheet();

userInteractionLevel = originalInteractionLevel;