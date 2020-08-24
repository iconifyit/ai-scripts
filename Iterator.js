/**
 * Iterator class.
 * @type {{
 *    prototype: {
 *        items: Array,
 *        index: number,
 *        constructor: Iterator.constructor,
 *        first: Iterator.first,
 *        last: Iterator.last,
 *        hasNext: Iterator.hasNext,
 *        nextIndex: Iterator.nextIndex,
 *        next: Iterator.next, hasPrevious:
 *        Iterator.hasPrevious, previousIndex:
 *        Iterator.previousIndex,
 *        previous: Iterator.previous,
 *        current: Iterator.current,
 *        reset: Iterator.reset,
 *        each: Iterator.each,
 *        add: Iterator.add,
 *        insertAt: Iterator.insertAt,
 *        insertBefore: Iterator.insertBefore,
 *        insertAfter: Iterator.insertAfter,
 *        remove: Iterator.remove,
 *        removeAt: Iterator.removeAt,
 *        pop: Iterator.pop,
 *        shift: Iterator.shift,
 *        getItem: Iterator.getItem,
 *        getItems: Iterator.getItems,
 *        isInBounds: Iterator.isInBounds,
 *        checkBounds: Iterator.checkBounds,
 *        hasIndex: Iterator.hasIndex
 *     }
 * }}
 */
function Iterator(items) {

    if (items instanceof Object) {
        this.items = items;
    }
    else if (null == items || typeof(items) == "undefined") {
        this.items = [];
    }
    else {
        throw new Error(localize({en_US: "Iterator requires an array"}));
    }

}

/**
 * {array}  The iterable items.
 */
Iterator.prototype.items = [];

/**
 * {number}
 */
Iterator.prototype.index = 0;

/**
 * Reset the pointer to the first item, return the first item.
 * @returns {*}
 */
Iterator.prototype.first = function() {
    this.reset();
    return this.next();
}

/**
 * Position the cursor at the last position, return the last item.
 * @returns {*}
 */
Iterator.prototype.last = function() {
    this.index = this.items.length-1;
    return this.items[this.index];
}

/**
 * Test if there is a next item in the collection from the current index.
 * @returns {boolean}
 */
Iterator.prototype.hasNext = function() {
    return this.getIndex() < this.items.length;
}

/**
 * Get the next index relative to the current position.
 * @returns {number}
 */
Iterator.prototype.nextIndex = function() {
    return this.getIndex() + 1;
}

/**
 * Get the current index.
 * @returns {number}
 */
Iterator.prototype.getIndex = function() {
    return this.index;
}

/**
 * Get the next item after the current item.
 * @returns {*}
 */
Iterator.prototype.next = function() {
    return this.items[this.index++];
}

/**
 * Test if there is an item before the current item.
 * @returns {boolean}
 */
Iterator.prototype.hasPrevious = function() {
    try {
        var test = this.items[this.previousIndex()];
        return (typeof(test) !== "undefined");
    }
    catch(e) {
        return false;
    }
}

/**
 * Test if there is an index before the current position.
 * @returns {number}
 */
Iterator.prototype.previousIndex = function() {
    return this.getIndex() - 1;
}

/**
 * Get the previous item from the collection.
 * @returns {*}
 */
Iterator.prototype.previous = function() {
    return this.items[this.index--];
}

/**
 * Get the current item from the collection.
 * @returns {*}
 */
Iterator.prototype.current = function() {
    return this.items[this.index];
}

/**
 * Reset the pointer to the start of the collection.
 */
Iterator.prototype.reset = function() {
    this.index = 0;
    return this.getItems();
}

/**
 * Loop through the collection from start to finish.
 * @param callback
 */
Iterator.prototype.each = function(callback) {
    try {
        this.reset();
        while (this.hasNext()) {
            callback.apply(this.current(), [this.current(), this.getIndex()]);
            this.next();
        }
        return true;
    }
    catch(e) {
        // $.writeln(e);
        // logger.info(e);
    }
}

/**
 * Add an item to the collection.
 * @param item
 */
Iterator.prototype.add = function(item) {
    this.items.push(item);
}

/**
 * Insert an item into the collection at a given position.
 * @param item
 * @param idx
 * @returns {*}
 */
Iterator.prototype.insertAt = function(item, idx) {
    if (this.checkBounds(idx)) {
        this.items = [].concat(
            this.items.slice(0, idx-1),
            new Array().push(item),
            this.items.slice(idx+1, this.items.length)
        );
        return this.getItems();
    }
}

/**
 * Insert an item into the collection before a given position.
 * @param item
 * @param idx
 * @returns {*}
 */
Iterator.prototype.insertBefore = function(item, idx) {
    if (this.checkBounds(idx)) {
        return this.insertAt(item, idx-1);
    }
}

/**
 * Insert an item into the collection after a given position.
 * @param item
 * @param idx
 * @returns {*}
 */
Iterator.prototype.insertAfter = function(item, idx) {
    if (this.checkBounds(idx)) {
        return this.insertAt(item, idx+1);
    }
}

/**
 * Remove an item from the collection. `item` may be an integer (index) or an object literal.
 * @param {*}   item
 * @returns {*|Array}
 */
Iterator.prototype.remove = function(item) {
    if (item instanceof Number) {
        this.removeAt(parseInt(item));
    }
    else {
        for (var i=0; i<this.items.length; i++) {
            if (this.getItem(i).toSource() == item.toSource()) {
                this.removeAt(i);
            }
        }
    }
    return this.getItems();
}

/**
 * Remove an item at a given position.
 * @param idx
 * @returns {*}
 */
Iterator.prototype.removeAt = function(idx) {
    if (this.checkBounds(idx)) {
        return this.items = [].concat(
            this.items.slice(0, idx-1),
            this.items.slice(idx+1, this.items.length)
        );
        return this.getItems();
    }
}

/**
 * Return the last item off of the collection.
 * @returns {*}
 */
Iterator.prototype.pop = function() {
    return this.items[this.items.length-1];
}

/**
 * Return the first item from the collection.
 * @returns {*}
 */
Iterator.prototype.shift = function() {
    return this.items[0];
}

/**
 * Get an item by index/position in the collection.
 * @param idx
 * @returns {*}
 */
Iterator.prototype.getItem = function(idx) {
    if (this.checkBounds(idx)) {
        return this.items[i];
    }
}

/**
 * Get all items from the collection.
 * @returns {Array}
 */
Iterator.prototype.getItems = function() {
    return this.items;
}

/**
 * Test whether a give index is valid.
 * @param idx
 * @returns {*|boolean}
 */
Iterator.prototype.isInBounds = function(idx) {
    return this.hasIndex(idx) && idx <= this.items.lenth + 1;
}

/**
 * Check if an index is valid (exists and is in bounds).
 * @param idx
 * @returns {boolean}
 */
Iterator.prototype.checkBounds = function(idx) {
    if (! this.isInBounds(idx)) {
        throw new Error( localize( {en_US: "Index [%1] is out of bounds"}, idx) );
    }
    return true;
}

/**
 * Test if the collection has an item at the given position.
 * @param idx
 * @returns {boolean}
 */
Iterator.prototype.hasIndex = function(idx) {
    if (isNaN(idx)) return false;
    if (this.items.length < 0) return false;
    if (idx < 0) return false;
    if (idx > this.items.length) return false;
}

/**
 * Gets the size of the iterable collection.
 * @returns {Number}
 */
Iterator.prototype.size = function() {
    return this.items.length;
}
