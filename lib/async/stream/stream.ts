//
// Interface to a stream of data.
// Returns objects incrementally.
//

export interface IStream {

    //
    // Read column names from the stream.
    //
    getColumnNames (): Promise<string[]>;
    
    //
    // Read an object from the stream.
    //
    read(): Promise<IteratorResult<any>>;
    
}