"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./lib/index");
exports.Index = index_1.Index;
var series_1 = require("./lib/series");
exports.Series = series_1.Series;
var dataframe_1 = require("./lib/dataframe");
exports.DataFrame = dataframe_1.DataFrame;
var chai_1 = require("chai");
var dataframe_2 = require("./lib/dataframe");
var BabyParse = require("babyparse");
var csv_rows_iterable_1 = require("./lib/iterables/csv-rows-iterable");
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
var dr = new dataframe_2.DataFrame([
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
//# sourceMappingURL=index.js.map