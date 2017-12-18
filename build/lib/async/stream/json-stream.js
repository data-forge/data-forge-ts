"use strict";
// 
// Class that represents a stream of objects read from a JSON file.
// It's different to a normal Node.js stream because each object is pulled from the stream using a promise.
//
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var chai_1 = require("chai");
var bfj = require('bfj');
var JsonStream = /** @class */ (function () {
    function JsonStream(inputFilePath, config) {
        var _this = this;
        this.loaded = []; // Store intermediate results from the csv file.
        this.done = false; // Record when the process has completed.
        this.unpause = null; // Function used to resume the emitter when it is paused.
        this.columnNamesRead = false; // Set to true when column names have been read.
        // Promise that is pending when next has been called a client is waiting for incoming data.
        this.nextResolve = null;
        this.nextReject = null;
        // Promise that is pending while waiting for headers to be read.
        this.columnsResolve = [];
        this.columnsReject = [];
        try {
            var fileInputStream = fs.createReadStream(inputFilePath);
            var inArray_1 = 0;
            var curObject_1 = null;
            var curProperty_1 = null;
            var emitter = bfj.walk(fileInputStream);
            emitter.on(bfj.events.array, function () {
                ++inArray_1;
            });
            emitter.on(bfj.events.object, function () {
                if (inArray_1 <= 0) {
                    throw new Error("Expected JSON file to contain an array at the root level.");
                }
                curObject_1 = {};
            });
            emitter.on(bfj.events.property, function (name) {
                curProperty_1 = name;
            });
            var onValue = function (value) {
                curObject_1[curProperty_1] = value;
                curProperty_1 = null;
            };
            emitter.on(bfj.events.string, onValue);
            emitter.on(bfj.events.number, onValue);
            emitter.on(bfj.events.literal, onValue);
            emitter.on(bfj.events.endObject, function () {
                if (!_this.columnNamesRead) {
                    _this.columnNamesRead = true;
                    _this.columnNames = Object.keys(curObject_1);
                    _this.satisfyColumnNamesPromise();
                }
                _this.loaded.push(curObject_1);
                curObject_1 = null; // Finished processing this object.
                if (_this.loaded.length > 0) {
                    if (_this.nextResolve) {
                        _this.nextResolve(_this.unloadRow());
                        _this.nextResolve = null;
                        _this.nextReject = null;
                    }
                }
                if (_this.loaded.length > 0) {
                    // We still have data waiting for delivery.
                    // Pause the emitter until someone asks for more.
                    //todo: this.unpause = emitter.pause(); 
                }
            });
            emitter.on(bfj.events.endArray, function () {
                --inArray_1;
                if (inArray_1 > 0) {
                    return; // Still in an array.
                }
                _this.done = true;
                if (_this.nextResolve) {
                    _this.nextResolve({
                        done: true
                    });
                    _this.nextResolve = null;
                    _this.nextReject = null;
                }
            });
            emitter.on(bfj.events.error, function (err) {
                if (_this.error) {
                    // Error is already registered.
                    return;
                }
                _this.error = err;
                _this.raiseError(err);
            });
        }
        catch (err) {
            this.error = err;
        }
    }
    JsonStream.prototype.satisfyColumnNamesPromise = function () {
        if (this.columnsResolve.length > 0) {
            try {
                for (var _a = __values(this.columnsResolve), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var columnsResolve = _b.value;
                    columnsResolve(this.columnNames);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        this.columnsResolve.length = 0;
        this.columnsReject.length = 0;
        var e_1, _c;
    };
    JsonStream.prototype.unloadRow = function () {
        chai_1.assert(this.loaded.length > 0, "Expected there to be rows to unloaded!");
        var nextResult = this.loaded[0];
        this.loaded.shift();
        return {
            done: false,
            value: nextResult
        };
    };
    JsonStream.prototype.raiseError = function (err) {
        if (this.columnsReject.length) {
            try {
                for (var _a = __values(this.columnsReject), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var columnsReject = _b.value;
                    columnsReject(err);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        this.columnsResolve.length = 0;
        this.columnsReject.length = 0;
        if (this.nextReject) {
            this.nextReject(err);
        }
        this.nextResolve = null;
        this.nextReject = null;
        var e_2, _c;
    };
    //
    // Read column names from the stream.
    //
    JsonStream.prototype.getColumnNames = function () {
        var _this = this;
        if (this.error) {
            return Promise.reject(this.error);
        }
        if (this.columnNamesRead) {
            return Promise.resolve(this.columnNames);
        }
        if (this.done) {
            return Promise.resolve([]); // Probably an empty file that contained 0 columns.
        }
        // Return promise to satisfy columns later.
        return new Promise(function (resolve, reject) {
            _this.columnsResolve.push(resolve);
            _this.columnsReject.push(reject);
        });
    };
    //
    // Read a CSV row from the stream.
    //
    JsonStream.prototype.read = function () {
        var _this = this;
        chai_1.assert(!this.nextResolve, "Read already in progress 1");
        chai_1.assert(!this.nextReject, "Read already in progress 2");
        if (this.error) {
            return Promise.reject(this.error);
        }
        if (this.loaded.length > 0) {
            return Promise.resolve(this.unloadRow());
        }
        if (this.done) {
            // Finished
            return Promise.resolve({
                done: true
            });
        }
        if (this.unpause) {
            this.unpause();
            this.unpause = null;
        }
        // Queue a promise to return the item when it comes in.
        return new Promise(function (resolve, reject) {
            _this.nextResolve = resolve;
            _this.nextReject = reject;
        });
    };
    return JsonStream;
}());
exports.JsonStream = JsonStream;
;
//# sourceMappingURL=json-stream.js.map