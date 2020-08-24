function find() {
    
    var doc,
        needle;
        
    doc = activeDocument;    

	needle = prompt("Enter a search string", "");

	doc.selection = null;

	try {
		for (var i = 0; i < doc.artboards.length; i++) {
			if (doc.artboards[i].name.toLowerCase().indexOf(needle) >= 0) {
				doc.artboards.setActiveArtboardIndex(i);
				doc.selectObjectsOnActiveArtboard();
			}
		}
	}
	catch(e) {alert('Error 2 : ' + e)}
}
find();
