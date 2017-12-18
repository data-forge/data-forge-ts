import { IStream } from './stream';
export interface IStreamFactory {
    instantiate(filePath: string, config?: any): IStream;
}
