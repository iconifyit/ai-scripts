#target Illustrator
 
//  script.name        = resizeArtboard.jsx;
//  script.description = Resizes the artboards to a value entered by the user;
//  script.required    = one document with at least one piece of art;
//  script.parent      = Scott Lewis (iconifyit) based on shrinkABtoFitArt by carlos canto // 5/3/11;
//  script.elegant     = false;
 
// todo: As items are added to the group, log them in a queue to be removed 
//       from the group after the group has been centered

var OPTIONS = {
    size: 64
}

if (app.documents.length < 1) {
    alert("There are no open documents.");
}
else {

    var board;
    var bounds;
    var group;
    var size, width, height;
    var x1, y1, x2, y2;
    var doc = app.activeDocument;
    
    if (doc.pageItems.length < 1) { 
        alert("The active document does not contain any artwork.");
    }
    else {
        
        // If you're running this script on a single file, uncomment this line and 
        // comment out the hard-coded size variable on the subsequent line
        
        // size = Number(Window.prompt("Enter Artboard Size as a positive integer", 32, "Resize Artboard"));
        
        // If you're running this script as a batch, use a hard-coded size variable
        // else you will get a prompt on each iteration through your file list.
        
        // var size = 32;
        
        if ((isNaN(OPTIONS.size)) || OPTIONS.size < 1) {
            alert("ERROR: OPTIONS.size is not a number");
        }
        else {
                  
            board  = doc.artboards[doc.artboards.getActiveArtboardIndex()];
            bounds = board.artboardRect;
            
            for (i = 0; i < doc.layers.length; i++) { 
                doc.layers[i].hasSelectedArtwork = true; 
            }
            
            group = doc.groupItems.add();
            
            for (i = 0; i < doc.selection.length; i++) {
                doc.selection[i].moveToBeginning(group);
            }

            width  = group.width;
            height = group.height;
          
            // If the artwork is larger than the artboard, resize the artboard to the 
            // size of the artwork
            
            if (width > OPTIONS.size)  OPTIONS.size = width;
            if (height > OPTIONS.size) OPTIONS.size = height;
            
            // The bounds are plotted on a Cartesian Coordinate System.
            // So a 32 x 32 pixel artboard with have the following coords:
            // (assumes the artboard is positioned at 0, 0)
            // x1 = -16, y1 = 16, x2 = 16, y2 = -16

            x1 = bounds[0];
            y1 = bounds[1];
            x2 = bounds[0] + OPTIONS.size;
            y2 = bounds[1] - OPTIONS.size;
            
            board.artboardRect = [x1, y1, x2, y2];
            
            // Insanely, objects are positioned by top and left coordinates and not 
            // centered using the X/Y formmat above so we have to move the item 
            // from the center point of the item
          
            group.top  = y1 - ((OPTIONS.size - height) / 2);
            group.left = x1 + ((OPTIONS.size - width) / 2);

            var zoom = doc.activeView.zoom;
            doc.activeView.zoom = zoom + .01;
            doc.activeView.zoom = zoom;
        }
    }
}