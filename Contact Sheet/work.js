for (var i = 0; i < srcFileList.length; i++) {

    // Do some stuff

    for (var pageCounter = 0; pageCounter < CSConfig.PG_COUNT; pageCounter++) {

        // Do some more stuff

        for (var rowCounter = 1 ; rowCounter <= rowCount; rowCounter++) {

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

                // Do even more stuff

                // We are incrementing the iterator inside the column loop, inside the row loop
                // so the outer iterator only increments  ever ROWS * COLS iterations.

                i++;
            }
        }
    }
}

var fileIterator = new Iterator(srcFileList);

while (fileIterator.hasNext()) {

    // Do some stuff

    for (var pageCounter = 0; pageCounter < CSConfig.PG_COUNT; pageCounter++) {

        // Do some more stuff

        for (var rowCounter = 1 ; rowCounter <= rowCount; rowCounter++) {

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

                // Do even more stuff

                // We are incrementing the iterator inside the column loop, inside the row loop
                // so the outer iterator only increments  ever ROWS * COLS iterations.

                f = fileIterator.next();
            }
        }
    }
}

// VERSION 1

function doCreateContactSheet() {

    var doc, srcFolder, svgFile, srcFileList, saveCompositeFile;

    saveCompositeFile = false;

    doc = activeDocument;

    var originalInteractionLevel = userInteractionLevel;
    userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

    // app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

    if (! doDisplayDialog()) {
        return;
    }

    if (CSConfig.SRC_FOLDER === null) return;

    srcFolder = CSConfig.SRC_FOLDER;

    srcFileList = new FileList(srcFolder, [FileTypes.SVG]);

    if (srcFileList.length) {

        srcFileList = sortBySetAndName(srcFileList);

        if (Utils.trim(CSConfig.OUTPUT_FILENAME) == "") {
            CSConfig.OUTPUT_FILENAME = srcFolder.name.replace(" ", "-") + "-contact-sheet.ai";
        }

        CSConfig.PG_COUNT = Math.ceil(srcFileList.length / (CSConfig.ROWS * CSConfig.COLS));

        try {

            Settings = {
                colorSpace : DocumentColorSpace.RGB,
                layout     : DocumentArtboardLayout.GridByCol,
                spacing    : 32,
                columns    : Math.round(Math.sqrt(CSConfig.PG_COUNT)),
                rowsOrCols : 2
            };

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

        var ipp = CSConfig.ROWS * CSConfig.COLS;

        for (var i = 0; i < srcFileList.length; i++) {

            x1 = y1 = x2 = y2 = 0;

            myRowHeight   = CSConfig.ROW_HEIGHT + CSConfig.GUTTER;
            myColumnWidth = CSConfig.COL_WIDTH  + CSConfig.GUTTER;

            for (var pageCounter = 0; pageCounter < CSConfig.PG_COUNT; pageCounter++) {

                setName   = new File(srcFileList[i]).parent.name;
                volName   = new File(srcFileList[i]).parent.parent.name;
                boardName = volName + '-' + setName + '-' + String(doc.artboards.length-1);

                logger('PageCounter : ' + pageCounter);
                logger('i : ' + i);
                logger('ipp : ' + ipp);
                logger('(i % (ipp - 1)) : ' + (i % (ipp - 1)) );

                boards = doc.artboards;

                boards.setActiveArtboardIndex(pageCounter);
                app.executeMenuCommand('fitall');

                logger('Set active artboard to ' + pageCounter);

                // Add Artboard

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

                                // sLayer = getOrAddLayer(f.parent.name, vLayer);
                                // sLayer.name = f.parent.name;
                                //
                                // try {
                                //     sLayer.layers.add().name = f.name.replace(new RegExp(/\s/g), '-');
                                // }
                                // catch(ex) {
                                //     logger("Layer " + f.name + " was not created. Error : " + ex);
                                // }

                                svgFile = doc.groupItems.createFromFile(f);

                                logger('Item bounds : '     + JSON.stringify(svgFile.geometricBounds));
                                logger('Artboard bounds : ' + JSON.stringify(bounds));

                                progress.update('icons imported');

                                // var liveWidth = (CSConfig.COLS * (CSConfig.FRM_WIDTH + CSConfig.GUTTER)) - CSConfig.GUTTER;

                                var myX1   = bounds[0] + (myColumnWidth * (columnCounter-1));

                                var shiftX = Math.ceil((CSConfig.FRM_WIDTH - svgFile.width) / 2);
                                var shiftY = Math.ceil((CSConfig.FRM_WIDTH - svgFile.height) / 2);

                                x1 = myX1 + shiftX;
                                y1 = (myY1 + shiftY) * -1;

                                try {
                                    svgFile.position = [ x1, y1 ];

                                    /**
                                     * Only save the composite file if at least one
                                     * icon exists and is successfully imported.
                                     * @type {boolean}
                                     */
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


// VERSION 2

function doCreateContactSheet() {

    var doc, srcFolder, svgFile, srcFileList, saveCompositeFile;

    saveCompositeFile = false;

    if (! doDisplayDialog()) {
        return;
    }

    if (CSConfig.SRC_FOLDER === null) return;

    srcFolder = CSConfig.SRC_FOLDER;

    srcFileList = new FileList(srcFolder, [FileTypes.SVG]);

    if (srcFileList.length) {

        // srcFileList = Utils.sortFileList(srcFileList);

        srcFileList = sortBySetAndName(srcFileList);

        if (Utils.trim(CSConfig.OUTPUT_FILENAME) == "") {
            CSConfig.OUTPUT_FILENAME = srcFolder.name.replace(" ", "-") + "-contact-sheet.ai";
        }

        CSConfig.PG_COUNT = Math.ceil(srcFileList.length / (CSConfig.ROWS * CSConfig.COLS));

        app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

        try {

            Settings = {
                colorSpace : DocumentColorSpace.RGB,
                layout     : DocumentArtboardLayout.GridByCol,
                spacing    : 32,
                columns    : Math.round(Math.sqrt(CSConfig.PG_COUNT)),
                rowsOrCols : 2
            };

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

        // try {
        //     doc = app.documents.add(
        //         DocumentColorSpace.RGB,
        //         CSConfig.PG_WIDTH,
        //         CSConfig.PG_HEIGHT,
        //         CSConfig.PG_COUNT,
        //         DocumentArtboardLayout.GridByCol,
        //         10,
        //         Math.round(Math.sqrt(CSConfig.PG_COUNT))
        //     );
        // }
        // catch( ex ) {
        //     logger(LANG.DOC_NOT_CREATED + ex);
        //     return;
        // }

        // Utils.showProgressBar(srcFileList.length);

        var progress = new Progress({
            label    : 'Create Contact Sheet',
            maxvalue : srcFileList.length
        }, true);

        var ipp = CSConfig.ROWS * CSConfig.COLS;

        boards = doc.artboards;

        for (var i = 0; i < srcFileList.length; i++) {

            var board,
                bounds,
                boardWidth,
                rowCount,
                colCount,
                myY1,
                myY2,
                x1 = y1 = x2 = y2 = 0;

            var myRowHeight   = CSConfig.ROW_HEIGHT + CSConfig.GUTTER,
                myColumnWidth = CSConfig.COL_WIDTH  + CSConfig.GUTTER;

            for (var pageCounter = 0; pageCounter < CSConfig.PG_COUNT; pageCounter++) {

                setName   = new File(srcFileList[i]).parent.name;
                volName   = new File(srcFileList[i]).parent.parent.name;
                boardName = volName + '-' + setName + '-' + String(doc.artboards.length-1);

                logger('PageCounter : ' + pageCounter);
                logger('i : ' + i);
                logger('ipp : ' + ipp);
                logger('(i % (ipp - 1)) : ' + (i % (ipp - 1)) );

                var pageID = Utils.padNumber(pageCounter + 1, 3);

                doc.artboards.setActiveArtboardIndex(pageCounter);
                app.executeMenuCommand('fitall');

                logger('Set active artboard to ' + pageCounter);

                board       = boards[pageCounter];
                board.name  = boardName;
                bounds      = board.artboardRect;
                boardWidth  = Math.round(bounds[2] - bounds[0]);

                // if (Utils.get(vLayer, 'name', null ) != volName) {
                //     vLayer = doc.layers.add();
                //     vLayer.name = volName;
                // }

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

                                try {
                                    if (i == 0) {
                                        doc.layers[0].name = pageID + ' - ' + f.name;
                                    }
                                    else {
                                        doc.layers.add().name = pageID + ' - ' + f.name;
                                    }
                                }
                                catch(ex) {
                                    logger(LANG.LAYER_NOT_CREATED + ex);
                                }

                                svgFile = doc.groupItems.createFromFile(f);

                                // Utils.updateProgress("icons imported");

                                progress.update('icons imported');

                                var liveWidth = (CSConfig.COLS * (CSConfig.FRM_WIDTH + CSConfig.GUTTER)) - CSConfig.GUTTER;
                                var hoff = Math.ceil((CSConfig.PG_WIDTH - liveWidth) / 2);

                                var myX1 = bounds[0] + hoff + (myColumnWidth * (columnCounter-1));

                                var shiftX = Math.ceil((CSConfig.FRM_WIDTH - svgFile.width) / 2);
                                var shiftY = Math.ceil((CSConfig.FRM_WIDTH - svgFile.height) / 2);

                                x1 = myX1 + shiftX;
                                y1 = (myY1 + shiftY) * -1;

                                try {
                                    svgFile.position = [ x1, y1 ];

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

                                    redraw();

                                    /**
                                     * Only save the composite file if at least one
                                     * icon exists and is successfully imported.
                                     * @type {boolean}
                                     */
                                    saveCompositeFile = true;
                                }
                                catch(ex) {
                                    logger(ex);
                                    try { svgFile.position = [0, 0]; }
                                    catch(ex) {/*Exit Gracefully*/}
                                }
                            }
                            else {
                                logger(srcFileList[i] + LANG.DOES_NOT_EXIST);
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

        // Utils.progressBarText("Saving contact sheet");
        progress.text('Saving contact sheet');

        if (saveCompositeFile) {
            Utils.saveFileAsAi(doc, srcFolder.path + "/" + CSConfig.OUTPUT_FILENAME, CSConfig.AIFORMAT);
        }

        // Utils.hideProgressBar();
        progress.close();
    }
}
