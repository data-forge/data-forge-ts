import { IStream } from './stream';
export declare class JsonStream implements IStream {
    private loaded;
    private error;
    private done;
    private unpause;
    private columnNames?;
    private columnNamesRead;
    private nextResolve;
    private nextReject;
    private columnsResolve;
    private columnsReject;
    private satisfyColumnNamesPromise();
    private unloadRow();
    private raiseError(err);
    constructor(inputFilePath: string, config?: any);
    getColumnNames(): Promise<string[]>;
    read(): Promise<IteratorResult<any>>;
}
