#target Illustrator

var logging = true;

/**
 * Default configuration. Many of these values are over-written by the dialog.
 * @type {{
 *     ARTBOARD_COUNT: number,
 *     ARTBOARD_WIDTH: number,
 *     ARTBOARD_HEIGHT: number,
 *     ARTBOARD_SPACING: number,
 *     ARTBOARD_ROWSxCOLS: number,
 *     LOG_FILE_PATH: string,
 *     COMPOSITE_FILE_NAME: string,
 *     SCALE: number,
 *     ROOT: string,
 *     SRC_FOLDER: string,
 *     ATH_SEPATATOR: string
 * }}
 */
var CONFIG = {
    ARTBOARD_COUNT      : 1,
    ARTBOARD_WIDTH      : 64,
    ARTBOARD_HEIGHT     : 64,
    ARTBOARD_SPACING    : 64,
    ARTBOARD_ROWSxCOLS  : 10,
    LOG_FILE_PATH       : "~/Downloads/ai-script-log.txt",
    COMPOSITE_FILE_NAME : "merged-files.ai",
    SCALE               : 100,
    ROOT                : "~/Documents",
    SRC_FOLDER          : "",
    PATH_SEPATATOR      : "/"
}

/**
 * Use this object to translate the buttons and dialog labels to the language of your choice.
 */
var LANG = {
    CHOOSE_FOLDER          : 'Please choose your Folder of files to merge',
    NO_SELECTION           : 'No selection',
    LABEL_DIALOG_WINDOW    : 'SVG Files to Artboards',
    LABEL_ARTBOARD_WIDTH   : 'Artboard Width:',
    LABEL_ARTBOARD_HEIGHT  : 'Artboard Height:',
    LABEL_COL_COUNT        : 'Column Count:',
    LABEL_ROW_COUNT        : 'Row Count:',
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
    LABEL_OUTPUT           : 'Output'
}

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

    if ( view = app.activeDocument.views[0] ) {
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
 * @return Settings object
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

        var c1 = 28;
        var c2 = 164;
        var p1 = 16;

        dialog.sizePanel              = dialog.add('panel',      [p1, 16, 434, 200], LANG.LABEL_SIZE);
        dialog.outputPanel            = dialog.add('panel',      [p1, 200, 434, 290], LANG.LABEL_OUTPUT);
        dialog.sourcePanel            = dialog.add('panel',      [p1, 290, 434, 350], LANG.LABEL_INPUT);

        dialog.artboardWidthLabel     = dialog.add('statictext', [c1, 40, 140, 70],   LANG.LABEL_ARTBOARD_WIDTH);
        dialog.artboardWidth          = dialog.add('edittext',   [c2, 40, 214, 70],   CONFIG.ARTBOARD_WIDTH);
        dialog.artboardWidth.active   = true;

        dialog.artboardHeightLabel    = dialog.add('statictext', [c1, 70, 140, 100],  LANG.LABEL_ARTBOARD_HEIGHT);
        dialog.artboardHeight         = dialog.add('edittext',   [c2, 70, 214, 100],  CONFIG.ARTBOARD_HEIGHT);
        dialog.artboardHeight.active  = true;

        dialog.artboardSpacingLabel   = dialog.add('statictext', [c1, 100, 140, 130], LANG.LABEL_ARTBOARD_SPACING);
        dialog.artboardSpacing        = dialog.add('edittext',   [c2, 100, 214, 130], CONFIG.ARTBOARD_SPACING);
        dialog.artboardSpacing.active = true;

        dialog.rowsLabel              = dialog.add('statictext', [c1, 130, 140, 160], LANG.LABEL_ROW_COUNT);
        dialog.rows                   = dialog.add('edittext',   [c2, 130, 214, 160], CONFIG.ARTBOARD_ROWSxCOLS);
        dialog.rows.active            = true;

        dialog.scaleLabel             = dialog.add('statictext', [c1, 160, 140, 190], LANG.LABEL_SCALE);
        dialog.scale                  = dialog.add('edittext',   [c2, 160, 214, 190], CONFIG.SCALE);
        dialog.scale.active           = true;

        dialog.filenameLabel          = dialog.add('statictext', [c1, 220, 140, 250], LANG.LABEL_FILE_NAME);
        dialog.filename               = dialog.add('edittext',   [c2, 220, 334, 250], '');
        dialog.filename.active        = true;

        dialog.logging                = dialog.add('checkbox',   [c1, 260, 140, 330], LANG.LABEL_LOGGING);
        dialog.logging.value          = CONFIG.LOGGING;

        dialog.folderBtn              = dialog.add('button',     [c1, 310, 140, 340],  LANG.LABEL_CHOOSE_FOLDER, {name: 'folder'})

        dialog.srcFolder              = dialog.add('edittext',   [140, 310, 424, 340], "");
        dialog.srcFolder.active       = false;

        dialog.cancelBtn              = dialog.add('button',     [232, 360, 332, 390], LANG.BUTTON_CANCEL, {name: 'cancel'});
        dialog.openBtn                = dialog.add('button',     [334, 360, 434, 390], LANG.BUTTON_OK, {name: 'ok'});

        dialog.cancelBtn.onClick = function() {
            dialog.close();
            response = false;
            return false;
        };

        dialog.folderBtn.onClick = function() {
            if ( srcFolder = Folder.selectDialog( CONFIG.CHOOSE_FOLDER ) ) {

                if ( srcFolder.fs == 'Windows' ) {
                    CONFIG.PATH_SEPATATOR = "\\"
                }

                dialog.srcFolder.text = srcFolder.path + CONFIG.PATH_SEPATATOR + srcFolder.name;
                CONFIG.SRC_FOLDER = srcFolder;
                if ( trim(dialog.filename.text) == '' ) {
                    dialog.filename.text = srcFolder.name + '-merged.ai';
                    CONFIG.COMPOSITE_FILE_NAME = dialog.filename.text;
                }
            }
        }

        dialog.openBtn.onClick = function() {

            CONFIG.ARTBOARD_WIDTH      = parseInt(dialog.artboardWidth.text);
            CONFIG.ARTBOARD_HEIGHT     = parseInt(dialog.artboardHeight.text);
            CONFIG.LOGGING             = dialog.logging.value;
            CONFIG.SPACING             = parseInt(dialog.artboardSpacing.text);
            CONFIG.SCALE               = parseInt(dialog.scale.text);
            CONFIG.ARTBOARD_ROWSxCOLS  = parseInt(dialog.rows.text);
            CONFIG.COMPOSITE_FILE_NAME = dialog.filename.text;

            if (CONFIG.DEBUG) {
                logger( 'CONFIG.ARTBOARD_WIDTH: '  + CONFIG.ARTBOARD_WIDTH );
                logger( 'CONFIG.ARTBOARD_HEIGHT: ' + CONFIG.ARTBOARD_HEIGHT );
                logger( 'CONFIG.COL_WIDTH: '       + CONFIG.COL_WIDTH );
                logger( 'CONFIG.ROW_HEIGHT: '      + CONFIG.ROW_HEIGHT );
                logger( 'CONFIG.SCALE: '           + CONFIG.SCALE );
                logger( 'CONFIG.ROWS: '            + CONFIG.ROWS );
                logger( 'CONFIG.COLS: '            + CONFIG.COLS );
                logger( 'CONFIG.SPACING: '         + CONFIG.SPACING );
            }

            dialog.close();
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
 * Import files to artboards. Sets artboard name to file name minus file extension.
 */
function filesToArtboards() {

    // My function variables…
    var doc, fileList, i, srcFolder, mm, svgFile;

    if (! doDisplayDialog()) {
        return;
    }

    srcFolder = CONFIG.SRC_FOLDER;

    if ( srcFolder == null ) return;

    /**
     * Gets only the SVG files…
     */
    fileList = getFilesInSubfolders(srcFolder); // srcFolder.getFiles(/\.svg$/i);

    logger("File count: " + fileList.length + "\n");
    logger(fileList);

    /**
     * Make sure it has AI files in it…
     */
    if (fileList.length > 0) {

        /**
         * Metric MM converter…
         * @type {number}
         */
        mm = 2.83464567

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
            CONFIG.ARTBOARD_COUNT = fileList.length,
            DocumentArtboardLayout.GridByCol,
            CONFIG.ARTBOARD_SPACING,
            CONFIG.ARTBOARD_ROWSxCOLS = Math.round(Math.sqrt(fileList.length))
        );

        /**
         * Loop thru the counter
         */
        for (i = 0; i < CONFIG.ARTBOARD_COUNT; i++) {

            /**
             * Set the active artboard rulers based on this
             */
            doc.artboards.setActiveArtboardIndex(i);

            var bits = srcFolder.name.split('-');
            var base = bits.slice(1, bits.length).join('-');

            doc.artboards[i].name = base + "-" + fileList[i].name.replace(".svg", "");

            /**
             * Create group from SVG
             */
            svgFile = doc.groupItems.createFromFile(fileList[i]);

            /**
             * Move relative to this artboards rulers
             */
            try {
                svgFile.position = [
                    Math.floor((CONFIG.ARTBOARD_WIDTH - svgFile.width) / 2),
                    Math.floor((CONFIG.ARTBOARD_HEIGHT - svgFile.height) / 2) * -1
                ];
                if (typeof(svgFile.resize) == "function") {
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

        };

        saveFileAsAi(
            CONFIG.SRC_FOLDER.path + CONFIG.PATH_SEPATATOR + CONFIG.COMPOSITE_FILE_NAME
        );
    };

};

function getFilesInSubfolders( srcFolder ) {

    if ( ! srcFolder instanceof Folder) return;

    var allFiles    = srcFolder.getFiles();
    var theFolders  = [];
    var svgFileList = [];

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
 * Saves a file in Ai format.
 * @param dest
 */
function saveFileAsAi(dest) {
    if (app.documents.length > 0) {
        var options = new IllustratorSaveOptions();
        var theDoc = new File(dest);
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
            logger(CONFIG.NO_SELECTION);
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
    var file = new File(CONFIG.LOG_FILE_PATH);
    file.open("e", "TEXT", "????");
    file.seek(0,2);
    $.os.search(/windows/i)  != -1 ? file.lineFeed = 'windows'  : file.lineFeed = 'macintosh';
    file.writeln("[" + new Date().toUTCString() + "] " + txt);
    file.close();
}

/**
 * Execute the script.
 */
filesToArtboards(); 