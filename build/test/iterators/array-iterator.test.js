"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var array_iterator_1 = require("../../lib/iterators/array-iterator");
describe('array iterator', function () {
    it('iterator for empty array', function () {
        var it = new array_iterator_1.ArrayIterator([]);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('iterator for array with 1 elem', function () {
        var it = new array_iterator_1.ArrayIterator([5]);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 5,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('iterator for array with 2 elems', function () {
        var it = new array_iterator_1.ArrayIterator([5, 10]);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 5,
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 10,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
});
//# sourceMappingURL=array-iterator.test.js.map