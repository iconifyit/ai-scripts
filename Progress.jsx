/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Scott Lewis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

var Progress = {

	top: 0,
	
	left: 0,
	
	width: 450,
	
	height: 100,
	
	minvalue: 0,
	
	maxvalue: 100,
	
	window: null,
	
	panel: null,
	
	init: function(start, end) {
	
		Progress.minvalue = start;
		Progress.maxvalue = end;

		var top, right, bottom, left;
		
		Progress.top = 0;
		Progress.left = 0;
		Progress.width = 450;
		Progress.height = 100;

		if ( bounds = Utils.getScreenSize() ) {
			left = Math.abs(Math.ceil((bounds.width/2) - (Progress.width/2)));
			top = Math.abs(Math.ceil((bounds.height/2) - (Progress.height/2)));
		}

		Progress.window = new Window(
			'palette', 
			'Progress', 
			[left, top, left + Progress.width, top + Progress.height]
		);
		
		Progress.window.pnl = progress.add(
			'panel', 
			[10, 10, 440, 100], 
			'Progress'
		);
		
		Progress.window.pnl.progBar = progress.pnl.add(
			'progressbar', 
			[20, 35, 410, 60], 
			0, 
			Progress.maxvalue
		);
		
		Progress.window.pnl.progBarLabel = progress.pnl.add(
			'statictext', 
			[20, 20, 320, 35], 
			"0 of " + Progress.maxvalue
		);
	},
	
    show: function() {
        try { Progress.close(); } catch(e){};
		Progress.obj.show();
    },
    
    update: function() {
    	Progress.window.pnl.progBar.value++;
		var val = Progress.window.pnl.progBar.value;
		var max = Progress.window.pnl.progBar.maxvalue;
		Progress.window.pnl.progBarLabel.text = val + ' of ' + max;
		$.sleep(10);
		Progress.window.update();
    },
    
    close: function() {
    	Progress.window.close();
    }
};