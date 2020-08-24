/**
 * ArtboardLabelsError object
 * @param message
 * @param stack
 * @constructor
 */
var ArtboardLabelsError = function(message, stack) {
    this.message = message || 'Unknown ArtboardLabelsError';
    this.stack   = stack   || null;
}
ArtboardLabelsError.prototype = Error.prototype;


/**
 * Create artboard labels.
 * @constructor
 */
var ArtboardLabels = function() {
    if ( ! app.activeDocument) {
        alert(new ArtboardLabelsError("There are no open documents", $.stack));
    }
    else {
        var doc,
            artboard,
            artboards,
            theLabel;
        
        doc       = app.activeDocument;
        artboards = doc.artboards;
        
        theLayer = doc.layers.add();
        theLayer.name = '__LABELS';
        
        doc.activeLayer = theLayer;

        for (var i = 0; i < app.activeDocument.artboards.length; i++)  {
        
            doc.artboards.setActiveArtboardIndex(i);
            
            artboard = artboards[i];

            theLabel = doc.textFrames.add();

            theLabel.contents = artboard.name;

            theLabel.textRange.characterAttributes.size = 8;

            theLabel.position = [
                artboard.artboardRect[0], 
                artboard.artboardRect[1] - (artboard.artboardRect[1] - (theLabel.height - 2))
            ];
        }
    }
}

new ArtboardLabels();