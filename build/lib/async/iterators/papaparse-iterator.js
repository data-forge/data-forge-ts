"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var papaparse = require('papaparse');
//
// An iterator that iterates a CSV file thanks to Papa Parse.
//
var PapaParseIterator = /** @class */ (function () {
    function PapaParseIterator(inputFilePath, config) {
        var _this = this;
        this.done = false; // Record when the process has completed.
        // Promise that is pending when next has been called a client is waiting for incoming data.
        this.pendingPromiseResolve = null;
        this.pendingPromiseReject = null;
        try {
            var csvConfig = Object.assign({}, config || {});
            csvConfig.step = function (results, parser) {
                _this.loaded = results.data;
                _this.csvParser = parser;
                _this.csvParser.pause(); // Pause the parser until we deal with the current results.
                if (_this.pendingPromiseResolve) {
                    var nextResult = _this.loaded[0];
                    _this.loaded.unshift();
                    _this.pendingPromiseResolve({
                        done: false,
                        value: nextResult
                    });
                    _this.pendingPromiseResolve = null;
                    _this.pendingPromiseReject = null;
                }
            };
            csvConfig.complete = function () {
                _this.done = true;
                if (_this.pendingPromiseResolve) {
                    _this.pendingPromiseResolve({
                        done: true
                    });
                    _this.pendingPromiseResolve = null;
                    _this.pendingPromiseReject = null;
                }
            };
            csvConfig.error = function (err) {
                _this.error = err;
                if (_this.pendingPromiseReject) {
                    _this.pendingPromiseReject(err);
                    _this.pendingPromiseResolve = null;
                    _this.pendingPromiseReject = null;
                }
            };
            var fileInputStream = fs.createReadStream(inputFilePath); // Create stream for reading the input file.
            papaparse.parse(fileInputStream, csvConfig);
        }
        catch (err) {
            this.error = err;
        }
    }
    PapaParseIterator.prototype.next = function () {
        var _this = this;
        if (this.error) {
            throw this.error;
        }
        if (this.loaded && this.loaded.length > 0) {
            // 
            // Data is waiting to be returned.
            //
            var nextResult = this.loaded[0];
            this.loaded.unshift();
            return Promise.resolve({
                done: false,
                value: nextResult,
            });
        }
        if (this.done) {
            // Data has been exhausted.
            return Promise.resolve({
                done: true
            });
        }
        if (this.csvParser) {
            this.csvParser.resume(); // Fetch more data.
            this.csvParser = null;
        }
        return new Promise(function (resolve, reject) {
            _this.pendingPromiseResolve = resolve;
            _this.pendingPromiseReject = reject;
        });
    };
    return PapaParseIterator;
}());
exports.PapaParseIterator = PapaParseIterator;
//# sourceMappingURL=papaparse-iterator.js.map