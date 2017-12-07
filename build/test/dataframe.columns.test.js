"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var dataframe_1 = require("../lib/dataframe");
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
});
//# sourceMappingURL=dataframe.columns.test.js.map