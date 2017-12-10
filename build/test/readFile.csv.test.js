"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var mock = require("mock-require");
var dataForge = require("../index");
describe('readFile csv', function () {
    afterEach(function () {
        mock.stop('fs');
        mock.stop('request-promise');
    });
    it('can read CSV file asynchronously', function () {
        var testFilePath = "some/file.csv";
        var testCsvData = "Col1,Col2\r\n"
            + "1,2\r\n"
            + "3,4";
        mock('fs', {
            readFile: function (filePath, dataFormat, callback) {
                chai_1.expect(filePath).to.eql(testFilePath);
                chai_1.expect(dataFormat).to.eql('utf8');
                callback(null, testCsvData);
            },
        });
        return dataForge
            .readFile(testFilePath)
            .parseCSV()
            .then(function (dataFrame) {
            chai_1.expect(dataFrame.toCSV()).to.eql(testCsvData);
        });
    });
    it('can read CSV file synchronously', function () {
        var testFilePath = "some/file.csv";
        var testCsvData = "Col1,Col2\r\n"
            + "1,2\r\n"
            + "3,4";
        mock('fs', {
            readFileSync: function (filePath, dataFormat) {
                chai_1.expect(filePath).to.eql(testFilePath);
                chai_1.expect(dataFormat).to.eql('utf8');
                return testCsvData;
            },
        });
        var dataFrame = dataForge.readFileSync(testFilePath).parseCSV();
        chai_1.expect(dataFrame.toCSV()).to.eql(testCsvData);
    });
});
//# sourceMappingURL=readFile.csv.test.js.map