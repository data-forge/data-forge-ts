"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
Symbol["asyncIterator"] = Symbol.asyncIterator || Symbol.for("asyncIterator");
var index_1 = require("./lib/index");
exports.Index = index_1.Index;
var async_index_1 = require("./lib/async/async-index");
exports.AsyncIndex = async_index_1.AsyncIndex;
var series_1 = require("./lib/series");
exports.Series = series_1.Series;
var async_series_1 = require("./lib/async/async-series");
exports.AsyncSeries = async_series_1.AsyncSeries;
var dataframe_1 = require("./lib/dataframe");
exports.DataFrame = dataframe_1.DataFrame;
var async_dataframe_1 = require("./lib/async/async-dataframe");
exports.AsyncDataFrame = async_dataframe_1.AsyncDataFrame;
var chai_1 = require("chai");
var dataframe_2 = require("./lib/dataframe");
var async_dataframe_2 = require("./lib/async/async-dataframe");
var BabyParse = require("babyparse");
var csv_rows_iterable_1 = require("./lib/iterables/csv-rows-iterable");
var stream_iterable_1 = require("./lib/async/iterables/stream-iterable");
var stream_column_names_iterable_1 = require("./lib/async/iterables/stream-column-names-iterable");
var csv_stream_1 = require("./lib/async/stream/csv-stream");
var json_stream_1 = require("./lib/async/stream/json-stream");
/**
 * Deserialize a dataframe from a JSON text string.
 *
 * @param jsonTextString The JSON text to deserialize.
 * @param [config] Optional configuration option to pass to the dataframe.
 *
 * @returns Returns a dataframe that has been deserialized from the JSON data.
 */
function fromJSON(jsonTextString, config) {
    chai_1.assert.isString(jsonTextString, "Expected 'jsonTextString' parameter to 'dataForge.fromJSON' to be a string containing data encoded in the JSON format.");
    if (config) {
        chai_1.assert.isObject(config, "Expected 'config' parameter to 'dataForge.fromJSON' to be an object with configuration to pass to the DataFrame.");
    }
    return new dataframe_2.DataFrame({
        values: JSON.parse(jsonTextString)
    });
}
exports.fromJSON = fromJSON;
/**
 * Deserialize a DataFrame from a CSV text string.
 *
 * @param csvTextString The CSV text to deserialize.
 * @param [config] Optional configuration option to pass to the DataFrame.
 *
 * @returns Returns a dataframe that has been deserialized from the CSV data.
 */
function fromCSV(csvTextString, config) {
    chai_1.assert.isString(csvTextString, "Expected 'csvTextString' parameter to 'dataForge.fromCSV' to be a string containing data encoded in the CSV format.");
    if (config) {
        chai_1.assert.isObject(config, "Expected 'config' parameter to 'dataForge.fromJSON' to be an object with configuration to pass to the DataFrame.");
        if (config.columnNames) {
            chai_1.assert.isArray(config.columnNames, "Expect 'columnNames' field of 'config' parameter to DataForge.fromCSV to be an array of strings that specify column names.");
            config.columnNames.forEach(function (columnName) {
                chai_1.assert.isString(columnName, "Expect 'columnNames' field of 'config' parameter to DataForge.fromCSV to be an array of strings that specify column names.");
            });
        }
    }
    var parsed = BabyParse.parse(csvTextString, config);
    var rows = parsed.data;
    if (rows.length === 0) {
        return new dataframe_2.DataFrame();
    }
    var columnNames;
    rows = rows.map(function (row) {
        return row.map(function (cell) { return cell.trim(); }); // Trim each cell.
    });
    if (config && config.columnNames) {
        columnNames = config.columnNames;
    }
    else {
        columnNames = rows.shift();
    }
    return new dataframe_2.DataFrame({
        values: new csv_rows_iterable_1.CsvRowsIterable(columnNames, rows),
        columnNames: columnNames,
    });
}
exports.fromCSV = fromCSV;
/**
 * Reads a file asynchonrously to a dataframe.
 */
var AsyncFileReader = /** @class */ (function () {
    function AsyncFileReader(filePath) {
        this.filePath = filePath;
    }
    /**
     * Deserialize a CSV file to a DataFrame.
     * Returns a promise that later resolves to a DataFrame.
     *
     * @param [config] Optional configuration file for parsing.
     *
     * @returns Returns a promise of a dataframe loaded from the file.
     */
    AsyncFileReader.prototype.parseCSV = function (config) {
        var _this = this;
        if (config) {
            chai_1.assert.isObject(config, "Expected optional 'config' parameter to dataForge.readFile(...).parseCSV(...) to be an object with configuration options for CSV parsing.");
        }
        return new Promise(function (resolve, reject) {
            var fs = require('fs');
            fs.readFile(_this.filePath, 'utf8', function (err, csvData) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(fromCSV(csvData, config));
            });
        });
    };
    /**
     * Deserialize a JSON file to a DataFrame.
     * Returns a promise that later resolves to a DataFrame.
     *
     * @param [config] Optional configuration file for parsing.
     *
     * @returns Returns a promise of a dataframe loaded from the file.
     */
    AsyncFileReader.prototype.parseJSON = function (config) {
        var _this = this;
        if (config) {
            chai_1.assert.isObject(config, "Expected optional 'config' parameter to dataForge.readFile(...).parseJSON(...) to be an object with configuration options for JSON parsing.");
        }
        return new Promise(function (resolve, reject) {
            var fs = require('fs');
            fs.readFile(_this.filePath, 'utf8', function (err, jsonData) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(fromJSON(jsonData, config));
            });
        });
    };
    return AsyncFileReader;
}());
/**
 * Read a file asynchronously from the file system.
 * Works in Nodejs, doesn't work in the browser.
 *
 * @param filePath The path to the file to read.
 *
 * @returns Returns an object that represents the file. Use `parseCSV` or `parseJSON` to deserialize to a DataFrame.
 */
function readFile(filePath) {
    chai_1.assert.isString(filePath, "Expected 'filePath' parameter to dataForge.readFile to be a string that specifies the path of the file to read.");
    return new AsyncFileReader(filePath);
}
exports.readFile = readFile;
/**
 * Reads a file synchonrously to a dataframe.
 */
var SyncFileReader = /** @class */ (function () {
    function SyncFileReader(filePath) {
        this.filePath = filePath;
    }
    /**
     * Deserialize a CSV file to a DataFrame.
     *
     * @param [config] Optional configuration file for parsing.
     *
     * @returns Returns a dataframe that was deserialized from the file.
     */
    SyncFileReader.prototype.parseCSV = function (config) {
        if (config) {
            chai_1.assert.isObject(config, "Expected optional 'config' parameter to dataForge.readFileSync(...).parseCSV(...) to be an object with configuration options for CSV parsing.");
        }
        var fs = require('fs');
        return fromCSV(fs.readFileSync(this.filePath, 'utf8'), config);
    };
    /**
     * Deserialize a JSON file to a DataFrame.
     *
     * @param [config] Optional configuration file for parsing.
     *
     * @returns Returns a dataframe that was deserialized from the file.
     */
    SyncFileReader.prototype.parseJSON = function (config) {
        if (config) {
            chai_1.assert.isObject(config, "Expected optional 'config' parameter to dataForge.readFileSync(...).parseJSON(...) to be an object with configuration options for JSON parsing.");
        }
        var fs = require('fs');
        return fromJSON(fs.readFileSync(this.filePath, 'utf8'), config);
    };
    return SyncFileReader;
}());
/**
 * Read a file synchronously from the file system.
 * Works in Nodejs, doesn't work in the browser.
 *
 * @param filePath The path to the file to read.
 *
 * @returns Returns an object that represents the file. Use `parseCSV` or `parseJSON` to deserialize to a DataFrame.
 */
function readFileSync(filePath) {
    chai_1.assert.isString(filePath, "Expected 'filePath' parameter to dataForge.readFileSync to be a string that specifies the path of the file to read.");
    return new SyncFileReader(filePath);
}
exports.readFileSync = readFileSync;
/**
 * Reads a file incrementally to an incremental dataframe.
 */
var IncrementalFileReader = /** @class */ (function () {
    function IncrementalFileReader(filePath) {
        this.filePath = filePath;
    }
    /**
     * Deserialize a CSV file to a DataFrame.
     * Returns a promise that later resolves to a DataFrame.
     *
     * @param [config] Optional configuration file for parsing.
     *
     * @returns Returns a promise of a dataframe loaded from the file.
     */
    IncrementalFileReader.prototype.parseCSV = function (config) {
        if (config) {
            chai_1.assert.isObject(config, "Expected optional 'config' parameter to dataForge.readFile(...).parseCSV(...) to be an object with configuration options for CSV parsing.");
        }
        var streamFactory = {
            instantiate: function (inputFilePath, config) {
                return new csv_stream_1.CsvStream(inputFilePath, config);
            }
        };
        var streamIterable = new stream_iterable_1.StreamIterable(streamFactory, this.filePath, config);
        return new async_dataframe_2.AsyncDataFrame({
            values: streamIterable,
            columnNames: config && config.columnNames || new stream_column_names_iterable_1.StreamColumnNamesIterable(streamIterable),
        });
    };
    /**
     * Deserialize a JSON file to a DataFrame.
     * Returns a promise that later resolves to a DataFrame.
     *
     * @param [config] Optional configuration file for parsing.
     *
     * @returns Returns a promise of a dataframe loaded from the file.
     */
    IncrementalFileReader.prototype.parseJSON = function (config) {
        if (config) {
            chai_1.assert.isObject(config, "Expected optional 'config' parameter to dataForge.readFile(...).parseJSON(...) to be an object with configuration options for JSON parsing.");
        }
        var streamFactory = {
            instantiate: function (inputFilePath, config) {
                return new json_stream_1.JsonStream(inputFilePath, config);
            }
        };
        var streamIterable = new stream_iterable_1.StreamIterable(streamFactory, this.filePath, config);
        return new async_dataframe_2.AsyncDataFrame({
            values: streamIterable,
            columnNames: new stream_column_names_iterable_1.StreamColumnNamesIterable(streamIterable),
        });
    };
    return IncrementalFileReader;
}());
/**
 * Read a file incrementally from the file system.
 * This allows very large files (that don't fit in available memory) to be processed by Data-Forge.
 * Works in Nodejs, doesn't work in the browser.
 *
 * @param filePath The path to the file to read.
 *
 * @returns Returns an object that represents the file. Use `parseCSV` or `parseJSON` to deserialize to an AsyncDataFrame.
 */
function readFileIncremental(filePath) {
    chai_1.assert.isString(filePath, "Expected 'filePath' parameter to dataForge.readFile to be a string that specifies the path of the file to read.");
    return new IncrementalFileReader(filePath);
}
exports.readFileIncremental = readFileIncremental;
/*
var dr = new DataFrame([
    {
        A: 1,
        B: 2,
    },
    {
        A: 10,
        B: 20,
    }
]);

console.log(dr.toString());
*/
//var s = await readFileStream("C:\projects\github\nodejs-chart-rendering-example-data\data\example-data.csv")
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var s, s, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, readFileIncremental("./test/data/example-data.csv")
                            .parseCSV()
                            .toString()];
                case 1:
                    s = _a.sent();
                    console.log(s);
                    return [4 /*yield*/, readFileIncremental("./test/data/example-data.json")
                            .parseJSON()
                            .toString()];
                case 2:
                    s = _a.sent();
                    console.log(s);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=index.js.map