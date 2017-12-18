//
// An interface for a factory that can create data streams.
//

import { IStream } from './stream';

export interface IStreamFactory {

    //
    // Instantiate a stream for a particular file.
    //
    instantiate (filePath: string, config?: any): IStream;

};