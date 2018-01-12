'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var skip_while_iterator_1 = require("../../lib/iterators/skip-while-iterator");
var array_iterator_1 = require("../../lib/iterators/array-iterator");
describe('skip while iterator', function () {
    it('empty input - skiping', function () {
        var it = new skip_while_iterator_1.SkipWhileIterator(new array_iterator_1.ArrayIterator([]), function (value) { return true; });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('empty input - not skipping', function () {
        var it = new skip_while_iterator_1.SkipWhileIterator(new array_iterator_1.ArrayIterator([]), function (value) { return false; });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can skip single item', function () {
        var it = new skip_while_iterator_1.SkipWhileIterator(new array_iterator_1.ArrayIterator([1]), function (value) { return true; });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can skip based on values from child iterator', function () {
        var it = new skip_while_iterator_1.SkipWhileIterator(new array_iterator_1.ArrayIterator([true, true, false, true]), function (value) { return value; });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: false,
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: true,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can skip a certain number of values', function () {
        var it = new skip_while_iterator_1.SkipWhileIterator(new array_iterator_1.ArrayIterator([1, 2, 3, 1]), function (value) { return value < 3; });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 3,
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 1,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
});
//# sourceMappingURL=skip-while-iterator.test.js.map