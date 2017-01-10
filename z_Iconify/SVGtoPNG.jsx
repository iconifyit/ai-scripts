﻿#target illustrator/** * USAGE: * * 1. Place this script in Applications > Adobe Illustrator > Presets > en_US > Scripts * 2. Restart Adobe Illustrator to activate the script * 3. The script will be available under menu File > Scripts > SVGtoPNG * 4. Update the 'targetSizes' array on line 78 to tell the script the output  *    sizes you want. * 5. When the script runs, you will be asked to select two folders: first the SVG  *    source folder, then the output folder * 6. The script will output your SVG files as PNG. It will mimic the source folder  *    structure arranged by the sizes indicated in the targetSizes array (#3 above). *     *    So, for instance, if you specified `targetSize = [100,200,400];`, and you have a  *    source folder structure like this: * *    SVG/food-icons *    SVG/tools-icons *    *    The script will output: *     *    PNG/100px/food-icons *    PNG/100px/tools-icons * *    PNG/200px/food-icons *    PNG/200px/tools-icons * *    PNG/400px/food-icons *    PNG/400px/tools-icons * * 7. The script will also output a log file in the root of your Target Output folder.  *    The file will be named log.txt and will contain errors and other important info. *//** * LICENSE & COPYRIGHT * *   This script was written using pieces of scripts and concepts from the work of  *   several developers including the following: * *       MultiExporter.js by Matthew Ericson - mericson@ericson.net *       ExportDocAsFlash.js by ADOBE SYSTEMS INCORPORATED *       SaveAsPNG.js by ADOBE SYSTEMS INCORPORATED *        *       There may have been other scripts that inspired or were used in the creation *       of this script. Any omissions of credits are purely accidental. If you  *       recognize an omission, please let me know and I will happily add credit *       where it is due. * *   You are free to use, modify, and distribute this script as you see fit.  *   No credit is required but would be greatly appreciated.  * *   Scott Lewis - scott@iconify.it *   http://github.com/iconifyit *   http://iconify.it * *   THIS SCRIPT IS OFFERED AS-IS WITHOUT ANY WARRANTY OR GUARANTEES OF ANY KIND. *   YOU USE THIS SCRIPT COMPLETELY AT YOUR OWN RISK AND UNDER NO CIRCUMSTANCES WILL  *   THE DEVELOPER AND/OR DISTRIBUTOR OF THIS SCRIPT BE HELD LIABLE FOR DAMAGES OF  *   ANY KIND INCLUDING LOSS OF DATA OR DAMAGE TO HARDWARE OR SOFTWARE. IF YOU DO  *   NOT AGREE TO THESE TERMS, DO NOT USE THIS SCRIPT. */ var originalInteractionLevel = userInteractionLevel;userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;/** * Specify the desired output file sizes here: * *     Example: * *       If you want output sizes of 32 x 32, 64 x 64, and 128 x 128 pixels: * *       var targetSizes    = [32, 64, 128]; * */ var targetSizes    = [32, 64, 128, 256, 512];/** * Only alter the code below this point if you are an experienced JSX developer. */var baseFileSize   = 32;var CONST = {    SVG:        "svg ",    SRCROOT:    "~/Dropbox/000-iconify-products/collections/envato-elements-products/35-gesture-envato/",    TARGROOT:   "~/Dropbox/000-iconify-products/collections/envato-elements-products/35-gesture-envato/",    CHOOSESRC:  "Select a folder of SVG files.",    CHOOSETARG: "Choose a destination folder"};/** * Log output mode: * 0 = off, no logging * 1 = on, logging enabled */var logging = 1;/** *  1 = forward * -1 = reverse */var runOrder   = -1;var theFiles       = new Array();var theFilesToSave = new Array();var startPointer   = "";        try {        var theSourceFolder;    var theTargetFolder;       theSourceFolder = Folder.selectDialog(CONST.CHOOSESRC, CONST.SRCROOT);    if (theSourceFolder instanceof Folder)  {              theTargetFolder  = Folder.selectDialog(CONST.CHOOSETARG, CONST.TARGROOT);      }        logger("SVG->PNG Start: " + (new Date()));    logger("Source: " + theSourceFolder);    logger("Target: " + theTargetFolder);    if (theSourceFolder instanceof Folder && theTargetFolder instanceof Folder) {        getFilesRecursive(theSourceFolder);                var count = theFiles.length;                if (runOrder == -1) {                    theFiles.reverse();        }                logger("File count: " + count);                for (i = 0; i < count; i++) {                        var f = theFiles[i];            var fileName = f.name;            if (f instanceof File) { // && f.type == CONST.SVG) {                                try {                                    for (x = 0; x < targetSizes.length; x++) {                                        var theTargetSize = targetSizes[x];                        var sizeFolder = "/" + theTargetSize + "px";                                                var theRelativeFilePath = f.toString().replace(                            theSourceFolder.toString(),                            ""                       );                                                theRelativeFilePath = sizeFolder + theRelativeFilePath;                        var theRelativeFolderPath = theRelativeFilePath.replace(                            f.name,                            ""                       );                                        newFolder = new Folder(theTargetFolder + theRelativeFolderPath);                                        if (! newFolder.exists) {                                                logger("Creating folder " + newFolder.path);                            newFolder.create();                        }                        var theTargetFile = theTargetFolder + theRelativeFilePath.replace(".svg", ".png");                                            if (! new File(theTargetFile).exists) {                                                    if (startPointer == "") {                                                                startPointer = theTargetFile.replace(theTargetFile.name, "");                                logger("Start location: " + startPointer);                            }                                                        logger("Saving PNG file " + theTargetFile);                                                        if (app.documents.length == 0) {                                                            doc = app.open(f);                            }                                                        saveFileToPNG(                                theTargetFile,                                 100 * (theTargetSize / baseFileSize)                            );                        }                    }                }                catch(ex) {                                        logger("ERROR: " + ex.message);                  }                                try {                    doc.close(SaveOptions.DONOTSAVECHANGES);                }                catch(ex) {/* Exist gracefully. Doc was already closed. */}            }        }    }}catch(ex) {        logger("ERROR: " + ex.message);}userInteractionLevel = originalInteractionLevel;logger("SVG->PNG Finish: " + (new Date()));/** *  Functions */function getFilesRecursive(folder) {    var currentFolder = new Folder(folder);        //the current folder's file listing    var files = currentFolder.getFiles();        for (var f = 0; f < files.length; f++) {        if (files[f] instanceof Folder) {                    getFilesRecursive(files[f]);        }         else {            theFiles.push(files[f]);        }    }            }function saveFileToPNG(theFilePath, theScale) {    if (app.documents.length > 0) {                app.activeDocument.exportFile(            new File(theFilePath),             ExportType.PNG24,             getPNGOptions(theScale)       );    }}/** * getPNGOptions: Function to set the PNG saving options of the * files using the PDFSaveOptions object. */function getPNGOptions(theScale) {       var options = new ExportOptionsPNG24();    options.antiAliasing     = true;    options.artBoardClipping = false;    options.horizontalScale  = theScale;    options.verticalScale    = theScale;    options.saveAsHTML       = false;    options.transparency     = true;    return options;}function logger(txt) {      if (logging == 0) return;    var file = new File(theTargetFolder + "/log.txt");      file.open("e", "TEXT", "????");      file.seek(0,2);      $.os.search(/windows/i)  != -1 ? file.lineFeed = 'windows'  : file.lineFeed = 'macintosh';    file.writeln("[" + new Date().toUTCString() + "] " + txt);      file.close();  }