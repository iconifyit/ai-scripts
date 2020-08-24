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

/**
 * The base Progress class.
 * @constructor
 */
function Progress( options, show ) {

    this.top      = 0;
    this.left     = 0;
    this.width    = 450;
    this.height   = 130;

    this.minvalue = 0;
    this.maxvalue = 100;

    this.label    = "";

    this.window   = null;
    this.panel    = null;

    if ( typeof(options) != "undefined" ) {
        for (key in options) {
            if (this.hasOwnProperty(key)) {
                this[key] = options[key];
            }
        }
        this.init( this.minvalue, this.maxvalue, this.label );
    }

    if (show) this.show();
}

/**
 * Initialize start settings.
 * @param {integer} start
 * @param {integer} end
 */
Progress.prototype.init = function(start, end, message) {

    var top    = 0,
        right  = 0,
        bottom = 0,
        left   = 0;

    try {
        this.minvalue = start;
        this.maxvalue = end;
        this.label    = message;

        this.top      = 0;
        this.left     = 0;
        this.width    = 450;
        this.height   = 140;

        if ( bounds = getScreenSize() ) {
            left = Math.abs(Math.ceil((bounds.width/2) - (this.width/2)));
            top = Math.abs(Math.ceil((bounds.height/2) - (this.height/2)));
        }

        this.window = new Window(
            'palette',
            'Progress',
            [left, top, left + this.width, top + this.height]
        );

        this.window.pnl = this.window.add(
            'panel',
            [10, 10, 440, 130],
            'Progress'
        );

        this.window.pnl.progBar = this.window.pnl.add(
            'progressbar',
            [20, 65, 410, 90],
            0,
            this.maxvalue
        );

        this.window.pnl.progBarLabel = this.window.pnl.add(
            'statictext',
            [20, 20, 410, 35],
            "Item 0 of " + this.maxvalue
        );

        this.window.pnl.progBarLabel2 = this.window.pnl.add(
            'statictext',
            [20, 35, 410, 60],
            (typeof(this.label) != "undefined" ? " " + this.label : "" )
        );
    }
    catch(e) {alert(e)}

    function getScreenSize() {
        var screen;

        for (i=0; i<$.screens.length; i++) {
            if ($.screens[i].primary == true) {
                screen = $.screens[i];
                screen.width = screen.right - screen.left;
                screen.height = screen.bottom - screen.top;
            }
        }
        return screen;
    }

    return this;
};

/**
 * Show the progress bar.
 */
Progress.prototype.show = function() {
    try { this.close(); } catch(e){};
    this.window.show();

    return this;
};

/**
 * Update the progress bar message & counter values.
 * @param {string} theMessage
 */
Progress.prototype.update = function( theMessage ) {

    this.increment();

    this.text( 'Item ' + this.value() + ' of ' + this.max(), theMessage );

    $.sleep(10);
    this.window.update();

    return this;
};

/**
 * Set or get the progress text.
 * @param   {string} theValue
 * @returns {*}
 */
Progress.prototype.text = function( firstLine, secondLine ) {
    if (typeof(firstLine) != "undefined") {
        this.window.pnl.progBarLabel.text = firstLine;
    }
    if (typeof(secondLine) != "undefined") {
        this.window.pnl.progBarLabel2.text = secondLine;
    }
    return this.window.pnl.progBarLabel.text +
        this.window.pnl.progBarLabel2.text;
};

/**
 * Set or get the progress current value.
 * @param  {integer} theValue
 * @returns {*}
 */
Progress.prototype.value = function( theValue ) {
    if (typeof(theValue) != "undefined") {
        this.window.pnl.progBar.value = theValue;
    }
    return this.window.pnl.progBar.value;
};

/**
 * Get or set the minimum value.
 * @param {integer} theValue
 */
Progress.prototype.min = function( theValue ) {
    if (typeof(theValue) != "undefined") {
        this.window.pnl.progBar.minvalue = theValue;
    }
    this.window.pnl.progBar.minvalue;

    return this;
};

/**
 * Get or set the maximum value.
 * @param   {integer} theValue
 * @returns {number|integer|*}
 */
Progress.prototype.max = function( theValue ) {
    if (typeof(theValue) != "undefined") {
        this.window.pnl.progBar.maxvalue = theValue;
    }
    return this.window.pnl.progBar.maxvalue;
};

/**
 * Increment the counter value.
 * @returns {*}
 */
Progress.prototype.increment = function() {
    this.window.pnl.progBar.value++;
    return this.window.pnl.progBar.value;
};

/**
 * Close the progress bar.
 */
Progress.prototype.close = function() {
    this.window.close();
};
