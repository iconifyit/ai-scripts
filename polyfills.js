var polyfills = {loaded: true};
/**
 * Adds replaceAll method to String
 * @param search
 * @param replacement
 * @returns {string}
 */
if (! String.prototype.replaceAll) {
    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };
}

/**
 * Adds trim function to the String class.
 * @returns {string}
 */
if (! String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

/**
 * Adds a method to star out a string (like a password).
 * @returns {string}
 */
if (! String.prototype.obfuscate) {
    String.prototype.obfuscate = function() {
        return this.replace(/./g, "*");
    };
}

if (! Array.prototype.map) {
    /**
     * Add map method to Array prototype.
     * @param fn
     */
    Array.prototype.map = function(fn) {
        for (var i = 0; i < this.length; i++) {
            this[i] = fn.call(this, this[i]);
        }
        return this;
    }
}

/**
 * Add Array.indexOf support if not supported natively.
 */
if (! Array.prototype.indexOf) {
    /**
     * Gets the index of an element in an array.
     * @param what
     * @param i
     * @returns {*}
     */
    Array.prototype.indexOf = function(what, i) {
        i = i || 0;
        var L = this.length;
        while (i < L) {
            if(this[i] === what) return i;
            ++i;
        }
        return -1;
    };
}

/**
 * Add Array.remove support.
 * @returns {Array}
 */
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
