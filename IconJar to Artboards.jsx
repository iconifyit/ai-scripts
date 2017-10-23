/**
 * The MIT License (MIT)
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
 *  Installation:
 *
 *      1. Copy this file to Illustrator > Presets > Scripting
 *      2. Restart Adobe Illustrator
 *      3. Go to File > Scripts > Merge SVG Docs
 *      4. Follow the prompts
 *
 *  Usage:
 *
 *      This script will import a folder of SVG files and merge them into a single document with
 *      the contents of each SVG file placed on a separate artboard. The artboard name will be set
 *      to the original SVG file's name without the file extension. Up to Adobe Illustrator 2015.3,
 *      it is only possible to import a maximum of 100 files since Illustrator only supports a
 *      maximum of 100 artboards.
 */

#target Illustrator

var originalInteractionLevel = userInteractionLevel;
userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

/**
 * Default configuration. Many of these values are over-written by the dialog.
 * @type {{
 *     ARTBOARD_COUNT: number,
 *     ARTBOARD_WIDTH: number,
 *     ARTBOARD_HEIGHT: number,
 *     ARTBOARD_SPACING: number,
 *     ARTBOARD_ROWSxCOLS: number,
 *     LOG_FILE_PATH: string,
 *     OUTPUT_FILENAME: string,
 *     SCALE: number,
 *     ROOT: string,
 *     SRC_FOLDER: string,
 *     ATH_SEPATATOR: string
 * }}
 */
var CONFIG = {
    ARTBOARD_COUNT      : 1,
    ARTBOARD_WIDTH      : 24,
    ARTBOARD_HEIGHT     : 24,
    ARTBOARD_SPACING    : 24,
    ARTBOARD_ROWSxCOLS  : 10,
    LOG_FILE_PATH       : "~/Downloads/ai-iconjar2artboards-log.txt",
    CONFIG_FILE_PATH    : "~/Downloads/ai-ij2ab-conf.json",
    LOGGING             : true,
    OUTPUT_FILENAME     : 'iconjar-to-artboards.ai',
    SCALE               : 100,
    ROOT                : "~/Documents",
    SRC_FOLDER          : '~/Desktop/',
    ICONS_FOLDER        : 'icons/',
    PATH_SEPATATOR      : "/",
    SORT_ARTBOARDS      : true,
    META_FILE_NAME      : "META.json",
    META_FILE           : ''
}

/**
 * Use this object to translate the buttons and dialog labels to the language of your choice.
 */
var LANG = {
    CHOOSE_FOLDER          : 'Please choose your Folder of files to merge',
    NO_SELECTION           : 'No selection',
    LABEL_DIALOG_WINDOW    : 'Merge SVG Files',
    LABEL_ARTBOARD_WIDTH   : 'Artboard Width:',
    LABEL_ARTBOARD_HEIGHT  : 'Artboard Height:',
    LABEL_COL_COUNT        : 'Columns:',
    LABEL_ROW_COUNT        : 'Rows:',
    LABEL_ARTBOARD_SPACING : 'Artboard Spacing:',
    LABEL_SCALE            : 'Scale:',
    LABEL_FILE_NAME        : 'File Name:',
    LABEL_LOGGING          : 'Logging?',
    BUTTON_CANCEL          : 'Cancel',
    BUTTON_OK              : 'Ok',
    DOES_NOT_EXIST         : ' does not exist',
    LAYER_NOT_CREATED      : 'Could not create layer. ',
    LABEL_SRC_FOLDER       : 'Source Folder',
    LABEL_CHOOSE_FOLDER    : 'Choose Folder',
    LABEL_INPUT            : 'Input',
    LABEL_SIZE             : 'Size',
    LABEL_OUTPUT           : 'Output',
    SORT_FILELIST_FAILED   : 'Could not sort the file list',
    LABEL_SORT_ARTBOARDS   : 'Sort Artboards?',
    PROGRESS               : 'IconJar to Illustrator Progress',
    SCRIPT_PROGRESS        : 'Progress'
}

#include "JSON.jsx";
#include "utils.jsx";

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

    try {
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
    }
    catch(ex){/*Exit Gracefully*/}
    return null;
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

    var response     = false;
    var dialogWidth  = 450;
    var dialogHeight = 410;
    var dialogLeft   = 550;
    var dialogTop    = 300;

    if ( bounds = getScreenSize() ) {
        dialogLeft = Math.abs(Math.ceil((bounds.width/2) - (dialogWidth/2)));
    }

    /**
     * Dialog bounds: [ Left, TOP, RIGHT, BOTTOM ]
     * default: //550, 350, 1000, 800
     */

    var dialog = new Window(
        "dialog", LANG.LABEL_DIALOG_WINDOW, [
            dialogLeft,
            dialogTop,
            dialogLeft + dialogWidth,
            dialogTop + dialogHeight
        ]
    );

    try {

        var configFile = new File(CONFIG.CONFIG_FILE_PATH);
        if (configFile.exists) {
            CONFIG = JSON.parse(read_file(configFile));
        }

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

        var c2  = 164;
        var c2w = c2 + 50;

        var p1 = 16;
        var p2 = dialogWidth - 16;

        var r1 = 40;

        dialog.sizePanel              = dialog.add('panel',      [p1, 16, p2, 170],   LANG.LABEL_SIZE);
        dialog.outputPanel            = dialog.add('panel',      [p1, 170, p2, 290],  LANG.LABEL_OUTPUT);
        dialog.sourcePanel            = dialog.add('panel',      [p1, 290, p2, 350],  LANG.LABEL_INPUT);

        dialog.artboardWidthLabel     = dialog.add('statictext', [c1, r1, c1w, 70],   LANG.LABEL_ARTBOARD_WIDTH);
        dialog.artboardWidth          = dialog.add('edittext',   [c2, r1, c2w, 70],   CONFIG.ARTBOARD_WIDTH);
        dialog.artboardWidth.active   = true;

        dialog.artboardHeightLabel    = dialog.add('statictext', [c1, 70, c1w, 100],  LANG.LABEL_ARTBOARD_HEIGHT);
        dialog.artboardHeight         = dialog.add('edittext',   [c2, 70, c2w, 100],  CONFIG.ARTBOARD_HEIGHT);
        dialog.artboardHeight.active  = true;

        dialog.artboardSpacingLabel   = dialog.add('statictext', [c1, 100, c1w, 130], LANG.LABEL_ARTBOARD_SPACING);
        dialog.artboardSpacing        = dialog.add('edittext',   [c2, 100, c2w, 130], CONFIG.ARTBOARD_SPACING);
        dialog.artboardSpacing.active = true;

        dialog.scaleLabel             = dialog.add('statictext', [c1, 130, c1w, 160], LANG.LABEL_SCALE);
        dialog.scale                  = dialog.add('edittext',   [c2, 130, c2w, 160], CONFIG.SCALE);
        dialog.scale.active           = true;

        dialog.filenameLabel          = dialog.add('statictext', [c1, 190, c1w, 220], LANG.LABEL_FILE_NAME);
        dialog.filename               = dialog.add('edittext',   [c2, 190, 334, 220], CONFIG.OUTPUT_FILENAME);
        dialog.filename.active        = true;

        dialog.logging                = dialog.add('checkbox',   [c1, 230, c1w, 300], LANG.LABEL_LOGGING);
        dialog.logging.value          = CONFIG.LOGGING;

        dialog.sortboards             = dialog.add('checkbox',   [c1, 260, c1w, 330], LANG.LABEL_SORT_ARTBOARDS);
        dialog.sortboards.value       = CONFIG.SORT_ARTBOARDS;

        dialog.folderBtn              = dialog.add('button',     [c1, 310, c1w, 340],  LANG.LABEL_CHOOSE_FOLDER, {name: 'folder'})

        dialog.srcFolder              = dialog.add('edittext',   [140, 310, 424, 340], CONFIG.SRC_FOLDER);
        dialog.srcFolder.active       = false;

        dialog.cancelBtn              = dialog.add('button',     [232, 360, 332, 390], LANG.BUTTON_CANCEL, {name: 'cancel'});
        dialog.openBtn                = dialog.add('button',     [334, 360, 434, 390], LANG.BUTTON_OK, {name: 'ok'});

        dialog.cancelBtn.onClick = function() {
            dialog.close();
            response = false;
            return false;
        };

        dialog.folderBtn.onClick = function() {
            var srcFolder;
            if ( srcFolder = Folder.selectDialog( CONFIG.CHOOSE_FOLDER ) ) {

                if ( srcFolder.fs == 'Windows' ) {
                    CONFIG.PATH_SEPATATOR = "\\"
                }

                var srcFolderPath = srcFolder.path + CONFIG.PATH_SEPATATOR + srcFolder.name + CONFIG.PATH_SEPATATOR;
                dialog.srcFolder.text = srcFolderPath;
                CONFIG.SRC_FOLDER = srcFolderPath;
                if ( trim(dialog.filename.text) == '' ) {
                    dialog.filename.text = srcFolder.name + '-merged.ai';
                    CONFIG.OUTPUT_FILENAME = dialog.filename.text;
                }
            }
        }

        dialog.openBtn.onClick = function() {

            CONFIG.ARTBOARD_WIDTH      = parseInt(dialog.artboardWidth.text);
            CONFIG.ARTBOARD_HEIGHT     = parseInt(dialog.artboardHeight.text);
            CONFIG.LOGGING             = dialog.logging.value;
            CONFIG.SORT_ARTBOARDS      = dialog.sortboards.value;
            CONFIG.SPACING             = parseInt(dialog.artboardSpacing.text);
            CONFIG.SCALE               = parseInt(dialog.scale.text);
            CONFIG.OUTPUT_FILENAME     = dialog.filename.text;
            CONFIG.META_FILE           = CONFIG.SRC_FOLDER + CONFIG.META_FILE_NAME;

            dialog.close();

            write_file(CONFIG.CONFIG_FILE_PATH, JSON.stringify(CONFIG), true);

            response = true;
            return true;
        };
        dialog.show();
    }
    catch(ex) {
        logger(ex);
        alert(ex);
    }
    return response;
}

/**
 * Display a new progress bar.
 * @param maxvalue
 * @returns {*}
 */
function showProgressBar(maxvalue) {

    var top, right, bottom, left;

    if ( bounds = getScreenSize() ) {
        left = Math.abs(Math.ceil((bounds.width/2) - (450/2)));
        top = Math.abs(Math.ceil((bounds.height/2) - (100/2)));
    }

    var progress = new Window("palette", LANG.PROGRESS, [left, top, left + 450, top + 100]);
    progress.pnl = progress.add("panel", [10, 10, 440, 100], LANG.SCRIPT_PROGRESS);
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
function updateProgress(progress) {
    progress.pnl.progBar.value++;
    var val = progress.pnl.progBar.value;
    var max = progress.pnl.progBar.maxvalue;
    progress.pnl.progBarLabel.text = val + ' of ' + max;
    $.sleep(10);
    progress.update();
    return progress;
}

/**
 * Convert IconJar tags to filename
 * @param {string} tags  Comma-separated list of tags.
 * @returns {string}
 */
function tagsToNameSlug(tags) {
    tags = tags.toLowerCase();
    return tags.split(',').join('-').replace(' ','-');
}

/**
 * Loads META.json
 */
function doLoadMetaData(filepath) {

    var read_file = new File(filepath);

    if (read_file) {
        try {

            if (read_file.alias) {
                while (read_file.alias) {
                    read_file = read_file.resolve().openDlg(
                        LANG.CHOOSE_FILE,
                        json_filter,
                        false
                    );
                }
            }

            read_file.open('r', undefined, undefined);
            if (read_file !== '') {
                var meta = JSON.parse(read_file.read());
                read_file.close();

                var items = [];
                if (typeof(meta.items) == "object") {
                    for (key in meta.items) {
                        items.push(meta.items[key]);
                    }
                }
                meta.items = items;

                return meta;
            }
        }
        catch(ex) {
            try { read_file.close(); }catch(ex){};
            logger("ERROR: " + ex.message);
        }
    }
}

/**
 * Cleans up the filename/artboardname.
 * @param {String}    name    The name to filter and reformat.
 * @return {String}           The cleaned up name.
 */
function filterName(name) {

    return decodeURIComponent(name).replace(' ', '-');
}

/**
 * Callback for sorting the SVG filelist.
 * @param a
 * @param b
 * @returns {number}
 */
function sortMethod(a, b) {
    var nameA = tagsToNameSlug(a.tags);
    var nameB = tagsToNameSlug(b.tags);
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
    // names must be equal
    return 0;
}

/**
 * Get the set name from the meta object.
 * @param {object} meta
 * @returns {string}
 */
function getSetName(meta) {
    var setName = CONFIG.OUTPUT_FILENAME;

    for (key in meta.sets) {
        setName = (meta.sets[key].name).toLowerCase().replace(' ', '-');
        break;
    }

    return setName;
}

/**
 * Convert file name to tags.
 * @param {string} fileName The file name to convert to tags.
 * @returns {string}
 */
function filenameToTags(fileName) {
    var tags = fileName.toLowerCase().replace('.svg', '').replace(' ', '-').split('-').join(',');
    logger("TAGS: " + tags);
    return tags;
}

/**
 * Ensure all items have tags.
 * @param {object} meta The meta object.
 * @return {object} the updated meta object
 */
function ensureTags(meta) {
    for (i=0; i<meta.items.length; i++) {
        var item = meta.items[i];
        if (trim(item.tags) == '') {
            meta.items[i].tags = filenameToTags(item.file);
        }
    }
    return meta;
}

/**
 * Import files to artboards. Sets artboard name to file name minus file extension.
 */
function filesToArtboards() {

    var doc, fileList, i, srcFolder, mm, svgFile;

    if (! doDisplayDialog()) {
        return;
    }

    srcFolder = new Folder(CONFIG.SRC_FOLDER);

    if ( srcFolder == null ) return;

    meta = ensureTags(doLoadMetaData(CONFIG.META_FILE));

    CONFIG.OUTPUT_FILENAME = getSetName(meta) + '.ai';

    /**
     * Make sure it has AI files in it…
     */
    if (meta.items.length > 0) {

        if (CONFIG.SORT_ARTBOARDS == true) {
            try {
                meta.items.sort(sortMethod);
            }
            catch(ex) {
                logger(LANG.SORT_FILELIST_FAILED);
            }
        }

        /**
         * Set the script to work with artboard rulers
         */
        app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

        /**
         * Add new multi-page document
         */
        doc = app.documents.add(
            DocumentColorSpace.RGB,
            CONFIG.ARTBOARD_WIDTH,
            CONFIG.ARTBOARD_HEIGHT,
            CONFIG.ARTBOARD_COUNT = meta.items.length,
            DocumentArtboardLayout.GridByCol,
            CONFIG.ARTBOARD_SPACING,
            CONFIG.ARTBOARD_ROWSxCOLS = Math.round(Math.sqrt(meta.items.length))
        );

        var progress = showProgressBar(CONFIG.ARTBOARD_COUNT);

        /**
         * Loop thru the counter
         */
        for (i = 0; i < CONFIG.ARTBOARD_COUNT; i++) {

            /**
             * Set the active artboard rulers based on this
             */
            doc.artboards.setActiveArtboardIndex(i);

            var boardName = tagsToNameSlug(meta.items[i].tags);

            if (trim(boardName) == '') {
                boardName = tagsToNameSlug(meta.items[i].file.replace('.svg', ''));
            }

            doc.artboards[i].name = boardName;

            /**
             * Create group from SVG
             */
            try {
                var f = new File(CONFIG.SRC_FOLDER + CONFIG.ICONS_FOLDER + meta.items[i].file);
                logger("FILE [" + i + "]: " + f);
            	if (f.exists) {
            	    svgFile = doc.groupItems.createFromFile(f);
            	}

                updateProgress(progress);

                /**
                 * Move relative to this artboards rulers
                 */
                try {
                    svgFile.position = [
                        Math.floor((CONFIG.ARTBOARD_WIDTH - svgFile.width) / 2),
                        Math.floor((CONFIG.ARTBOARD_HEIGHT - svgFile.height) / 2) * -1
                    ];
                    if (typeof(svgFile.resize) == "function" && CONFIG.SCALE != 100) {
                        svgFile.resize(CONFIG.SCALE, CONFIG.SCALE, true, true, true, true, CONFIG.SCALE);
                    }
                }
                catch(ex) {
                    try {
                        svgFile.position = [0, 0];
                    }
                    catch(ex) {/*Exit Gracefully*/}
                }

                alignToNearestPixel(doc.selection);
            }
            catch(ex) {
                logger(
                	"Error in `doc.groupItems.createFromFile` with file `" 
                	+ meta.items[i] + " `. Error: " + ex
                );
            }

        };

        progress.close();

        saveFileAsAi(srcFolder.path + CONFIG.PATH_SEPATATOR + CONFIG.OUTPUT_FILENAME);
    };

    try {
        userInteractionLevel = originalInteractionLevel;
    }
    catch(ex) {/*Exit Gracefully*/}

};

/**
 * Saves a file in Ai format.
 * @param dest
 */
function saveFileAsAi(dest) {
    if (app.documents.length > 0) {
        var options = new IllustratorSaveOptions();
        var theDoc  = new File(dest);
        options.flattenOutput = OutputFlattening.PRESERVEAPPEARANCE;
        options.pdfCompatible = true;
        app.activeDocument.saveAs(theDoc, options);
    }
}

/**
 * Align objects to nearest pixel.
 * @param sel
 */
function alignToNearestPixel(sel) {

    try {
        if (typeof sel != "object") {
            logger(LANG.NO_SELECTION);
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
        logger(ex);
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
    write_file(CONFIG.LOG_FILE_PATH, "[" + new Date().toUTCString() + "] " + txt, false);
}

/**
 * Write a file to disc.
 * @param path
 * @param txt
 * @param replace
 */
function write_file( path, txt, replace ) {
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
}

/**
 * Reads the contents of a file.
 * @param {File} fp     A file object.
 * @returns {string}
 */
function read_file(fp) {
    var data = '';

    try {
        fp.open('r', undefined, undefined);
        data = fp.read();
        fp.close();
    }
    catch(e) {
        try { fp.close(); }catch(e){}
        /* Exit gracefully for now */
    }
    return data;
}

/**
 * Execute the script.
 */
filesToArtboards(); 