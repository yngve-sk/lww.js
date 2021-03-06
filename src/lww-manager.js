const _ = require('lodash');
let Dock = require('./lww-dock');
let LWW = require('./lww-window');

/**
 *
 * @version 0.1
 * @author Yngve S. Kristiansen
 * @author original source 1: Simplex Studio, LTD &
 * @author original source (actual original source): http://codepen.io/zz85/post/resizing-moving-snapping-windows-with-js-css, https://github.com/zz85
 *
 * @licence The MIT License (MIT)
 * @Copyright Copyright © 2015 Simplex Studio, LTD
 * @Copyright Copyright © 2015 https://github.com/zz85
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the “Software”), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/*
    Manages...
    * the dock
    * Z-indexing
    * spawning / despawning
    * positioning of the windows, ability to spawn next to an arbitrary div (Powered by popper.js) (TODO)
*/

class LWWManager {
    constructor(args) {
        this.cache = {

        };

        this.docks = {};
        this.windows = {};

        this.zOrder = []; // index -> name, 0 is back, N is front

        this.zStart = args.zStart || 21;

        this.zIndices = [];

        this.parent = document.body;
    }

    moveToFront(window) {
        _.pull(this.zOrder, window.name);
        this.zOrder.push(window.name);
        this._reflowZIndices();
    }

    _reflowZIndices() {
        _.each(this.zOrder, (name, i) =>
            this.windows[name].Z = this.zStart + i);
    }

    setParent(parent) {
        this.parent = parent;
    }

    // Creates a dock that windows can be minimized to / maximized from
    createDock(name, args) {
        this.docks[name] = new Dock(name, args, this);
    }

    addWindow(name, args) {
        this.windows[name] = new LWW(name, args, this);
        if (args.options.dock.name) {
            this.connectWindowToDock(name, args.options.dock.name);
        }

        this._reflowZIndices();
    }

    getWindow(name) {
        return this.windows[name];
    }

    destroyWindow(name) {
        let window = this.windows[name];

        this.docks[window.options.dock.name].undockWindow(name);
        delete this.windows[name];
    }

    connectWindowToDock(windowName, dockName) {
        this.docks[dockName].addWindow(this.windows[windowName]);
    }

    deleteWindow(name) {
        if (!this.windows.hasOwnProperty(name))
            throw new Error("Trying to delete window with name " + name + ", it doesn't exist.");

        delete this.windows[name];
    }
}

module.exports = LWWManager;