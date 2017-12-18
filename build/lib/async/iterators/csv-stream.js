"use strict";
// 
// Class that represents a stream of CSV objects.
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
var papaparse = require('papaparse');
var fs = require("fs");
var chai_1 = require("chai");
var CsvStream = /** @class */ (function () {
    function CsvStream(inputFilePath, config) {
        var _this = this;
        this.loaded = []; // Store intermediate results from the csv file.
        this.done = false; // Record when the process has completed.
        this.columnNamesRead = false; // Set to true when column names have been read.
        // Promise that is pending when next has been called a client is waiting for incoming data.
        this.nextResolve = null;
        this.nextReject = null;
        // Promise that is pending while waiting for headers to be read.
        this.columnsResolve = [];
        this.columnsReject = [];
        try {
            var csvConfig = Object.assign({}, config || {});
            if (csvConfig.columnNames) {
                this.columnNames = config.columnNames; // Already have column names.
                this.columnNamesRead = true;
            }
            delete csvConfig.headers; // We are doing this manually!
            delete csvConfig.dynamicTyping; // Type parsing is done manually.
            csvConfig.step = function (results, parser) {
                if (!_this.columnNamesRead && results.data.length > 0) {
                    _this.columnNamesRead = true;
                    _this.columnNames = results.data[0];
                    results.data.shift(); // Remove first row.
                    _this.satisfyColumnNamesPromise();
                }
                _this.loaded = _this.loaded.concat(results.data);
                if (_this.loaded.length > 0) {
                    if (_this.nextResolve) {
                        _this.nextResolve(_this.unloadRow());
                        _this.nextResolve = null;
                        _this.nextReject = null;
                    }
                }
                if (_this.loaded.length > 0) {
                    // We still have data waiting for delivery.
                    // Pause the parser until someone asks for more.
                    _this.csvParser = parser;
                    _this.csvParser.pause();
                }
            };
            csvConfig.complete = function () {
                _this.done = true;
                if (_this.nextResolve) {
                    _this.nextResolve({
                        done: true
                    });
                    _this.nextResolve = null;
                    _this.nextReject = null;
                }
            };
            csvConfig.error = function (err) {
                _this.error = err;
                _this.raiseError(err);
            };
            var fileInputStream = fs.createReadStream(inputFilePath); // Create stream for reading the input file.
            papaparse.parse(fileInputStream, csvConfig);
        }
        catch (err) {
            this.error = err;
        }
    }
    CsvStream.prototype.satisfyColumnNamesPromise = function () {
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
    CsvStream.prototype.unloadRow = function () {
        chai_1.assert(this.loaded.length > 0, "Expected there to be rows to unloaded!");
        var nextResult = this.loaded[0];
        this.loaded.shift();
        return {
            done: false,
            value: nextResult
        };
    };
    CsvStream.prototype.raiseError = function (err) {
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
    CsvStream.prototype.getColumnNames = function () {
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
    CsvStream.prototype.read = function () {
        var _this = this;
        chai_1.assert(!this.nextResolve, "Read already in progress 1");
        chai_1.assert(!this.nextReject, "Read already in progress 2");
        if (this.error) {
            return Promise.reject(this.error);
        }
        if (this.done) {
            // Finished
            return Promise.resolve({
                done: true
            });
        }
        if (this.loaded.length > 0) {
            return Promise.resolve(this.unloadRow());
        }
        if (this.csvParser) {
            this.csvParser.resume(); // Resume the parsers consumation of the file stream.
            this.csvParser = null;
        }
        // Queue a promise to return the item when it comes in.
        return new Promise(function (resolve, reject) {
            _this.nextResolve = resolve;
            _this.nextReject = reject;
        });
    };
    return CsvStream;
}());
exports.CsvStream = CsvStream;
;
//# sourceMappingURL=csv-stream.js.map