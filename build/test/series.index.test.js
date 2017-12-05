"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var index_1 = require("../lib/index");
var series_1 = require("../lib/series");
describe('Series', function () {
    it('can set new index for series from array', function () {
        var series = new series_1.Series([10, 20, 30]);
        var newSeries = series.withIndex([11, 22, 33]);
        chai_1.expect(newSeries.getIndex().toArray()).to.eql([11, 22, 33]);
    });
    it('can set new index for series from series', function () {
        var series = new series_1.Series([10, 20, 30]);
        var newSeries = series.withIndex(new series_1.Series([11, 22, 33]));
        chai_1.expect(newSeries.getIndex().toArray()).to.eql([11, 22, 33]);
    });
    it('can set new index for series from index', function () {
        var series = new series_1.Series([10, 20, 30]);
        var newSeries = series.withIndex(new index_1.Index([11, 22, 33]));
        chai_1.expect(newSeries.getIndex().toArray()).to.eql([11, 22, 33]);
    });
});
//# sourceMappingURL=series.index.test.js.map