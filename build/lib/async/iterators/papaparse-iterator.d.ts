export declare class PapaParseIterator<T> implements AsyncIterator<T> {
    loaded: any[];
    error: any;
    csvParser: any;
    done: boolean;
    pendingPromiseResolve: Function | null;
    pendingPromiseReject: Function | null;
    constructor(inputFilePath: string, config?: any);
    next(): Promise<IteratorResult<T>>;
}
