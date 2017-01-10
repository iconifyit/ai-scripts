﻿#target illustrator/** * USAGE: * * 1. Place this script in Applications > Adobe Illustrator > Presets > en_US > Scripts * 2. Restart Adobe Illustrator to activate the script * 3. The script will be available under menu File > Scripts > SVGtoPDF * 4. When the script runs, you will be asked to select two folders: first the SVG  *    source folder, then the output folder * 5. The script will output your SVG files as PDF. It will mimic the source folder  *    structure of the source folder you select. *     *    So, for instance, if you have a source folder structure like this: * *    SVG/food-icons/one/ *    SVG/food-icons/two/ *    SVG/food-icons/three/ *    SVG/tools-icons/red/ *    SVG/tools-icons/blue/ *    SVG/tools-icons/green/ *    *    The script will output: *     *    target-root-folder/food-icons/one/ *    target-root-folder/food-icons/two/ *    target-root-folder/food-icons/three/ *    target-root-folder/tools-icons/red/ *    target-root-folder/tools-icons/blue/ *    target-root-folder/tools-icons/green/ * * 6. The script will also output a log file in the root of your Target Output folder.  *    The file will be named log.txt and will contain errors and other important info. * *    NOTE: You can turn OFF logging by setting the `logging` variable below to `0` *//** * LICENSE & COPYRIGHT * *   This script was written using pieces of scripts and concepts from the work of  *   several developers including the following: * *       MultiExporter.js by Matthew Ericson - mericson@ericson.net *       ExportDocAsFlash.js by ADOBE SYSTEMS INCORPORATED *       SaveAsPNG.js by ADOBE SYSTEMS INCORPORATED *        *       There may have been other scripts that inspired or were used in the creation *       of this script. Any omissions of credits are purely accidental. If you  *       recognize an omission, please let me know and I will happily add credit *       where it is due. * *   You are free to use, modify, and distribute this script as you see fit.  *   No credit is required but would be greatly appreciated.  * *   Scott Lewis - scott@iconify.it *   http://github.com/iconifyit *   http://iconify.it * *   THIS SCRIPT IS OFFERED AS-IS WITHOUT ANY WARRANTY OR GUARANTEES OF ANY KIND. *   YOU USE THIS SCRIPT COMPLETELY AT YOUR OWN RISK AND UNDER NO CIRCUMSTANCES WILL  *   THE DEVELOPER AND/OR DISTRIBUTOR OF THIS SCRIPT BE HELD LIABLE FOR DAMAGES OF  *   ANY KIND INCLUDING LOSS OF DATA OR DAMAGE TO HARDWARE OR SOFTWARE. IF YOU DO  *   NOT AGREE TO THESE TERMS, DO NOT USE THIS SCRIPT. *//** * Log output mode: * 0 = off, no logging * 1 = on, logging enabled */var logging = 1;/** * @deprecated */var debugOn = false;/** * Only alter the code below this point if you are an experienced JSX developer. */var originalInteractionLevel = userInteractionLevel;userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;/** * For more information on scripting Adobe Illustrator, please refer to  * the Adobe Illustrator Scripting Guide for JavaScript: * @url http://www.adobe.com/devnet/illustrator/scripting.html */ var PDFOPTIONS                 = new PDFSaveOptions();PDFOPTIONS.compatibility       = PDFCompatibility.ACROBAT5; PDFOPTIONS.generateThumbnails  = true; PDFOPTIONS.preserveEditability = true;var CONST = {    // Notice the space at the end of the svg string below. MacOS requires 4 characters     // for file type. The space is considered a character and is required.    SVG:        "svg ",    SRCROOT:    "~/Desktop",    TARGROOT:   "~/Desktop",    CHOOSESRC:  "Select folder of SVG files.",    CHOOSETARG: "Choose a destination folder"};var theFiles = new Array();        try {        var theSourceFolder;    var theTargetFolder;        theSourceFolder = Folder.selectDialog( CONST.CHOOSESRC, CONST.SRCROOT );    if (theSourceFolder instanceof Folder)  {              theTargetFolder  = Folder.selectDialog(CONST.CHOOSETARG, CONST.TARGROOT);      }    if (theSourceFolder instanceof Folder && theTargetFolder instanceof Folder) {        getFilesRecursive(theSourceFolder);                for (i = 0; i < theFiles.length; i++) {                        var f = theFiles[i];            var fileName = f.name;                        var theRelativeFilePath = f.toString().replace(                theSourceFolder.toString(),                ""            );                        var theRelativeFolderPath = theRelativeFilePath.replace(                f.name,                ""            );                        logger("Relative FILE path: " + theRelativeFilePath);            logger("Relative FOLDER path: " + theRelativeFolderPath);                                                newFolder = new Folder(theTargetFolder + theRelativeFolderPath);                        if (! newFolder.exists) {                                logger("Creating folder " + newFolder.path);                newFolder.create();            }                    if (f instanceof File && f.type == CONST.SVG) {                            try {                    var theTargetFile = theTargetFolder + theRelativeFilePath.replace(".svg", ".pdf");                                        if (! new File(theTargetFile).exists) {                        logger("Saving PDF file " + theTargetFile);                                                var doc = app.open(f);                        saveFileToPDF(theTargetFile);                    }                    else {                                                logger("PDF file " + theTargetFile + " already exists.");                    }                    try {                        doc.close(SaveOptions.DONOTSAVECHANGES);                    }                    catch(ex) {/* Exist gracefully. Doc was already closed. */}                }                catch(ex) {                                        logger("ERROR: " + ex.message);                  }            }        }    }}catch(ex) {        logger("ERROR: " + ex.message);}userInteractionLevel = originalInteractionLevel;/**  *  Functions  */function getFilesRecursive(folder) {    var currentFolder = new Folder(folder);        //the current folder's file listing    var files = currentFolder.getFiles();        //iterate and put files in the result and process the sub folders recursively    for (var f = 0; f < files.length; f++) {        if (files[f] instanceof Folder) {            getFilesRecursive(files[f]);        } else {            //it's a file yupeee            theFiles.push(files[f]);        }    }                }/** * You can edit the PDF presets in the global  * PDFOPTS at the top of this script. Only edit  * these options if you know what you are doing. * For full details on PDF options, refer to the  * Adobe documentation for Illustrator Scripting. * @url http://www.adobe.com/devnet/illustrator/scripting.html */function saveFileToPDF (theFilePath) {    if ( app.documents.length > 0 ) {                var doc = app.activeDocument;                var targetFile = new File(theFilePath);        doc.saveAs(targetFile, PDFOPTIONS);        doc.close(SaveOptions.DONOTSAVECHANGES);    }}function logger(txt) {      if (logging == 0) return;    var file = new File(theTargetFolder + "/log.txt");      file.open("e", "TEXT", "????");      file.seek(0,2);      $.os.search(/windows/i)  != -1 ? file.lineFeed = 'windows'  : file.lineFeed = 'macintosh';    file.writeln("[" + new Date().toUTCString() + "] " + txt);      file.close();  }