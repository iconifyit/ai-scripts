/**
 * FileListError class.
 * @param message
 * @param stack
 * @constructor
 */
var FileListError = function(message, stack) {
    this.name    = "FileListError";
    this.message = message || "Unknown FileListError";
    this.stack   = stack;
};
FileListError.prototype = Error.prototype;

/**
 * File Extensions constants.
 * @type {{JPG: string, PDF: string, SVG: string, GIF: string, AI: string, PNG: string, EPS: string}}
 */
var FileTypes = {

    SVG : "SVG",
    EPS : "EPS",
    AI  : "AI",
    PDF : "PDF",
    PNG : "PNG",
    JPG : "JPG",
    GIF : "GIF",

    toRegex : function(theType) {
        if (typeof(FileTypes[theType.toUpperCase()]) == 'string') {
            return new RegExp(theType.toLowerCase(), 'ig');
        }
    }
};

/**
 * Class to get list of files. If you pass a file type or types array, the class
 * will return the list immediately. If you pass only the source folder, an interface
 * with several methods is returned.
 * @param rootFolder
 * @param fileTypes
 * @returns {*}
 * @constructor
 */
var FileList = function(rootFolder, fileTypes) {

    if (typeof rootFolder == 'string') {
        rootFolder = new Folder(rootFolder);
    }

    if (typeof fileTypes != 'undefined') {
        return _getFiles(true, fileTypes);
    }

    /**
     * Get all files in subfolders.
     * @param {Folder}  srcFolder     The root folder from which to merge SVGs.
     * @returns {Array}     Array of nested files.
     */
    function getFilesInSubfolders( srcFolder, recurse, fileTypes ) {

        if (typeof recurse != 'boolean') {
            recurse = false;
        }

        if (typeof fileTypes == 'string') {
            fileTypes = [fileTypes];
        }

        if ( ! (srcFolder instanceof Folder)) return;

        var theFolders  = getSubFolders(srcFolder),
            theFileList = getFilesInFolder(srcFolder, fileTypes);

        if (! recurse || theFolders.length == 0) {
            theFileList = Array.prototype.concat.apply([], getFilesInFolder(srcFolder, fileTypes));
        }
        else {
            for (var x=0; x < theFolders.length; x++) {
                theFileList = Array.prototype.concat.apply(theFileList, getFilesInFolder(theFolders[x], fileTypes));
            }
        }

        return theFileList;
    }

    /**
     * Get all nested subfolders in theFolder.
     * @param theFolder
     * @returns {*}
     */
    function getSubFolders(theFolder) {
        var subFolders = [];
        var myFileList = theFolder.getFiles();
        for (var i = 0; i < myFileList.length; i++) {
            var myFile = myFileList[i];
            if (myFile instanceof Folder) {
                subFolders.push(myFile);
                subFolders = Array.prototype.concat.apply(
                    subFolders,
                    getSubFolders(myFile)
                );
            }
        }
        return subFolders;
    }

    /**
     * Gets the files in a specific source folder.
     *
     * NOTE: You may notice that in the code below we do not use the Illustrator File method
     * `theFolder.getFiles(/\.svg$/i)` to scan the folder for a specific file type, even though
     * it would be more efficient. The reason is that from time-to-time the MacOS will not correctly
     * identify the file type and the list comes back empty when it is, in fact, not empty. To prevent
     * the script from randomly stop  working and require a system restart, we use a slightly less
     * efficient but more reliable method to identify the file extension.
     *
     * @param {Folder}  The folder object
     * @returns {Array}
     */
    function getFilesInFolder(theFolder, fileTypes) {

        var theFile,
            theExt,
            fileList = [];

        // Make sure we are working with an array if a type is provided.

        if (typeof fileTypes == 'string') {
            fileTypes = [fileTypes];
        }

        fileList = theFolder.getFiles();

        if (typeof fileTypes.length != 'undefined' && fileTypes.length > 0) {
            var filtered = [];
            for (var t = 0; t < fileTypes.length; t++) {
                var fileType = fileTypes[t];

                for (var i = 0; i < fileList.length; i++) {

                    theFile = fileList[i];
                    theExt  = theFile.name.split(".").pop();

                    if ( theExt.trim().toUpperCase() == fileType.trim().toUpperCase() ) {
                        filtered.push(theFile);
                    }
                }
            }
            fileList = filtered;
        }

        return fileList;
    }

    /**
     * Get the file type from file extension.
     * @param theFile
     * @returns {string}
     */
    function getFileType(theFile) {
        return theFile.name.split(".").pop().trim().toUpperCase();
    }

    /**
     * List files except excluded types.
     * @param rootFolder
     * @param recurse
     * @param exclude
     * @returns {any}
     */
    function getAllFilesExcept(rootFolder, recurse, exclude) {

        if (typeof exclude == 'undefineed') {
            return new Error('Array of excluded types required in FileList.getAllFilesExcept');
        }

        var files = getFilesInSubfolders(rootFolder, recurse);

        var filtered = [];
        for (var i = 0; i < files.length; i++) {
            if (excluded.indexOf( getFileType(files[i]) ) == -1) {
                filtered.push(files[i]);
            }
        }
        return filtered;
    }

    /**
     * Get the file list.
     * @param recurse
     * @param fileTypes
     * @returns {Array}
     * @private
     */
    function _getFiles(recurse, fileTypes) {
        if (typeof recurse != 'boolean') recurse = false;
        return getFilesInSubfolders(rootFolder, recurse, fileTypes);
    }

    /**
     * Public interface.
     */
    return {
        getFiles : function(recurse, fileTypes) {
            return _getFiles(recurse, fileTypes);
        },
        getAllFilesExcept : function(recurse, excludeTypes) {
            return getAllFilesExcept(rootFolder, recurse, excludeTypes);
        },
        getFolders : function(recurse) {
            if (typeof recurse != 'boolean') recurse = false;
            return getSubFolders(recurse);
        }
    }
};
