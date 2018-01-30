'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var select_many_iterator_1 = require("../../lib/iterators/select-many-iterator");
var array_iterator_1 = require("../../lib/iterators/array-iterator");
describe('select many iterator', function () {
    it('empty input', function () {
        var it = new select_many_iterator_1.SelectManyIterator(new array_iterator_1.ArrayIterator([]), function (value) { return []; });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can expand collection', function () {
        var it = new select_many_iterator_1.SelectManyIterator(new array_iterator_1.ArrayIterator([1, 2]), function (value) { return [value, value]; });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 1,
        });
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
            value: 2,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can cull elements', function () {
        var it = new select_many_iterator_1.SelectManyIterator(new array_iterator_1.ArrayIterator([1, 2, 3]), function (value) { return []; });
        chai_1.expect(it.next().done).to.eql(true);
    });
});
//# sourceMappingURL=selector-many-iterator.test.js.map