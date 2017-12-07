"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var dataframe_1 = require("../lib/dataframe");
describe('DataFrame', function () {
    it('can skip values in a dataframe', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: [1, 2, 3, 4, 5],
            index: [0, 1, 2, 3, 4],
        });
        var result = dataframe.skip(2);
        chai_1.expect(result.toArray()).to.eql([3, 4, 5]);
        chai_1.expect(result.getIndex().toArray()).to.eql([2, 3, 4]);
        chai_1.expect(result.toPairs()).to.eql([[2, 3], [3, 4], [4, 5]]);
    });
    it('can bake dataframe', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: [10, 20],
            index: [1, 2],
        });
        var baked = dataframe.bake();
        chai_1.expect(baked).not.to.equal(dataframe);
    });
    it('baking a baked dataframe returns same', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: [10, 20],
            index: [1, 2],
        });
        var baked = dataframe.bake();
        var rebaked = baked.bake();
        chai_1.expect(rebaked).to.equal(baked);
    });
    it('can rewrite dataframe with select', function () {
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
        var modified = dataFrame.select(function (v) { return ({ A: v.A * 2, B: v.B * 2 }); });
        chai_1.expect(modified.toArray()).to.eql([
            {
                A: 2,
                B: 20,
            },
            {
                A: 4,
                B: 40,
            }
        ]);
    });
    it('select ignores index', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: [10, 20, 30],
            index: [100, 200, 300],
        });
        var modified = dataframe.select(function (v) { return v * 2; });
        chai_1.expect(modified.toPairs()).to.eql([[100, 20], [200, 40], [300, 60]]);
        chai_1.expect(modified.getIndex().toArray()).to.eql([100, 200, 300]);
    });
});
//# sourceMappingURL=dataframe.test.js.map