/**
 * toggles all artboard's Crosshair and Center Mark visibility
 * @author https://forums.adobe.com/people/CarlosCanto
 */ 
 
#target Illustrator  
  
var artboards = app.activeDocument.artboards;  
var state     = artboards[0].showCenter^=1;  
  
for (i=0; i < artboards.length; i++) {  
    artboards[i].showCenter     = state;  
    artboards[i].showCrossHairs = state;  
}