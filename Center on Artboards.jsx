#target Illustrator
#include "utils.jsx";

var CONFIG = {
	LOGGING			: true,
	LOG_FOLDER 		: '~/Desktop/ai-logs/',
	LOG_FILE_PATH	: '~/Desktop/ai-logs/' + Utils.doDateFormat(new Date()) + '-log.txt',
};

var originalInteractionLevel = userInteractionLevel;
userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

if ( app.documents.length > 0) {
    doc = app.activeDocument;
    
    var doc  = app.activeDocument;      
    var progress = showProgressBar(doc.artboards.length);

    for (i=0; i<doc.artboards.length; i++) {  
    
    	doc.artboards.setActiveArtboardIndex(i);
    
		var activeAB = doc.artboards[doc.artboards.getActiveArtboardIndex()];
		var right = activeAB.artboardRect[2];
		var bottom = activeAB.artboardRect[3];
		
		doc.selectObjectsOnActiveArtboard();
		
		for (x = 0 ; x < selection.length; x++) {
            try {
                selection[x].position = [
					Math.round((right - selection[x].width)/2),
					Math.round((bottom + selection[x].height)/2)
				];
            }
            catch(e) {
                Utils.logger('ERROR - ' + e.message);
            }
        }
        redraw();
        updateProgress(progress);
    }
    progress.close();
}
else  {  
	alert("There are no open documents");  
} 

try {
	userInteractionLevel = originalInteractionLevel;
}
catch(ex) {/*Exit Gracefully*/}