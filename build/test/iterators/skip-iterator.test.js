'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var skip_iterator_1 = require("../../lib/iterators/skip-iterator");
var array_iterator_1 = require("../../lib/iterators/array-iterator");
describe('skip iterator', function () {
    it('iterator for empty array with skip 0', function () {
        var it = new skip_iterator_1.SkipIterator(new array_iterator_1.ArrayIterator([]), 0);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('iterator for empty array with skip 1', function () {
        var it = new skip_iterator_1.SkipIterator(new array_iterator_1.ArrayIterator([]), 1);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can skip 0 elements', function () {
        var it = new skip_iterator_1.SkipIterator(new array_iterator_1.ArrayIterator([1, 2, 3, 4]), 0);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 1,
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 2,
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 3,
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 4,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can skip 2 elements', function () {
        var it = new skip_iterator_1.SkipIterator(new array_iterator_1.ArrayIterator([1, 2, 3, 4]), 2);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 3,
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 4,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can skip to end', function () {
        var it = new skip_iterator_1.SkipIterator(new array_iterator_1.ArrayIterator([1, 2, 3, 4]), 4);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can skip past end', function () {
        var it = new skip_iterator_1.SkipIterator(new array_iterator_1.ArrayIterator([1, 2, 3, 4]), 6);
        chai_1.expect(it.next().done).to.eql(true);
    });
});
//# sourceMappingURL=skip-iterator.test.js.map