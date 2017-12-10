
export { Index, IIndex } from './lib/index';
export { Series, ISeries, SelectorFn } from './lib/series';
export { DataFrame, IDataFrame } from './lib/dataframe';

import { assert } from 'chai';
import { DataFrame, IDataFrame } from './lib/dataframe';
import * as fs from 'fs';
import * as BabyParse from 'babyparse';
import { ArrayIterable } from './lib/iterables/array-iterable';
import { CsvRowsIterable } from './lib/iterables/csv-rows-iterable';

/**
 * Deserialize a dataframe from a JSON text string.
 *
 * @param jsonTextString The JSON text to deserialize.
 * @param [config] Optional configuration option to pass to the dataframe.
 * 
 * @returns Returns a dataframe that has been deserialized from the JSON data.
 */
export function fromJSON (jsonTextString: string, config?: any): IDataFrame<number, any> {
    
    assert.isString(jsonTextString, "Expected 'jsonTextString' parameter to 'dataForge.fromJSON' to be a string containing data encoded in the JSON format.");

    if (config) {
        assert.isObject(config, "Expected 'config' parameter to 'dataForge.fromJSON' to be an object with configuration to pass to the DataFrame.");
    }

    return new DataFrame<number, any>({
        values: JSON.parse(jsonTextString)
    });
}

/**
 * Deserialize a DataFrame from a CSV text string.
 *
 * @param csvTextString The CSV text to deserialize.
 * @param [config] Optional configuration option to pass to the DataFrame.
 * 
 * @returns Returns a dataframe that has been deserialized from the CSV data.
 */
export function fromCSV (csvTextString: string, config?: any) {
    assert.isString(csvTextString, "Expected 'csvTextString' parameter to 'dataForge.fromCSV' to be a string containing data encoded in the CSV format.");

    if (config) {
        assert.isObject(config, "Expected 'config' parameter to 'dataForge.fromJSON' to be an object with configuration to pass to the DataFrame.");

        if (config.columnNames) {
            assert.isArray(config.columnNames, "Expect 'columnNames' field of 'config' parameter to DataForge.fromCSV to be an array of strings that specify column names.")

            config.columnNames.forEach((columnName: string) => {
                assert.isString(columnName, "Expect 'columnNames' field of 'config' parameter to DataForge.fromCSV to be an array of strings that specify column names.")
            });
        }			
    }

    const parsed = BabyParse.parse(csvTextString, config);
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
        values: new CsvRowsIterable(columnNames, rows),
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
    parseCSV (config?: any): Promise<IDataFrame<number, any>>;

    /**
     * Deserialize a JSON file to a DataFrame.
     * Returns a promise that later resolves to a DataFrame.
     * 
     * @param [config] Optional configuration file for parsing.
     * 
     * @returns Returns a promise of a dataframe loaded from the file. 
     */
    parseJSON (config?: any): Promise<IDataFrame<number, any>>;
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
    parseCSV (config?: any): Promise<IDataFrame<number, any>> {
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
     * @param [config] Optional configuration file for parsing.
     * 
     * @returns Returns a promise of a dataframe loaded from the file. 
     */
    parseJSON (config?: any): Promise<IDataFrame<number, any>> {
        if (config) {
            assert.isObject(config, "Expected optional 'config' parameter to dataForge.readFile(...).parseJSON(...) to be an object with configuration options for JSON parsing.");
        }

        return new Promise((resolve: Function, reject: Function) => {
            var fs = require('fs');
            fs.readFile(this.filePath, 'utf8', (err: any, jsonData: string) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(fromJSON(jsonData, config));
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
    parseCSV (config?: any): IDataFrame<number, any>;

    /**
     * Deserialize a JSON file to a DataFrame.
     * 
     * @param {object} [config] - Optional configuration file for parsing.
     * 
     * @returns {DataFrame} Returns a dataframe that was deserialized from the file.  
     */
    parseJSON (config?: any): IDataFrame<number, any>;
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
    parseCSV (config?: any): IDataFrame<number, any> {
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
    parseJSON (config?: any): IDataFrame<number, any> {

        if (config) {
            assert.isObject(config, "Expected optional 'config' parameter to dataForge.readFileSync(...).parseJSON(...) to be an object with configuration options for JSON parsing.");
        }

        const fs = require('fs');
        return fromJSON(fs.readFileSync(this.filePath, 'utf8'), config);
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
