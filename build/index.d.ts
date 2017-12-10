export { Index, IIndex } from './lib/index';
export { Series, ISeries, SelectorFn } from './lib/series';
export { DataFrame, IDataFrame } from './lib/dataframe';
import { DataFrame, IDataFrame } from './lib/dataframe';
/**
 * Deserialize a dataframe from a JSON text string.
 *
 * @param jsonTextString The JSON text to deserialize.
 * @param [config] Optional configuration option to pass to the dataframe.
 *
 * @returns Returns a dataframe that has been deserialized from the JSON data.
 */
export declare function fromJSON(jsonTextString: string, config?: any): IDataFrame<number, any>;
/**
 * Deserialize a DataFrame from a CSV text string.
 *
 * @param csvTextString The CSV text to deserialize.
 * @param [config] Optional configuration option to pass to the DataFrame.
 *
 * @returns Returns a dataframe that has been deserialized from the CSV data.
 */
export declare function fromCSV(csvTextString: string, config?: any): DataFrame<number, any>;
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
    parseCSV(config?: any): Promise<IDataFrame<number, any>>;
    /**
     * Deserialize a JSON file to a DataFrame.
     * Returns a promise that later resolves to a DataFrame.
     *
     * @param [config] Optional configuration file for parsing.
     *
     * @returns Returns a promise of a dataframe loaded from the file.
     */
    parseJSON(config?: any): Promise<IDataFrame<number, any>>;
}
/**
 * Read a file asynchronously from the file system.
 * Works in Nodejs, doesn't work in the browser.
 *
 * @param filePath The path to the file to read.
 *
 * @returns Returns an object that represents the file. Use `parseCSV` or `parseJSON` to deserialize to a DataFrame.
 */
export declare function readFile(filePath: string): IAsyncFileReader;
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
    parseCSV(config?: any): IDataFrame<number, any>;
    /**
     * Deserialize a JSON file to a DataFrame.
     *
     * @param {object} [config] - Optional configuration file for parsing.
     *
     * @returns {DataFrame} Returns a dataframe that was deserialized from the file.
     */
    parseJSON(config?: any): IDataFrame<number, any>;
}
/**
 * Read a file synchronously from the file system.
 * Works in Nodejs, doesn't work in the browser.
 *
 * @param filePath The path to the file to read.
 *
 * @returns Returns an object that represents the file. Use `parseCSV` or `parseJSON` to deserialize to a DataFrame.
 */
export declare function readFileSync(filePath: string): ISyncFileReader;
