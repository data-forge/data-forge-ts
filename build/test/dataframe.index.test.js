"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var index_1 = require("../lib/index");
var dataframe_1 = require("../lib/dataframe");
describe('DataFrame', function () {
    it('can set new index for dataframe from array', function () {
        var dataframe = new dataframe_1.DataFrame([10, 20, 30]);
        var newDataFrame = dataframe.withIndex([11, 22, 33]);
        chai_1.expect(newDataFrame.getIndex().toArray()).to.eql([11, 22, 33]);
    });
    it('can set new index for dataframe from dataframe', function () {
        var dataframe = new dataframe_1.DataFrame([10, 20, 30]);
        var newDataFrame = dataframe.withIndex(new dataframe_1.DataFrame([11, 22, 33]));
        chai_1.expect(newDataFrame.getIndex().toArray()).to.eql([11, 22, 33]);
    });
    it('can set new index for dataframe from index', function () {
        var dataframe = new dataframe_1.DataFrame([10, 20, 30]);
        var newDataFrame = dataframe.withIndex(new index_1.Index([11, 22, 33]));
        chai_1.expect(newDataFrame.getIndex().toArray()).to.eql([11, 22, 33]);
    });
    it('can reset index', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: [10, 20, 30],
            index: [11, 22, 33],
        });
        var newDataFrame = dataframe.resetIndex();
        chai_1.expect(newDataFrame.toPairs()).to.eql([[0, 10], [1, 20], [2, 30]]);
    });
});
//# sourceMappingURL=dataframe.index.test.js.map