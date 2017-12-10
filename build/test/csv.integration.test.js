"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var dataForge = require("../index");
describe('csv integration', function () {
    it('can read data frame from CSV', function () {
        var csv = "Date, Value1, Value2, Value3\n" +
            "1975-2-24, 100, foo, 22\n" +
            "2015-10-23, 300, bar, 23";
        var dataFrame = dataForge.fromCSV(csv);
        var series1 = dataFrame.getSeries('Value1');
        chai_1.expect(series1.toArray()).to.eql([
            '100',
            '300',
        ]);
        var series2 = dataFrame.getSeries('Value2');
        chai_1.expect(series2.toArray()).to.eql([
            'foo',
            'bar',
        ]);
        chai_1.expect(dataFrame.getColumnNames()).to.eql([
            "Date",
            'Value1',
            'Value2',
            'Value3',
        ]);
        chai_1.expect(dataFrame.toRows()).to.eql([
            ['1975-2-24', '100', "foo", '22'],
            ['2015-10-23', '300', "bar", '23'],
        ]);
    });
    it('can read CSV with explicit header', function () {
        var csv = "1975-2-24, 100, foo, 22\n" +
            "2015-10-23, 300, bar, 23";
        var dataFrame = dataForge.fromCSV(csv, { columnNames: ["Date", "Value1", "Value2", "Value3"] });
        var series1 = dataFrame.getSeries('Value1');
        chai_1.expect(series1.toArray()).to.eql([
            '100',
            '300',
        ]);
        var series2 = dataFrame.getSeries('Value2');
        chai_1.expect(series2.toArray()).to.eql([
            'foo',
            'bar',
        ]);
        chai_1.expect(dataFrame.getColumnNames()).to.eql([
            "Date",
            'Value1',
            'Value2',
            'Value3',
        ]);
        chai_1.expect(dataFrame.toRows()).to.eql([
            ['1975-2-24', '100', "foo", '22'],
            ['2015-10-23', '300', "bar", '23'],
        ]);
    });
    it('can handle CSV with trailing commas', function () {
        var csv = "c1, c2,\n" +
            "f, 1,2\n" +
            "x, 2,2";
        var dataFrame = dataForge.fromCSV(csv);
        chai_1.expect(dataFrame.getColumnNames()).to.eql(["c1", "c2", ""]);
        var series1 = dataFrame.getSeries('c1');
        chai_1.expect(series1.toArray()).to.eql([
            'f',
            'x',
        ]);
        var series2 = dataFrame.getSeries('c2');
        chai_1.expect(series2.toArray()).to.eql([
            '1',
            '2',
        ]);
    });
    it('can handle CSV with quoted fields', function () {
        var csv = '"c1","c2"\n' +
            '"a","1"\n' +
            '"b","2"';
        var dataFrame = dataForge.fromCSV(csv);
        chai_1.expect(dataFrame.getColumnNames()).to.eql(["c1", "c2"]);
        var series1 = dataFrame.getSeries('c1');
        chai_1.expect(series1.toArray()).to.eql([
            'a',
            'b',
        ]);
        var series2 = dataFrame.getSeries('c2');
        chai_1.expect(series2.toArray()).to.eql([
            '1',
            '2',
        ]);
    });
    it('can handle CSV with unix line endings', function () {
        var csv = 'c1,c2\n' +
            'a,1\n' +
            'b,2';
        var dataFrame = dataForge.fromCSV(csv);
        chai_1.expect(dataFrame.getColumnNames()).to.eql(["c1", "c2"]);
        var series1 = dataFrame.getSeries('c1');
        chai_1.expect(series1.toArray()).to.eql([
            'a',
            'b',
        ]);
        var series2 = dataFrame.getSeries('c2');
        chai_1.expect(series2.toArray()).to.eql([
            '1',
            '2',
        ]);
    });
    it('can handle CSV with windows line endings', function () {
        var csv = 'c1,c2\r\n' +
            'a,1\r\n' +
            'b,2';
        var dataFrame = dataForge.fromCSV(csv);
        chai_1.expect(dataFrame.getColumnNames()).to.eql(["c1", "c2"]);
        var series1 = dataFrame.getSeries('c1');
        chai_1.expect(series1.toArray()).to.eql([
            'a',
            'b',
        ]);
        var series2 = dataFrame.getSeries('c2');
        chai_1.expect(series2.toArray()).to.eql([
            '1',
            '2',
        ]);
    });
    it('can handle ASX share game CSV', function () {
        var csv = '"Company name","Code",\n' +
            '"AUSTRALIAN AGRICULTURAL COMPANY LIMITED.","AAC",\n' +
            '"ARDENT LEISURE GROUP","AAD",\n';
        var dataFrame = dataForge.fromCSV(csv);
        chai_1.expect(dataFrame.getColumnNames()).to.eql(["Company name", "Code", ""]);
        var series1 = dataFrame.getSeries('Company name');
        chai_1.expect(series1.toArray()).to.eql([
            'AUSTRALIAN AGRICULTURAL COMPANY LIMITED.',
            'ARDENT LEISURE GROUP',
            '',
        ]);
        var series2 = dataFrame.getSeries('Code');
        chai_1.expect(series2.toArray()).to.eql([
            'AAC',
            'AAD',
        ]);
    });
});
//# sourceMappingURL=csv.integration.test.js.map