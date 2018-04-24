(<any>Symbol)["asyncIterator"] = Symbol.asyncIterator || Symbol.for("asyncIterator");

import * as Sugar from 'sugar';
export { Index, IIndex } from './lib/index';
export { AsyncIndex, IAsyncIndex } from './lib/async/async-index';
export { Series, ISeries, SelectorWithIndexFn } from './lib/series';
export { AsyncSeries, IAsyncSeries } from './lib/async/async-series';
export { DataFrame, IDataFrame } from './lib/dataframe';
export { AsyncDataFrame, IAsyncDataFrame } from './lib/async/async-dataframe';

import { assert } from 'chai';
import { AsyncDataFrame, IAsyncDataFrame } from './lib/async/async-dataframe';
import * as fs from 'fs';
import * as BabyParse from 'babyparse';
import { ArrayIterable } from './lib/iterables/array-iterable';
import { CsvRowsIterable } from './lib/iterables/csv-rows-iterable';
import { StreamIterable } from './lib/async/iterables/stream-iterable';
import { StreamColumnNamesIterable } from './lib/async/iterables/stream-column-names-iterable';
import { IStreamFactory } from './lib/async/stream/stream-factory';
import { IStream } from './lib/async/stream/stream';
import { CsvStream } from './lib/async/stream/csv-stream';
import { JsonStream } from './lib/async/stream/json-stream';
import { Series, ISeries } from '.';
import { DataFrame, IDataFrame } from '.';

/**
 * Deserialize a dataframe from a JSON text string.
 *
 * @param jsonTextString The JSON text to deserialize.
 * 
 * @returns Returns a dataframe that has been deserialized from the JSON data.
 */
export function fromJSON (jsonTextString: string): IDataFrame<number, any> {
    
    assert.isString(jsonTextString, "Expected 'jsonTextString' parameter to 'dataForge.fromJSON' to be a string containing data encoded in the JSON format.");

    return new DataFrame<number, any>({
        values: JSON.parse(jsonTextString)
    });
}

/**
 * Options for parsing CSV data.
 */
export interface ICSVOptions {
    /**
     * Optional column names to read from the CSV data.
     */
    columnNames?: Iterable<string>;

    /**
     * Automatically pick types based on what the value looks like.
     */
    dynamicTyping?: boolean;

    /**
     * Skip empty lines in the input.
     */
    skipEmptyLines?: boolean;
}

/**
 * Deserialize a DataFrame from a CSV text string.
 *
 * @param csvTextString The CSV text to deserialize.
 * @param [config] Optional configuration options for parsing the CSV data.
 * 
 * @returns Returns a dataframe that has been deserialized from the CSV data.
 */
export function fromCSV (csvTextString: string, config?: ICSVOptions) {
    assert.isString(csvTextString, "Expected 'csvTextString' parameter to 'dataForge.fromCSV' to be a string containing data encoded in the CSV format.");

    if (config) {
        assert.isObject(config, "Expected 'config' parameter to 'dataForge.fromCSV' to be an object with CSV parsing configuration options.");

        if (config.columnNames) {
            if (!Sugar.Object.isFunction(config.columnNames[Symbol.iterator])) {
                assert.isArray(config.columnNames, "Expect 'columnNames' field of 'config' parameter to DataForge.fromCSV to be an array or iterable of strings that specifies column names.")
            }


            for (const columnName of config.columnNames) {
                assert.isString(columnName, "Expect 'columnNames' field of 'config' parameter to DataForge.fromCSV to be an array of strings that specify column names.")
            }
        }			
    }

    const parsed = BabyParse.parse(csvTextString, config as any);
    let rows = <string[][]> parsed.data;

    if (rows.length === 0) {
        return new DataFrame<number, any>();
    }

    let columnNames;
    rows = rows.map(row => {
            return row.map(cell => cell.trim()); // Trim each cell.
        });

    if (config && config.columnNames) {
        columnNames = config.columnNames;
    }
    else {
        columnNames = rows.shift();
    }

    return new DataFrame<number, any>({
        rows: rows,
        columnNames: columnNames,
    });
}

/**
 * Reads a file asynchonrously to a dataframe.
 */
export interface IAsyncFileReader {

    /**
     * Deserialize a CSV file to a DataFrame.
     * Returns a promise that later resolves to a DataFrame.
     * 
     * @param [config] Optional configuration file for parsing.
     * 
     * @returns Returns a promise of a dataframe loaded from the file. 
     */
    parseCSV (config?: ICSVOptions): Promise<IDataFrame<number, any>>;

    /**
     * Deserialize a JSON file to a DataFrame.
     * Returns a promise that later resolves to a DataFrame.
     * 
     * @returns Returns a promise of a dataframe loaded from the file. 
     */
    parseJSON (): Promise<IDataFrame<number, any>>;
}

/**
 * Reads a file asynchonrously to a dataframe.
 */
class AsyncFileReader implements IAsyncFileReader {

    filePath: string;

    constructor(filePath: string) {
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
    parseCSV (config?: ICSVOptions): Promise<IDataFrame<number, any>> {
        if (config) {
            assert.isObject(config, "Expected optional 'config' parameter to dataForge.readFile(...).parseCSV(...) to be an object with configuration options for CSV parsing.");
        }

        return new Promise((resolve: Function, reject: Function) => {
            var fs = require('fs');
            fs.readFile(this.filePath, 'utf8', (err: any, csvData: string) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(fromCSV(csvData, config));
            });
        });
    }

    /**
     * Deserialize a JSON file to a DataFrame.
     * Returns a promise that later resolves to a DataFrame.
     * 
     * @returns Returns a promise of a dataframe loaded from the file. 
     */
    parseJSON (): Promise<IDataFrame<number, any>> {

        return new Promise((resolve: Function, reject: Function) => {
            var fs = require('fs');
            fs.readFile(this.filePath, 'utf8', (err: any, jsonData: string) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(fromJSON(jsonData));
            });
        });
    } 
}

/**
 * Read a file asynchronously from the file system.
 * Works in Nodejs, doesn't work in the browser.
 * 
 * @param filePath The path to the file to read.
 * 
 * @returns Returns an object that represents the file. Use `parseCSV` or `parseJSON` to deserialize to a DataFrame.
 */
export function readFile (filePath: string): IAsyncFileReader {

    assert.isString(filePath, "Expected 'filePath' parameter to dataForge.readFile to be a string that specifies the path of the file to read.");

    return new AsyncFileReader(filePath);
}

/**
 * Reads a file synchonrously to a dataframe.
 */
export interface ISyncFileReader {

    /**
     * Deserialize a CSV file to a DataFrame.
     * 
     * @param [config] Optional configuration file for parsing.
     * 
     * @returns Returns a dataframe that was deserialized from the file.
     */
    parseCSV (config?: ICSVOptions): IDataFrame<number, any>;

    /**
     * Deserialize a JSON file to a DataFrame.
     * 
     * @returns {DataFrame} Returns a dataframe that was deserialized from the file.  
     */
    parseJSON (): IDataFrame<number, any>;
}

/**
 * Reads a file synchonrously to a dataframe.
 */
class SyncFileReader implements ISyncFileReader {

    filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    /**
     * Deserialize a CSV file to a DataFrame.
     * 
     * @param [config] Optional configuration file for parsing.
     * 
     * @returns Returns a dataframe that was deserialized from the file.
     */
    parseCSV (config?: ICSVOptions): IDataFrame<number, any> {
        if (config) {
            assert.isObject(config, "Expected optional 'config' parameter to dataForge.readFileSync(...).parseCSV(...) to be an object with configuration options for CSV parsing.");
        }

        const fs = require('fs');
        return fromCSV(fs.readFileSync(this.filePath, 'utf8'), config);
    }

    /**
     * Deserialize a JSON file to a DataFrame.
     * 
     * @param [config] Optional configuration file for parsing.
     * 
     * @returns Returns a dataframe that was deserialized from the file.  
     */
    parseJSON (): IDataFrame<number, any> {

        const fs = require('fs');
        return fromJSON(fs.readFileSync(this.filePath, 'utf8'));
    } 
}

/**
 * Read a file synchronously from the file system.
 * Works in Nodejs, doesn't work in the browser.
 * 
 * @param filePath The path to the file to read.
 * 
 * @returns Returns an object that represents the file. Use `parseCSV` or `parseJSON` to deserialize to a DataFrame.
 */
export function readFileSync (filePath: string): ISyncFileReader {

    assert.isString(filePath, "Expected 'filePath' parameter to dataForge.readFileSync to be a string that specifies the path of the file to read.");

    return new SyncFileReader(filePath);
}

/**
 * Reads a streaming file asynchonrously to a dataframe.
 */
export interface IIncrementalFileReader {

    /**
     * Deserialize a CSV file to a DataFrame.
     * Returns a promise that later resolves to a DataFrame.
     * 
     * @param [config] Optional configuration file for parsing.
     * 
     * @returns Returns a promise of a dataframe loaded from the file. 
     */
    parseCSV (config?: ICSVOptions): IAsyncDataFrame<number, any>;

    /**
     * Deserialize a JSON file to a DataFrame.
     * Returns a promise that later resolves to a DataFrame.
     * 
     * @returns Returns a promise of a dataframe loaded from the file. 
     */
    parseJSON (): IAsyncDataFrame<number, any>;
}

/**
 * Reads a file incrementally to an incremental dataframe.
 */
class IncrementalFileReader implements IIncrementalFileReader {

    filePath: string;

    constructor(filePath: string) {
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
    parseCSV (config?: ICSVOptions): IAsyncDataFrame<number, any> {
        if (config) {
            assert.isObject(config, "Expected optional 'config' parameter to dataForge.readFile(...).parseCSV(...) to be an object with configuration options for CSV parsing.");
        }

        var streamFactory: IStreamFactory = {
            instantiate (inputFilePath: string, config?: any): IStream {
                return new CsvStream(inputFilePath, config);
            }
        };

        var streamIterable = new StreamIterable(streamFactory, this.filePath, config);
        return new AsyncDataFrame({
            values: streamIterable,
            columnNames: /*todo: config && config.columnNames || */ new StreamColumnNamesIterable(streamIterable),
        });
    }

    /**
     * Deserialize a JSON file to a DataFrame.
     * Returns a promise that later resolves to a DataFrame.
     * 
     * @returns Returns a promise of a dataframe loaded from the file. 
     */
    parseJSON (): IAsyncDataFrame<number, any> {

        var streamFactory: IStreamFactory = {
            instantiate (inputFilePath: string, config?: any): IStream {
                return new JsonStream(inputFilePath, config);
            }
        };

        var streamIterable = new StreamIterable(streamFactory, this.filePath, {}); //todo: Does config even need to be passed in here?
        return new AsyncDataFrame({
            values: streamIterable,
            columnNames: new StreamColumnNamesIterable(streamIterable),
        });
    } 
}

/**
 * Read a file incrementally from the file system.
 * This allows very large files (that don't fit in available memory) to be processed by Data-Forge.
 * Works in Nodejs, doesn't work in the browser.
 * 
 * @param filePath The path to the file to read.
 * 
 * @returns Returns an object that represents the file. Use `parseCSV` or `parseJSON` to deserialize to an AsyncDataFrame.
 */
export function readFileIncremental (filePath: string): IIncrementalFileReader {

    assert.isString(filePath, "Expected 'filePath' parameter to dataForge.readFile to be a string that specifies the path of the file to read.");

    return new IncrementalFileReader(filePath);
}

const concat = Series.concat;

/**
 * Concatenate multiple series into a single series.
 * THIS FUNCTION IS DEPRECATED. Instead use dataFrame.Series.concat.
 * 
 * @param {array} series - Array of series to concatenate.
 *
 * @returns {Series} - Returns the single concatendated series.  
 */
export { concat as concatSeries };

const zip = Series.zip;

/**
 * Zip together multiple series to create a new series.
 * THIS FUNCTION IS DEPRECATED. Instead use dataFrame.Series.zip.
 *
 * @param {array} series - Array of series to zip together.
 * @param {function} selector - Selector function that produces a new series based on the input series.
 * 
 * @returns {Series} Returns a single series that is the combination of multiple input series that have been 'zipped' together by the 'selector' function.
 */
export { zip as zipSeries }

/**
 * Generate a series from a range of numbers.
 *
 * @param start - The value of the first number in the range.
 * @param count - The number of sequential values in the range.
 * 
 * @returns Returns a series with a sequence of generated values. The series contains 'count' values beginning at 'start'. 
 */
export function range (start: number, count: number): ISeries<number, number> {

    assert.isNumber(start, "Expect 'start' parameter to 'dataForge.range' function to be a number.");
    assert.isNumber(count, "Expect 'count' parameter to 'dataForge.range' function to be a number.");

    const values: number[] = [];
    for (let valueIndex = 0; valueIndex < count; ++valueIndex) {
        values.push(start + valueIndex);
    }

    return new Series<number, number>(values);
}

/**
 * Generate a data-frame containing a matrix of values.
 *
 * @param numColumns - The number of columns in the data-frame.
 * @param numRows - The number of rows in the data-frame.
 * @param start - The starting value.
 * @param increment - The value to increment by for each new value.
 * 
 * @returns Returns a dataframe that contains a matrix of generated values.
 */
export function matrix (numColumns: number, numRows: number, start: number, increment: number): IDataFrame<number, any> {
    assert.isNumber(numColumns, "Expect 'numColumns' parameter to 'dataForge.matrix' function to be a number.");
    assert.isNumber(numRows, "Expect 'numRows' parameter to 'dataForge.matrix' function to be a number.");
    assert.isNumber(start, "Expect 'start' parameter to 'dataForge.matrix' function to be a number.");
    assert.isNumber(increment, "Expect 'increment' parameter to 'dataForge.matrix' function to be a number.");

    const rows: number[][] = [];
    const columnNames: string[] = [];
    var nextValue = start;

    for (let colIndex = 0; colIndex < numColumns; ++colIndex) {
        columnNames.push((colIndex+1).toString());
    }
    
    for (let rowIndex = 0; rowIndex < numRows; ++rowIndex) {
        var row: number[] = [];

        for (let colIndex = 0; colIndex < numColumns; ++colIndex) {
            row.push(nextValue + (colIndex * increment));
        }

        nextValue += numColumns * increment;
        rows.push(row);
    }

    return new DataFrame({
        columnNames: columnNames,
        rows: rows,
    });
}

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

/*
async function main () {

    try {
        var s = await readFileIncremental("./src/test/data/example-data.csv")
            .parseCSV()
            .toString();
        console.log(s);

        var s = await readFileIncremental("./src/test/data/example-data.json")
            .parseJSON()
            .toString();

        console.log(s);
    }
    catch (err) {
        console.error(err); 
    }

}

main();
*/
