import { assert, expect } from 'chai';
import 'mocha';
import * as mock from 'mock-require';

import * as dataForge from '../index';

describe('readFile csv', () => {

    afterEach(() => {
        mock.stop('fs');
        mock.stop('request-promise');
    });

    it('can read CSV file asynchronously', () => {

        var testFilePath = "some/file.csv"
        var testCsvData 
            = "Col1,Col2\r\n"
            + "1,2\r\n"
            + "3,4"
            ; 

        mock('fs', { 
            readFile: (filePath: string, dataFormat: string, callback: Function) => {
                expect(filePath).to.eql(testFilePath);
                expect(dataFormat).to.eql('utf8');

                callback(null, testCsvData);
            },
        });
        
        return dataForge
            .readFile(testFilePath)
            .parseCSV()
            .then(dataFrame => {
                expect(dataFrame.toCSV()).to.eql(testCsvData);
            })
            ;
    });

    it('can read CSV file synchronously', () => {

        var testFilePath = "some/file.csv"
        var testCsvData 
            = "Col1,Col2\r\n"
            + "1,2\r\n"
            + "3,4"
            ; 

        mock('fs', { 
            readFileSync: (filePath: string, dataFormat: string) => {
                expect(filePath).to.eql(testFilePath);
                expect(dataFormat).to.eql('utf8');

                return testCsvData;
            },
        });
        
        var dataFrame = dataForge.readFileSync(testFilePath).parseCSV();
        expect(dataFrame.toCSV()).to.eql(testCsvData);
    });
});