// 
// Class that represents a stream of CSV objects.
// It's different to a normal Node.js stream because each object is pulled from the stream using a promise.
//

const papaparse = require('papaparse');

import * as fs from 'fs';
import { assert } from 'chai';
import { IStream } from './stream';

export class CsvStream implements IStream {

    private loaded: string[][] = []; // Store intermediate results from the csv file.
    private error: any; // Records any error that might occur.
    private csvParser: any; // Track the csv parser so it can be restarted when necessary.
    private done: boolean = false; // Record when the process has completed.

    //
    // Column names that are read from the first row of the csv stream.
    //
    private columnNames?: string[];
    private columnNamesRead: boolean = false; // Set to true when column names have been read.

    // Promise that is pending when next has been called a client is waiting for incoming data.
    private nextResolve: Function | null = null;
    private nextReject: Function | null = null;

    // Promise that is pending while waiting for headers to be read.
    private columnsResolve: Function[] = [];
    private columnsReject: Function[] = [];

    private satisfyColumnNamesPromise (): void {
        if (this.columnsResolve.length > 0) {
            for (var columnsResolve of this.columnsResolve) {
                columnsResolve(this.columnNames);
            }
        }

        this.columnsResolve.length = 0;
        this.columnsReject.length = 0;
    }

    private unloadRow (): IteratorResult<string[]> {

        assert(this.loaded.length > 0, "Expected there to be rows to unloaded!");

        var nextRow = this.loaded[0];
        this.loaded.shift();

        var outputObject: any = {};

        for (var columnIndex = 0; columnIndex < this.columnNames!.length; ++columnIndex) {
            var columnName = this.columnNames![columnIndex];
            outputObject[columnName] = nextRow[columnIndex]
        }

        return {
            done: false,
            value: outputObject
        };
    }

    private raiseError (err: any): void {

        if (this.columnsReject.length) {
            for (var columnsReject of this.columnsReject) {
                columnsReject(err);
            }
        }

        this.columnsResolve.length = 0;
        this.columnsReject.length = 0;

        if (this.nextReject) {
            this.nextReject(err);
        }

        this.nextResolve = null;
        this.nextReject = null;
    }

    constructor(inputFilePath: string, config?: any) {

        try {
            var csvConfig = Object.assign({}, config || {});
            
            if (csvConfig.columnNames) {
                this.columnNames = config.columnNames; // Already have column names.
                this.columnNamesRead = true;
            }

            delete csvConfig.headers; // We are doing this manually!
            delete csvConfig.dynamicTyping; // Type parsing is done manually.

            csvConfig.step = (results: any, parser: any) => { // Handles incoming rows of CSV data.

                if (!this.columnNamesRead && results.data.length > 0) {
                    this.columnNamesRead = true;

                    this.columnNames = results.data[0] as string[];
                    results.data.shift(); // Remove first row.

                    this.satisfyColumnNamesPromise();
                }

                this.loaded = this.loaded.concat(results.data);

                if (this.loaded.length > 0) {
                    if (this.nextResolve) {
                        this.nextResolve(this.unloadRow());
                        this.nextResolve = null;
                        this.nextReject = null;
                    }
                }

                if (this.loaded.length > 0) {
                    // We still have data waiting for delivery.
                    // Pause the parser until someone asks for more.
                    this.csvParser = parser;
                    this.csvParser.pause(); 
                }
            };

            csvConfig.complete = () => { // File read operation has completed.
                this.done = true;  

                if (this.nextResolve) {
                    this.nextResolve(<IteratorResult<any>> {
                        done: true
                    });
                    this.nextResolve = null;
                    this.nextReject = null;
                }
            };

            csvConfig.error = (err: any) => { // An error has occurred.
                if (this.error) {
                    return; // An error is already logged.
                }
                
                this.error = err;   
                this.raiseError(err);
            };
            
            const fileInputStream = fs.createReadStream(inputFilePath); // Create stream for reading the input file.
            papaparse.parse(fileInputStream, csvConfig);
        }
        catch (err) {
            this.error = err;
        }
    }

    //
    // Read column names from the stream.
    //
    getColumnNames (): Promise<string[]> {
        if (this.error) {
            return Promise.reject(this.error);
        }

        if (this.columnNamesRead) {
            return Promise.resolve(this.columnNames!);
        }

        if (this.done) {
            return Promise.resolve([]); // Probably an empty file that contained 0 columns.
        }

        // Return promise to satisfy columns later.
        return new Promise((resolve, reject) => {
            this.columnsResolve.push(resolve);
            this.columnsReject.push(reject);
        });
    }

    //
    // Read a CSV row from the stream.
    //
    read(): Promise<IteratorResult<any>> {
        assert(!this.nextResolve, "Read already in progress 1");
        assert(!this.nextReject, "Read already in progress 2");

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
            } as IteratorResult<any>);
        }
        
        if (this.csvParser) {
            this.csvParser.resume(); // Resume the parsers consumation of the file stream.
            this.csvParser = null;
        }

        // Queue a promise to return the item when it comes in.
        return new Promise((resolve, reject) => {
            this.nextResolve = resolve;
            this.nextReject = reject;
        });
    }
};
