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
});
//# sourceMappingURL=dataframe.test.js.map