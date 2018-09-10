import * as Sugar from 'sugar';
export { Index, IIndex } from './lib/index';
export { Series, ISeries, SelectorWithIndexFn } from './lib/series';
export { DataFrame, IDataFrame } from './lib/dataframe';

import { assert } from 'chai';
import { ArrayIterable } from './lib/iterables/array-iterable';
import { CsvRowsIterable } from './lib/iterables/csv-rows-iterable';
import { Series, ISeries } from '.';
import { DataFrame, IDataFrame } from '.';

const PapaParse = require('papaparse');

/**
 * Represents a field from a JavaScript object.
 */
export interface IFieldRecord {
    /**
     * The name of the field.
     */
    Field: string;

    /**
     * The value of the field.
     */
    Value: any;
};

/**
 * Convert a regular JavaScript obejct to a dataframe.
 * Each row in the dataframe represents a field from the object.
 * 
 * @param obj - The JavaScript object to convert to a dataframe.
 * 
 * @returns Returns a dataframe that lists the fields in the pass-in object.
 */
export function fromObject (obj: any): IDataFrame<number, IFieldRecord> {
    return new DataFrame<number, IFieldRecord>(
        Object.keys(obj)
            .map(fieldName => ({
                Field: fieldName,
                Value: obj[fieldName],
            }))
    );
}

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
     * Optionally specifies the column names (when enabled, assumes that the header row is not read from the CSV data).
     * Default: undefined
     */
    columnNames?: Iterable<string>;

    /**
     * Automatically pick types based on what the value looks like.
     * Default: false.
     */
    dynamicTyping?: boolean;

    /**
     * Skip empty lines in the input.
     * Default: true
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
        
        if (config.skipEmptyLines === undefined) {
            config = Object.assign({}, config); // Clone the config. Don't want to modify the original.
            config.skipEmptyLines = true;
        }
    }
    else {
        config = {
            skipEmptyLines: true,
        }
    }

    const parsed = PapaParse.parse(csvTextString, config as any);
    let rows = <string[][]> parsed.data;

    if (rows.length === 0) {
        return new DataFrame<number, any>();
    }

    let columnNames;
    rows = rows.map(row => {
            return row.map(cell => Sugar.Object.isString(cell) ? cell.trim() : cell); // Trim each cell that is still a string.
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

//
// Promise-based read file.
//
function readFileData(filePath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const fs = require('fs');
        fs.readFile(filePath, 'utf8', (err: any, fileData: string) => {
            if (err) {
                reject(err);
                return;
            }
    
            resolve(fileData);
        });
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
 * @hidden
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
    async parseCSV (config?: ICSVOptions): Promise<IDataFrame<number, any>> {
        if (config) {
            assert.isObject(config, "Expected optional 'config' parameter to dataForge.readFile(...).parseCSV(...) to be an object with configuration options for CSV parsing.");
        }
        
        const fileData = await readFileData(this.filePath);
        return fromCSV(fileData, config);
    }

    /**
     * Deserialize a JSON file to a DataFrame.
     * Returns a promise that later resolves to a DataFrame.
     * 
     * @returns Returns a promise of a dataframe loaded from the file. 
     */
    async parseJSON (): Promise<IDataFrame<number, any>> {
        const fileData = await readFileData(this.filePath);
        return fromJSON(fileData);
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
 * @hidden
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
 * Replicate a particular value N times to create a series.
 * 
 * @param value The value to replicate.
 * @param count The number of times to replicate the value.
 * 
 * @returns Returns a new series that contains N copies of the value.
 */
export function replicate<ValueT> (value: ValueT, count: number): ISeries<number, ValueT> {
    const values: ValueT[] = [];
    for (let i = 0; i < count; ++i) {
        values.push(value);
    }

    return new Series<number, ValueT>(values);
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
