app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

var doc       = activeDocument,
    artboard  = doc.artboards[doc.artboards.getActiveArtboardIndex()];

var count = doc.artboards.length;

try {
    if (confirm('Are you sure you want to rename all artboards?')) {
        for (var i = 0; i < count; i++) {

            doc.selection = null;

            doc.artboards.setActiveArtboardIndex(i);
            artboard = doc.artboards[
                doc.artboards.getActiveArtboardIndex()
                ];
            doc.selectObjectsOnActiveArtboard();

            artboard.name = doc.selection[0].parent.name;
        }
    }
}
catch(e) {alert(e)}

