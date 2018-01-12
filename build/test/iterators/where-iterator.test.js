'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var where_iterator_1 = require("../../lib/iterators/where-iterator");
var array_iterator_1 = require("../../lib/iterators/array-iterator");
describe('take iterator', function () {
    it('iterator for empty take 1', function () {
        var it = new where_iterator_1.WhereIterator(new array_iterator_1.ArrayIterator([]), function (value) { return true; });
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('iterator for empty take 2', function () {
        var it = new where_iterator_1.WhereIterator(new array_iterator_1.ArrayIterator([]), function (value) { return false; });
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can allow all elements to pass through', function () {
        var it = new where_iterator_1.WhereIterator(new array_iterator_1.ArrayIterator([5, 10]), function (value) { return true; });
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
    it('can filter out all elements', function () {
        var it = new where_iterator_1.WhereIterator(new array_iterator_1.ArrayIterator([5, 10]), function (value) { return false; });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can filter some elements', function () {
        var it = new where_iterator_1.WhereIterator(new array_iterator_1.ArrayIterator([5, 10, 5]), function (value) { return value !== 5; });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 10,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
});
//# sourceMappingURL=where-iterator.test.js.map