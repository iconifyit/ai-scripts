/**
 * Based on the script resizeArtboards_CS4andUp.jsx by Carlos Canto 11/4/12
 */

#target Illustrator  

var OPTIONS = {
    size: 32
}

if (app.documents.length > 0) {  
  
  
    var idoc  = app.activeDocument;  
    var title = "Resize All Artboards";  

    //var width = Number(Window.prompt ("Enter New Artboard Width in points", 612, title));  
    //var height = Number(Window.prompt ("Enter New Artboard Height in points", 792, title));  
    
    OPTIONS.size = Number(Window.prompt ("Enter New Artboard size in pixels (W & H)", 32, title));
  
    try {
        var width  = OPTIONS.size;
        var height = OPTIONS.size;

        for (i=0; i<idoc.artboards.length; i++) {
            var abBounds = idoc.artboards[i].artboardRect;// left, top, right, bottom


            var ableft = abBounds[0]; // 0
            var abtop = abBounds[1]; // 612
            var abwidth = abBounds[2] - ableft; // 792 // width
            var abheight = abtop- abBounds[3]; // 0 // height

            var abctrx = abwidth/2+ableft;
            var abctry = abtop-abheight/2;

            var ableft = abctrx-width/2;
            var abtop = abctry+height/2;
            var abright = abctrx+width/2;
            var abbottom = abctry-height/2;

            idoc.artboards[i].artboardRect = [ableft, abtop, abright, abbottom];
        }
    }
    catch(e) {
        /** Exist gracfully for now */
    }
}  
 else  {  
        alert ("there are no open documents");  
} 