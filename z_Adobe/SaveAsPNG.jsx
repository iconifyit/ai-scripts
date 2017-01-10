/**
 * ADOBE SYSTEMS INCORPORATED
 * Copyright 2005 Adobe Systems Incorporated
 * All Rights Reserved
 * 
 * NOTICE:  Adobe permits you to use, modify, and
 * distribute this file in accordance with the terms
 * of the Adobe license agreement accompanying it. 
 * If you have received this file from a source
 * other than Adobe, then your use, modification,
 * or distribution of it requires the prior
 * written permission of Adobe.
 */

/**
 * ExportDocsAsPNG24.jsx
 *
 * This sample gets files specified by the user from the
 * selected folder and batch processes them and saves them
 * as PNGs in the user desired destination with the same
 * file name.
 */

// uncomment to suppress Illustrator warning dialogs
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

var destFolder, sourceFolder, files, fileType, sourceDoc, targetFile, pngExportOpts;

// Select the source folder.
// sourceFolder = Folder.selectDialog('Select the folder with Illustrator files you want to convert to PNG', '~');

// sourceFolder = new Folder("~/Dropbox/iconified-project/test");

// sourceFolder = new Folder("~/Dropbox/Next.co.uk-private/icons/svgs");

sourceFolder = new Folder("~/Desktop/svg/21-30");

// If a valid folder is selected
// if (sourceFolder != null) {
if (sourceFolder != null && sourceFolder.exists) {
    
    files = new Array();
    // fileType = prompt('Select type of Illustrator files to you want to process. Eg: *.ai', ' ');
    
    fileType = "*.svg";
   
    // Get all files matching the pattern
    files = sourceFolder.getFiles(fileType);
   
    if (files.length > 0) {
        
        // Get the destination to save the files
        // destFolder = Folder.selectDialog('Select the folder where you want to save the converted PNG files.', '~');
        
        destFolder = new Folder("~/Desktop/pngs");
        
        if (destFolder != null && destFolder.exists) {
            for (i = 0; i < files.length; i++) {
                sourceDoc = app.open(files[i]); // returns the document object
                                   
                // Call function getNewName to get the name and file to save the pdf
                targetFile = getNewName();
           
                // Call function getPNGOptions get the PNGExportOptions for the files
                pngExportOpts = getPNGOptions();
           
                // Export as PNG
                sourceDoc.exportFile(targetFile, ExportType.PNG24, pngExportOpts);
           
                sourceDoc.close(SaveOptions.DONOTSAVECHANGES);
            }
            alert('Files are saved as PNG in ' + destFolder);
        }
        else {
            alert("Error: Folder [" + destFolder + "] does not exist");
        }
    }
    else {
        alert("No matching files found");
    }
}

/**
 * getNewName: Function to get the new file name. The primary
 * name is the same as the source file.
 */
function getNewName() {
    var ext, docName, newName, saveInFile, docName;
    docName = sourceDoc.name;
    ext = '.png'; // new extension for png file
    newName = "";
       
    for (var i = 0 ; docName[i] != "." ; i++) {
        newName += docName[i];
    }
    newName += ext; // full png name of the file
   
    // Create a file object to save the png
    saveInFile = new File(destFolder + '/' + newName);

    return saveInFile;
}

/**
 * getPNGOptions: Function to set the PNG saving options of the
 * files using the PDFSaveOptions object.
 */
function getPNGOptions() {
   
    // Create the PDFSaveOptions object to set the PDF options
    var pngExportOpts = new ExportOptionsPNG24();

    // Setting PNGExportOptions properties. Please see the JavaScript Reference
    // for a description of these properties.
    // Add more properties here if you like
    pngExportOpts.antiAliasing = true;
    pngExportOpts.artBoardClipping = false;
    //pngExportOpts.horizontalScale = 100.0;
    //pngExportOpts.matte = true;
    //pngExportOpts.matteColor = 0, 0, 0;
    pngExportOpts.saveAsHTML = false;
    pngExportOpts.transparency = true;
    //pngExportOpts.verticalScale = 100.0;

    return pngExportOpts;
}