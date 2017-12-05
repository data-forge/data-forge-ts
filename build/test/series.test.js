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
});
//# sourceMappingURL=series.test.js.map