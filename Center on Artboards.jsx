#target Illustrator
#include "utils.jsx";

var CONFIG = {
	LOGGING			: true,
	LOG_FILDER 		: '~/Desktop/ai-logs/',
	LOG_FILE_PATH	: '~/Desktop/ai-logs/' + Utils.doDateFormat(new Date()) + '-log.txt',
};

var originalInteractionLevel = userInteractionLevel;
userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

if ( app.documents.length > 0) {
    doc = app.activeDocument;
    
    var doc  = app.activeDocument;  
    var title = "Center Icons on Artboards"; 
    
    var progress = showProgressBar(doc.artboards.length);

    for (i=0; i<doc.artboards.length; i++) {  
    
    	doc.artboards.setActiveArtboardIndex(i);
    
    	var artboard = doc.artboards[i];
    	
    	// Get the active Artboard index
		var activeAB = doc.artboards[doc.artboards.getActiveArtboardIndex()];

		// Get the Width of the Artboard
		var artboardRight = activeAB.artboardRect[2];
		// Get the Height of the Artboard
		var artboardBottom = activeAB.artboardRect[3];
		
		doc.selectObjectsOnActiveArtboard();
		
		var items = selection;
		
		// alert(item.width);
		
		for (x = 0 ; x < items.length; x++) {
			var item = selection[x];
            try {
				var horziontalCenterPosition = (artboardRight - item.width)/2;
				var verticalCenterPosition = (artboardBottom + item.height)/2;
				item.position = [horziontalCenterPosition, verticalCenterPosition];
				
				item.left = Math.round(item.left);
                item.top = Math.round(item.top);
                updateProgress(progress);
            }
            catch(e) {
                Utils.logger('ERROR - ' + e.message);
            }
        }
        redraw();
    }
    
    progress.close();
}
else  {  
	alert("there are no open documents");  
} 

try {
	userInteractionLevel = originalInteractionLevel;
}
catch(ex) {/*Exit Gracefully*/}