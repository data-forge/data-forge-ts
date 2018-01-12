'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var take_iterator_1 = require("../../lib/iterators/take-iterator");
var array_iterator_1 = require("../../lib/iterators/array-iterator");
describe('take iterator', function () {
    it('iterator for empty take 1', function () {
        var it = new take_iterator_1.TakeIterator(new array_iterator_1.ArrayIterator([]), 0);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('iterator for empty take 2', function () {
        var it = new take_iterator_1.TakeIterator(new array_iterator_1.ArrayIterator([]), 5);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can take X elements from a larger input', function () {
        var it = new take_iterator_1.TakeIterator(new array_iterator_1.ArrayIterator([5, 10, 20]), 2);
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
    it('can take X elements from a smaller input', function () {
        var it = new take_iterator_1.TakeIterator(new array_iterator_1.ArrayIterator([5]), 2);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 5,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
});
//# sourceMappingURL=take-iterator.test.js.map