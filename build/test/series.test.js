"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var series_1 = require("../lib/series");
describe('Series', function () {
    it('can bake series', function () {
        var series = new series_1.Series({
            values: [10, 20],
            index: [1, 2],
        });
        var baked = series.bake();
        chai_1.expect(baked).not.to.equal(series);
    });
    it('baking a baked series returns same', function () {
        var series = new series_1.Series({
            values: [10, 20],
            index: [1, 2],
        });
        var baked = series.bake();
        var rebaked = baked.bake();
        chai_1.expect(rebaked).to.equal(baked);
    });
    it('can rewrite series with select', function () {
        var series = new series_1.Series([10, 20, 30]);
        var modified = series.select(function (v) { return v * 2; });
        chai_1.expect(modified.toArray()).to.eql([20, 40, 60]);
    });
    it('select ignores index', function () {
        var series = new series_1.Series({
            values: [10, 20, 30],
            index: [100, 200, 300],
        });
        var modified = series.select(function (v) { return v * 2; });
        chai_1.expect(modified.toPairs()).to.eql([[100, 20], [200, 40], [300, 60]]);
        chai_1.expect(modified.getIndex().toArray()).to.eql([100, 200, 300]);
    });
    it('can inflate to dataframe', function () {
        var series = new series_1.Series({
            values: [10, 20],
            index: [100, 200]
        });
        var dataframe = series.select(function (v) { return ({ V: v }); }).inflate();
        chai_1.expect(dataframe.toArray()).to.eql([
            {
                V: 10,
            },
            {
                V: 20,
            },
        ]);
        chai_1.expect(dataframe.getIndex().toArray()).to.eql([100, 200]);
        chai_1.expect(dataframe.toPairs()).to.eql([
            [100, { V: 10, },],
            [200, { V: 20, },],
        ]);
    });
    it('can inflate to dataframe with no selector', function () {
        var series = new series_1.Series({
            values: [{ V: 10 }, { V: 20 }],
            index: [100, 200]
        });
        var dataframe = series.inflate();
        chai_1.expect(dataframe.toArray()).to.eql([
            {
                V: 10,
            },
            {
                V: 20,
            },
        ]);
        chai_1.expect(dataframe.getIndex().toArray()).to.eql([100, 200]);
        chai_1.expect(dataframe.toPairs()).to.eql([
            [100, { V: 10, },],
            [200, { V: 20, },],
        ]);
    });
    it('Series.toArray strips undefined values', function () {
        var series = new series_1.Series([10, undefined, 20, undefined]);
        chai_1.expect(series.toArray()).to.eql([10, 20]);
    });
    it('Series.toPairs strips undefined values', function () {
        var series = new series_1.Series([10, undefined, 20, undefined]);
        chai_1.expect(series.toPairs()).to.eql([
            [0, 10],
            [2, 20]
        ]);
    });
    it('can skip values in a series', function () {
        var series = new series_1.Series({
            values: [1, 2, 3, 4, 5],
            index: [0, 1, 2, 3, 4],
        });
        var result = series.skip(2);
        chai_1.expect(result.toArray()).to.eql([3, 4, 5]);
        chai_1.expect(result.getIndex().toArray()).to.eql([2, 3, 4]);
        chai_1.expect(result.toPairs()).to.eql([[2, 3], [3, 4], [4, 5]]);
    });
    it('can take', function () {
        var series = new series_1.Series({
            index: [0, 1, 2, 3],
            values: [100, 300, 200, 5]
        });
        var skipped = series.take(2);
        chai_1.expect(skipped.getIndex().toArray()).to.eql([0, 1]);
        chai_1.expect(skipped.toArray()).to.eql([100, 300]);
    });
    it('can filter', function () {
        var series = new series_1.Series({
            index: [0, 1, 2, 3],
            values: [100, 300, 200, 5]
        });
        var filtered = series.where(function (value) {
            return value >= 100 && value < 300;
        });
        chai_1.expect(filtered.getIndex().toArray()).to.eql([0, 2]);
        chai_1.expect(filtered.toArray()).to.eql([100, 200]);
    });
});
//# sourceMappingURL=series.test.js.map