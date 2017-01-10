#target illustrator
/**
 * USAGE:
 *
 * 1. Place this script in Applications > Adobe Illustrator > Presets > en_US > Scripts
 * 2. Restart Adobe Illustrator to activate the script
 * 3. The script will be available under menu File > Scripts > BatchResizeArtboards
 * 4. ... 
 */
/**
 * LICENSE & COPYRIGHT
 *
 *   You are free to use, modify, and distribute this script as you see fit. 
 *   No credit is required but would be greatly appreciated. 
 *
 *   Scott Lewis - scott@iconify.it
 *   http://github.com/iconifyit
 *   http://iconify.it
 *
 *   THIS SCRIPT IS OFFERED AS-IS WITHOUT ANY WARRANTY OR GUARANTEES OF ANY KIND.
 *   YOU USE THIS SCRIPT COMPLETELY AT YOUR OWN RISK AND UNDER NO CIRCUMSTANCES WILL 
 *   THE DEVELOPER AND/OR DISTRIBUTOR OF THIS SCRIPT BE HELD LIABLE FOR DAMAGES OF 
 *   ANY KIND INCLUDING LOSS OF DATA OR DAMAGE TO HARDWARE OR SOFTWARE. IF YOU DO 
 *   NOT AGREE TO THESE TERMS, DO NOT USE THIS SCRIPT.
 */
 
var originalInteractionLevel = userInteractionLevel;
userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

/**
 * Constants
 */

var CONST = {
    SRCFOLDER:      "~/ai-sessions",
    LOGFOLDER:      "~/ai-sessions",
    NO_OPEN_DOCS:   "There are no open docs to save for this session",
    NO_DOC_SELECTED: "You have not selected a session to open",
    SESSION_SAVED:  "Your Session Was Saved!",
    ENTER_FILENAME: "Enter a session file name or click enter to use the default name",
    JSON_EXT:       ".json",
    TEXT_EXT:       ".txt"
};

var dateString = doDateFormat((new Date()).getTime());

var session_filename = "ai-" + dateString + "-r1" + CONST.JSON_EXT;
var session_logfile  = "ai-log-"  + dateString  + "-r1" +  CONST.TEXT_EXT;


var dialog = new Window("dialog", "Ai Sessions", [150, 150, 500, 500]); 

// Message area

dialog.msgBox = dialog.add("statictext", [30,30,300,60], ""); 

// Cancel button

dialog.closeBtn = dialog.add("button", [30,275,120,315], "Close", {name:"close"});
dialog.closeBtn.onClick = function() { dialog.close() };

dialog.openBtn = dialog.add("button", [130,275,220,315], "Open", {name:"open"});
dialog.openBtn.enabled = false;

dialog.openBtn.onClick = function(){ 

    doOpenSession(CONST.SRCFOLDER + "/" + dialog.sessions.selection.text);
};

dialog.saveBtn = dialog.add("button", [230,275,320,315], "Save", {name:"save"});
dialog.saveBtn.onClick = function(){ 

    var button = dialog.saveBtn;
    
    // The business logic
    
    if (app.documents.length == 0) {
    
        alert(CONST.NO_OPEN_DOCS);
    }
    else {

        try {
            var openDocs = [];
            for (x=0; x<app.documents.length; x++) {
                openDocs.push(
                    '"' + app.documents[x].path + "/" + app.documents[x].name + '"'
                );
            }
            var logfolder = new Folder(CONST.LOGFOLDER);
            if (! logfolder.exists) {
    
                logfolder.create();
            }
        
            var testFile = new File(CONST.LOGFOLDER + "/" + session_filename);
        
            var n = 1;
            var max = 100;
            while (testFile.exists && n < max) {
                session_filename = "ai-" + dateString + "-r" + n + CONST.JSON_EXT;
                testFile = new File(CONST.LOGFOLDER + "/" + session_filename);
                n++;
            }
        
            session_logfile  = "ai-log-"  + dateString  + "-r" + n + CONST.TEXT_EXT
        
            logger(
                session_filename,
                "{files:[\r" + "    " + openDocs.join(",\r    ") + "\r]}"
            );
            
            initSessionsList(dialog);
            dialog.msgBox.text = CONST.SESSION_SAVED;
            dialog.saveBtn.enabled = false;
        }
        catch(ex) {
    
            logger(session_logfile, "ERROR: " + ex.message);
        }
        userInteractionLevel = originalInteractionLevel;
    }
};

initSessionsList(dialog);


dialog.show();

/**
 *  Functions
 */
/**
 * Initialize the sessions list
 */
function initSessionsList(dialog) {
    var sessions = new Folder(CONST.SRCFOLDER).getFiles("*.json");
    if (! sessions.length) {
    
        dialog.msgBox.text = "You have no saved sessions";
    }
    else {

        if (dialog.sessions) {
            dialog.sessions.removeAll();
        }

        /**
         * Let's show the newest sessions at the top.
         */
        sessions.reverse();
        
        dialog.sessions = dialog.add("listbox", [30, 70, 320, 230]);
        for (i=0; i<sessions.length; i++) {
            item = dialog.sessions.add("item", (new File(sessions[i])).name);
        }
        dialog.sessions.onChange = function() {

            dialog.openBtn.enabled = true;
        }
        dialog.sessions.onDoubleClick = function() {
        
            dialog.openBtn.enabled = true;
            doOpenSession(CONST.SRCFOLDER + "/" + dialog.sessions.selection.text);
        }
    }
}
/**
 * Opens a session
 *
 */
function doOpenSession(filepath) {

    var read_file = new File(filepath);

    if (read_file) {
    
        dialog.close();

        try {
            if (read_file.alias) {
                while (read_file.alias) {
                    read_file = read_file.resolve().openDlg(
                        CONST.CHOOSE_FILE, 
                        txt_filter, 
                        false
                    );
                }
            }
        }
        catch(ex) {
            dialog.msgBox.text = ex.message;
        }

        try {
    
            read_file.open('r', undefined, undefined);
            if (read_file !== '') {
                var _json = read_file.read();
                var obj = eval(_json);
                if (typeof(obj) == "object") {
            
                    if (obj.length) {
                        for(i=0; i<obj.length; i++) {
                
                            //alert(obj[i]);
                            doc = app.open(new File(obj[i]));
                        }
                    }
                }
                read_file.close();
            }
        }
        catch(ex) {

            try { read_file.close(); }catch(ex){};
            dialog.msgBox.text = ex.message;
            logger(session_logfile, "ERROR: " + ex.message);
        }
    }

    userInteractionLevel = originalInteractionLevel;
}

/**
 * Write text to a file
 * @param string filename   The filename into which to save the file
 * @param string txt         The text to write to the file
 * @return void
 */
function logger(filename, txt) {  

    var file = new File(CONST.LOGFOLDER + "/" + filename);  
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
