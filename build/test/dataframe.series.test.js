"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var dataframe_1 = require("../lib/dataframe");
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
});
//# sourceMappingURL=dataframe.series.test.js.map