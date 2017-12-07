"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var series_1 = require("../lib/series");
describe('Series', function () {
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
});
//# sourceMappingURL=series.test.js.map