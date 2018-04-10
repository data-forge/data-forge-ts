import { assert, expect } from 'chai';
import 'mocha';
import * as dataForge from '../index';
import * as mock from 'mock-require';

describe('DataFrame csv file', function () {

    afterEach(function () {
        mock.stop('fs');
    });

    it('can read CSV file asynchronously', function () {

        var testFilePath = "some/file.csv"
        var testCsvData 
            = "Col1,Col2\r\n"
            + "1,2\r\n"
            + "3,4"
            ; 

        mock('fs', { 
            readFile: (filePath: string, dataFormat: string, callback: Function): void => {
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

    it('can read CSV file synchronously', function () {

        var testFilePath = "some/file.csv"
        var testCsvData 
            = "Col1,Col2\r\n"
            + "1,2\r\n"
            + "3,4"
            ; 

        mock('fs', { 
            readFileSync: (filePath: string, dataFormat: string): string => {
                expect(filePath).to.eql(testFilePath);
                expect(dataFormat).to.eql('utf8');

                return testCsvData;
            },
        });
        
        var dataFrame = dataForge.readFileSync(testFilePath).parseCSV();
        expect(dataFrame.toCSV()).to.eql(testCsvData);
    });

    it('can write CSV file asynchronously', function () {

        var testFilePath = "some/file.csv"
        var testCsvData 
            = "Col1,Col2\r\n"
            + "1,2\r\n"
            + "3,4"
            ; 
        var dataFrame = dataForge.fromCSV(testCsvData);

        mock('fs', { 
            writeFile: (filePath: string, fileData: string, callback: Function): void => {
                expect(filePath).to.eql(testFilePath);
                expect(fileData).to.eql(testCsvData);

                callback(null);
            },
        });
        
        return dataFrame
            .asCSV()
            .writeFile(testFilePath)            
            ;

    });

    it('can write CSV file synchronously', function () {

        var testFilePath = "some/file.csv"
        var testCsvData 
            = "Col1,Col2\r\n"
            + "1,2\r\n"
            + "3,4"
            ; 
        var dataFrame = dataForge.fromCSV(testCsvData);

        mock('fs', { 
            writeFileSync: (filePath: string, fileData: string): void => {
                expect(filePath).to.eql(testFilePath);
                expect(fileData).to.eql(testCsvData);
            },
        });
        
        dataFrame.asCSV().writeFileSync(testFilePath);
    });

});