"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var dataframe_1 = require("../lib/dataframe");
var series_1 = require("../lib/series");
var array_iterable_1 = require("../lib/iterables/array-iterable");
describe('DataFrame columns', function () {
    it('can get column name from empty dataframe - no params', function () {
        var dataFrame = new dataframe_1.DataFrame();
        chai_1.expect(dataFrame.getColumnNames()).to.eql([]);
    });
    it('can get column name from empty dataframe - array', function () {
        var dataFrame = new dataframe_1.DataFrame([]);
        chai_1.expect(dataFrame.getColumnNames()).to.eql([]);
    });
    it('can get column name from empty dataframe - config', function () {
        var dataFrame = new dataframe_1.DataFrame({});
        chai_1.expect(dataFrame.getColumnNames()).to.eql([]);
    });
    it('can get column name from first object in array', function () {
        var dataFrame = new dataframe_1.DataFrame([
            {
                A: 1,
                B: 10,
            },
            {
                C: 2,
                D: 20,
            }
        ]);
        chai_1.expect(dataFrame.getColumnNames()).to.eql(["A", "B"]);
    });
    it('can get column name from first object in config values iterable', function () {
        var dataFrame = new dataframe_1.DataFrame({
            values: new array_iterable_1.ArrayIterable([
                {
                    A: 1,
                    B: 10,
                },
                {
                    C: 2,
                    D: 20,
                }
            ])
        });
        chai_1.expect(dataFrame.getColumnNames()).to.eql(["A", "B"]);
    });
    it('can get column name from first item in pairs iterable', function () {
        var dataFrame = new dataframe_1.DataFrame({
            pairs: new array_iterable_1.ArrayIterable([
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
                        C: 2,
                        D: 20,
                    }
                ]
            ])
        });
        chai_1.expect(dataFrame.getColumnNames()).to.eql(["A", "B"]);
    });
    it('select can rewrite column names', function () {
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
        var modified = dataFrame.select(function (v) { return ({ X: v.A, Y: v.B }); });
        chai_1.expect(modified.getColumnNames()).to.eql(["X", "Y"]);
        chai_1.expect(modified.toArray()).to.eql([
            {
                X: 1,
                Y: 10,
            },
            {
                X: 2,
                Y: 20,
            }
        ]);
    });
    it('can create dataframe with array of column names', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["A", "B"],
        });
        chai_1.expect(dataFrame.getColumnNames()).to.eql(["A", "B"]);
    });
    it('can create dataframe with array of column names that override the content', function () {
        var dataFrame = new dataframe_1.DataFrame({
            values: [
                {
                    A: 1,
                    B: 10,
                },
            ],
            columnNames: ["X", "Y"],
        });
        chai_1.expect(dataFrame.getColumnNames()).to.eql(["X", "Y"]);
    });
    it('can create dataframe with iterable of column names that override input values', function () {
        var dataFrame = new dataframe_1.DataFrame({
            values: [
                {
                    A: 1,
                    B: 10,
                },
            ],
            columnNames: new array_iterable_1.ArrayIterable(["X", "Y"]),
        });
        chai_1.expect(dataFrame.getColumnNames()).to.eql(["X", "Y"]);
    });
    it('can create dataframe with iterable of column names that override input pairs', function () {
        var dataFrame = new dataframe_1.DataFrame({
            pairs: [
                [
                    10,
                    {
                        A: 1,
                        B: 10,
                    },
                ],
            ],
            columnNames: new array_iterable_1.ArrayIterable(["X", "Y"]),
        });
        chai_1.expect(dataFrame.getColumnNames()).to.eql(["X", "Y"]);
    });
    it('creating from objects with variable fields - by default just uses first row to determine column names', function () {
        var dataFrame = new dataframe_1.DataFrame({
            values: [
                { c1: 1, c2: 2 },
                { c3: 3, c4: 4 },
            ],
        });
        var columnNames = ["c1", "c2"];
        chai_1.expect(dataFrame.getColumnNames()).to.eql(columnNames);
        chai_1.expect(dataFrame.toArray()).to.eql([
            { c1: 1, c2: 2 },
            { c3: 3, c4: 4 },
        ]);
    });
    it('creating from objects with variable fields - can force all rows to be considered to determine column names', function () {
        var dataFrame = new dataframe_1.DataFrame({
            values: [
                { c1: 1, c2: 2 },
                { c3: 3, c4: 4 },
            ],
            considerAllRows: true,
        });
        var columnNames = ["c1", "c2", "c3", "c4"];
        chai_1.expect(dataFrame.getColumnNames()).to.eql(columnNames);
        chai_1.expect(dataFrame.toPairs()).to.eql([
            [0, { c1: 1, c2: 2 }],
            [1, { c3: 3, c4: 4 }],
        ]);
    });
    it('can create data frame from column arrays with index', function () {
        var df = new dataframe_1.DataFrame({
            columns: {
                A: [1, 2, 3, 4],
                B: ['a', 'b', 'c', 'd'],
            },
            index: [10, 20, 30, 40],
        });
        chai_1.expect(df.getColumnNames()).to.eql(["A", "B"]);
        chai_1.expect(df.toPairs()).to.eql([
            [10, { A: 1, B: 'a' }],
            [20, { A: 2, B: 'b' }],
            [30, { A: 3, B: 'c' }],
            [40, { A: 4, B: 'd' }],
        ]);
    });
    it('can create data frame from column arrays - array', function () {
        var df = new dataframe_1.DataFrame({
            columns: {
                A: [1, 2, 3, 4],
                B: ['a', 'b', 'c', 'd'],
            },
            index: [11, 12, 13, 14],
        });
        chai_1.expect(df.getColumnNames()).to.eql(["A", "B"]);
        chai_1.expect(df.toPairs()).to.eql([
            [11, { A: 1, B: 'a' }],
            [12, { A: 2, B: 'b' }],
            [13, { A: 3, B: 'c' }],
            [14, { A: 4, B: 'd' }],
        ]);
    });
    it('can create dataframe from columns - with series', function () {
        var df = new dataframe_1.DataFrame({
            columns: {
                A: new series_1.Series([1, 2, 3, 4]),
                B: new series_1.Series(['a', 'b', 'c', 'd']),
            },
        });
        chai_1.expect(df.getColumnNames()).to.eql(["A", "B"]);
        chai_1.expect(df.toArray()).to.eql([
            { A: 1, B: 'a' },
            { A: 2, B: 'b' },
            { A: 3, B: 'c' },
            { A: 4, B: 'd' },
        ]);
    });
    it('can create data frame from column arrays - default index', function () {
        var df = new dataframe_1.DataFrame({
            columns: {
                A: [1, 2, 3, 4],
                B: ['a', 'b', 'c', 'd'],
            },
        });
        chai_1.expect(df.getColumnNames()).to.eql(["A", "B"]);
        chai_1.expect(df.toPairs()).to.eql([
            [0, { A: 1, B: 'a' }],
            [1, { A: 2, B: 'b' }],
            [2, { A: 3, B: 'c' }],
            [3, { A: 4, B: 'd' }],
        ]);
    });
    it('duplicates columns are renamed to be unique - rows', function () {
        var df = new dataframe_1.DataFrame({
            columnNames: [
                "some-column",
                "some-Column",
            ],
            values: [
                [1, 2],
                [3, 4],
            ],
        });
        chai_1.expect(df.getColumnNames()).to.eql(["some-column.1", "some-Column.2"]);
        chai_1.expect(df.toArray()).to.eql([
            {
                "some-column.1": 1,
                "some-Column.2": 2,
            },
            {
                "some-column.1": 3,
                "some-Column.2": 4,
            },
        ]);
    });
    it('can check that column exists', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["Value1", "Value2", "VALUE3"],
            values: [
                [100, 'foo', 11],
                [200, 'bar', 22],
            ],
            index: [5, 6]
        });
        chai_1.expect(dataFrame.hasSeries('non-existing-column')).to.eql(false);
        chai_1.expect(dataFrame.hasSeries('Value1')).to.eql(true);
        chai_1.expect(dataFrame.hasSeries('VAlue2')).to.eql(true);
        chai_1.expect(dataFrame.hasSeries('Value3')).to.eql(true);
    });
    it('can expect that a column exists', function () {
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: ["Value1"],
            values: [
                [100],
                [200],
            ],
            index: [5, 6]
        });
        chai_1.expect(function () {
            dataFrame.expectSeries('non-existing-column');
        }).to.throw();
        chai_1.expect(dataFrame.expectSeries('Value1')).to.not.be.null;
    });
});
//# sourceMappingURL=dataframe.columns.test.js.map