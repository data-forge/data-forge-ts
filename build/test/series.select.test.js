"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var series_1 = require("../lib/series");
var dataframe_1 = require("../lib/dataframe");
describe('Series select', function () {
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
    it('can select', function () {
        var series = new series_1.Series({ index: [0, 1, 2, 3], values: [100, 300, 200, 5] });
        var modified = series.select(function (value, index) { return value + 10; });
        chai_1.expect(modified.getIndex().toArray()).to.eql([0, 1, 2, 3]);
        chai_1.expect(modified.toArray()).to.eql([110, 310, 210, 15]);
    });
    it('can select many - with array', function () {
        var series = new series_1.Series({ index: [0, 1], values: [10, 20] });
        var modified = series.selectMany(function (value) { return [100, 200]; });
        chai_1.expect(modified.getIndex().toArray()).to.eql([0, 0, 1, 1]);
        chai_1.expect(modified.toArray()).to.eql([100, 200, 100, 200]);
    });
    it('can select many - with series', function () {
        var series = new series_1.Series({ index: [0, 1], values: [100, 300] });
        var modified = series.selectMany(function (value) { return new series_1.Series([0, 1]); });
        chai_1.expect(modified.getIndex().toArray()).to.eql([0, 0, 1, 1]);
        chai_1.expect(modified.toArray()).to.eql([0, 1, 0, 1]);
    });
    it('can select many - with data-frame', function () {
        var series = new series_1.Series({ index: [0, 1], values: [100, 300] });
        var modified = series.selectMany(function (value) { return new dataframe_1.DataFrame([{ Value: 0 }, { Value: 1 }]); });
        chai_1.expect(modified.getIndex().toArray()).to.eql([0, 0, 1, 1]);
        chai_1.expect(modified.toArray()).to.eql([{ Value: 0 }, { Value: 1 }, { Value: 0 }, { Value: 1 }]);
    });
});
//# sourceMappingURL=series.select.test.js.map