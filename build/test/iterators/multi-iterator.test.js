'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var multi_iterator_1 = require("../../lib/iterators/multi-iterator");
var array_iterator_1 = require("../../lib/iterators/array-iterator");
describe('multi iterator', function () {
    it('iterator for empty array 1', function () {
        var it = new multi_iterator_1.MultiIterator([]);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('iterator for empty array 2', function () {
        var it = new multi_iterator_1.MultiIterator([new array_iterator_1.ArrayIterator([])]);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('iterator for empty array 3', function () {
        var it = new multi_iterator_1.MultiIterator([new array_iterator_1.ArrayIterator([]), new array_iterator_1.ArrayIterator([])]);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('iterator for single iterator', function () {
        var it = new multi_iterator_1.MultiIterator([new array_iterator_1.ArrayIterator([10, 20])]);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: [10],
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: [20],
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('iterator for multiple iterator', function () {
        var it = new multi_iterator_1.MultiIterator([new array_iterator_1.ArrayIterator([10, 20]), new array_iterator_1.ArrayIterator([100, 200])]);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: [10, 100],
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: [20, 200],
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('first iterator terminates iteration', function () {
        var it = new multi_iterator_1.MultiIterator([new array_iterator_1.ArrayIterator([10]), new array_iterator_1.ArrayIterator([100, 200])]);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: [10, 100],
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('second iterator terminates iteration', function () {
        var it = new multi_iterator_1.MultiIterator([new array_iterator_1.ArrayIterator([10, 20]), new array_iterator_1.ArrayIterator([100])]);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: [10, 100],
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
});
//# sourceMappingURL=multi-iterator.test.js.map