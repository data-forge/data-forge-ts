"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var dataframe_1 = require("../lib/dataframe");
describe('DataFrame csv', function () {
    it('can save empty data frame to csv', function () {
        var dataFrame = new dataframe_1.DataFrame();
        var csvData = dataFrame.toCSV();
        chai_1.assert.isString(csvData);
        chai_1.expect(csvData.length).to.eql(0);
    });
    it('can save data frame to csv', function () {
        var dataFrame = new dataframe_1.DataFrame([
            {
                Column1: 'A',
                Column2: 1,
            },
            {
                Column1: 'B',
                Column2: 2,
            },
        ]);
        var csvData = dataFrame.toCSV();
        chai_1.assert.isString(csvData);
        chai_1.expect(csvData).to.eql("Column1,Column2\r\n" +
            "A,1\r\n" +
            "B,2");
    });
});
//# sourceMappingURL=dataframe.csv.test.js.map