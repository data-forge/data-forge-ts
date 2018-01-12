'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var take_while_iterator_1 = require("../../lib/iterators/take-while-iterator");
var array_iterator_1 = require("../../lib/iterators/array-iterator");
describe('take while iterator', function () {
    it('empty input - taking', function () {
        var it = new take_while_iterator_1.TakeWhileIterator(new array_iterator_1.ArrayIterator([]), function (value) { return true; });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('empty input - not taking', function () {
        var it = new take_while_iterator_1.TakeWhileIterator(new array_iterator_1.ArrayIterator([]), function (value) { return false; });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can take single item', function () {
        var it = new take_while_iterator_1.TakeWhileIterator(new array_iterator_1.ArrayIterator([1]), function (value) { return true; });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 1,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can take based on values from child iterator', function () {
        var it = new take_while_iterator_1.TakeWhileIterator(new array_iterator_1.ArrayIterator([true, true, false, true]), function (value) { return value; });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: true,
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: true,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can take a certain number of values', function () {
        var it = new take_while_iterator_1.TakeWhileIterator(new array_iterator_1.ArrayIterator([1, 2, 3, 4]), function (value) { return value < 3; });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 1,
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 2,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
});
//# sourceMappingURL=take-while-iterator.test.js.map