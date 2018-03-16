// 
// Class that represents a stream of objects read from a JSON file.
// It's different to a normal Node.js stream because each object is pulled from the stream using a promise.
//

import * as fs from 'fs';
import { assert } from 'chai';
import { IStream } from './stream';
const bfj = require('bfj');

export class JsonStream implements IStream {

    private loaded: string[][] = []; // Store intermediate results from the csv file.
    private error: any; // Records any error that might occur.
    private done: boolean = false; // Record when the process has completed.
    private resume: Function | null = null; // Function used to resume the emitter when it is paused.

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

        var nextResult = this.loaded[0];
        this.loaded.shift();
        return {
            done: false,
            value: nextResult
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
            const fileInputStream = fs.createReadStream(inputFilePath);
            let inArray: number = 0;
            let curObject: any = null;
            let curProperty: string | null = null;

            const emitter = bfj.walk(fileInputStream);

            emitter.on(bfj.events.array, () => {
                ++inArray;
            });
            
            emitter.on(bfj.events.object, () => {
                if (inArray <= 0) {
                    throw new Error("Expected JSON file to contain an array at the root level.");
                }

                curObject = {};
            });

            emitter.on(bfj.events.property, (name: string) => {
                curProperty = name;
            });

            let onValue = (value: any) => {
                curObject[curProperty!] = value;
                curProperty = null;
            };

            emitter.on(bfj.events.string, onValue);
            emitter.on(bfj.events.number, onValue);
            emitter.on(bfj.events.literal, onValue);

            emitter.on(bfj.events.endObject, () => {

                if (!this.columnNamesRead) {
                    this.columnNamesRead = true;
                    this.columnNames = Object.keys(curObject);

                    this.satisfyColumnNamesPromise();
                }

                this.loaded.push(curObject);
                curObject = null; // Finished processing this object.

                if (this.loaded.length > 0) {
                    if (this.nextResolve) {
                        this.nextResolve(this.unloadRow());
                        this.nextResolve = null;
                        this.nextReject = null;
                    }
                }

                if (this.loaded.length > 0) {
                    // We still have data waiting for delivery.
                    // Pause the emitter until someone asks for more.
                    this.resume = emitter.pause(); 
                }
            });

            emitter.on(bfj.events.endArray, () => {
                --inArray;
                if (inArray > 0) {
                    return; // Still in an array.
                }

                this.done = true;

                if (this.nextResolve) {
                    this.nextResolve(<IteratorResult<any>> {
                        done: true
                    });
                    this.nextResolve = null;
                    this.nextReject = null;
                }
            });

            emitter.on(bfj.events.error, (err: any) => {
                if (this.error) {
                    // Error is already registered.
                    return;
                }

                this.error = err;
                this.raiseError(err);
            });
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
    
        if (this.resume) {
            this.resume();
            this.resume = null;
        }

        // Queue a promise to return the item when it comes in.
        return new Promise((resolve, reject) => {
            this.nextResolve = resolve;
            this.nextReject = reject;
        });
    }
};
