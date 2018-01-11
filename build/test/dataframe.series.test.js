"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var dataframe_1 = require("../lib/dataframe");
var series_1 = require("../lib/series");
describe('DataFrame', function () {
    it('can get series from dataframe', function () {
        var dataFrame = new dataframe_1.DataFrame([
            {
                A: 1,
                B: 10,
            },
            {
                A: 2,
                B: 20,
            }
        ]);
        chai_1.expect(dataFrame.getSeries("B").toArray()).to.eql([10, 20]);
    });
    it('can get index from series from dataframe', function () {
        var dataFrame = new dataframe_1.DataFrame({
            pairs: [
                [
                    100,
                    {
                        A: 1,
                        B: 10,
                    },
                ],
                [
                    200,
                    {
                        A: 2,
                        B: 20,
                    },
                ],
            ]
        });
        chai_1.expect(dataFrame.getSeries("B").getIndex().toArray()).to.eql([100, 200]);
    });
    it('when a series is extracted from a dataframe, undefined values are stripped out.', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["S"],
            values: [
                [undefined],
                [11],
                [undefined],
                [12],
                [undefined],
            ]
        });
        var series = dataFrame.getSeries('S');
        chai_1.expect(series.toPairs()).to.eql([
            [1, 11],
            [3, 12],
        ]);
    });
    it('retreive a non-existing column results in an empty series', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["C1"],
            values: [
                [1]
            ],
        });
        var series = dataFrame.getSeries("non-existing-column");
        chai_1.expect(series.toPairs()).to.eql([]);
    });
    it('can ensure series that doesnt exist', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["C1"],
            values: [
                [1],
                [2],
            ],
        });
        console.log(dataFrame.toArray());
        var modified = dataFrame.ensureSeries("C2", new series_1.Series({ values: [10, 20] }));
        chai_1.expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
        chai_1.expect(modified.toRows()).to.eql([
            [1, 10],
            [2, 20],
        ]);
    });
    it('can ensure series that already exists', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["C1", "C2"],
            values: [
                [1, 52],
                [2, 53],
            ],
        });
        var modified = dataFrame.ensureSeries("C2", new series_1.Series({ values: [100, 200] }));
        chai_1.expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
        chai_1.expect(modified.toRows()).to.eql([
            [1, 52],
            [2, 53],
        ]);
    });
    it('can set new series', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["Date", "Value1", "Value2", "Value3"],
            values: [
                [new Date(2011, 24, 2), 300, 'c', 3],
                [new Date(1975, 24, 2), 200, 'b', 1],
                [new Date(2013, 24, 2), 20, 'c', 22],
                [new Date(2015, 24, 2), 100, 'd', 4],
            ],
            index: [5, 6, 7, 8]
        });
        var series = new series_1.Series({ index: [5, 6, 7, 8], values: [1, 2, 3, 4] });
        var modified = dataFrame.withSeries('Value4', series);
        chai_1.expect(modified.getIndex().toArray()).to.eql([5, 6, 7, 8]);
        chai_1.expect(modified.getColumnNames()).to.eql([
            "Date",
            "Value1",
            "Value2",
            "Value3",
            "Value4",
        ]);
        chai_1.expect(modified.toRows()).to.eql([
            [new Date(2011, 24, 2), 300, 'c', 3, 1],
            [new Date(1975, 24, 2), 200, 'b', 1, 2],
            [new Date(2013, 24, 2), 20, 'c', 22, 3],
            [new Date(2015, 24, 2), 100, 'd', 4, 4],
        ]);
    });
    it('can set existing series', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["Date", "Value1", "Value2", "Value3"],
            values: [
                [new Date(2011, 24, 2), 300, 'c', 3],
                [new Date(1975, 24, 2), 200, 'b', 1],
                [new Date(2013, 24, 2), 20, 'c', 22],
                [new Date(2015, 24, 2), 100, 'd', 4],
            ],
            index: [5, 6, 7, 8]
        });
        var series = new series_1.Series({ index: [5, 6, 7, 8], values: [1, 2, 3, 4] });
        var modified = dataFrame.withSeries('Value1', series);
        chai_1.expect(modified.getIndex().toArray()).to.eql([5, 6, 7, 8]);
        chai_1.expect(modified.toRows()).to.eql([
            [new Date(2011, 24, 2), 1, 'c', 3],
            [new Date(1975, 24, 2), 2, 'b', 1],
            [new Date(2013, 24, 2), 3, 'c', 22],
            [new Date(2015, 24, 2), 4, 'd', 4],
        ]);
    });
    it('can set series from another data frame', function () {
        var dataFrame1 = new dataframe_1.DataFrame({
            columnNames: ["Date", "Value1", "Value2", "Value3"],
            values: [
                [new Date(1975, 24, 2), 100, 'foo', 11],
                [new Date(2015, 24, 2), 200, 'bar', 22],
            ],
            index: [5, 6]
        });
        var dataFrame2 = new dataframe_1.DataFrame({
            columnNames: ["Date", "Value1", "Value2", "Value3"],
            values: [
                [new Date(2011, 24, 2), 300, 'c', 3],
                [new Date(1975, 24, 2), 200, 'b', 1],
                [new Date(2013, 24, 2), 20, 'c', 22],
                [new Date(2015, 24, 2), 100, 'd', 4],
            ],
            index: [5, 6, 7, 8]
        });
        var modified = dataFrame2.withSeries('Value4', dataFrame1.getSeries('Value2'));
        chai_1.expect(modified.getColumnNames()).to.eql([
            "Date",
            "Value1",
            "Value2",
            "Value3",
            "Value4",
        ]);
        chai_1.expect(modified.toRows()).to.eql([
            [new Date(2011, 24, 2), 300, 'c', 3, 'foo'],
            [new Date(1975, 24, 2), 200, 'b', 1, 'bar'],
            [new Date(2013, 24, 2), 20, 'c', 22, undefined],
            [new Date(2015, 24, 2), 100, 'd', 4, undefined],
        ]);
    });
    it('can ensure that series exists - with series generator function', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["C1"],
            values: [
                [1],
                [2],
            ],
        });
        console.log(dataFrame.toArray());
        var modified = dataFrame.ensureSeries("C2", function (df) { return new series_1.Series({ values: [10, 20] }); });
        chai_1.expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
        chai_1.expect(modified.toRows()).to.eql([
            [1, 10],
            [2, 20],
        ]);
    });
    it('can ensure that series already exists - with series generator function', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["C1", "C2"],
            values: [
                [1, 52],
                [2, 53],
            ],
        });
        var modified = dataFrame.ensureSeries("C2", function (df) { return new series_1.Series({ values: [100, 200] }); });
        chai_1.expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
        chai_1.expect(modified.toRows()).to.eql([
            [1, 52],
            [2, 53],
        ]);
    });
    it('can ensure that series exists - with column spec', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["C1"],
            values: [
                [1],
                [2],
            ],
        });
        console.log(dataFrame.toArray());
        var modified = dataFrame.ensureSeries({ C2: new series_1.Series({ values: [10, 20] }) });
        chai_1.expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
        chai_1.expect(modified.toRows()).to.eql([
            [1, 10],
            [2, 20],
        ]);
    });
    it('can ensure that series already exists - with column spec', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["C1", "C2"],
            values: [
                [1, 52],
                [2, 53],
            ],
        });
        var modified = dataFrame.ensureSeries({ C2: new series_1.Series({ values: [100, 200] }) });
        chai_1.expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
        chai_1.expect(modified.toRows()).to.eql([
            [1, 52],
            [2, 53],
        ]);
    });
    it('can ensure that series exists - with column spec and series generator fn', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["C1"],
            values: [
                [1],
                [2],
            ],
        });
        console.log(dataFrame.toArray());
        var modified = dataFrame.ensureSeries({ C2: function (df) { return new series_1.Series({ values: [10, 20] }); } });
        chai_1.expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
        chai_1.expect(modified.toRows()).to.eql([
            [1, 10],
            [2, 20],
        ]);
    });
    it('can ensure that series already exists - with column spec and series generator fn', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["C1", "C2"],
            values: [
                [1, 52],
                [2, 53],
            ],
        });
        var modified = dataFrame.ensureSeries({ C2: function (df) { return new series_1.Series({ values: [100, 200] }); } });
        chai_1.expect(modified.getColumnNames()).to.eql(["C1", "C2"]);
        chai_1.expect(modified.toRows()).to.eql([
            [1, 52],
            [2, 53],
        ]);
    });
});
//# sourceMappingURL=dataframe.series.test.js.map