'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var select_iterator_1 = require("../../lib/iterators/select-iterator");
var array_iterator_1 = require("../../lib/iterators/array-iterator");
describe('select iterator', function () {
    it('iterator for empty array', function () {
        var it = new select_iterator_1.SelectIterator(new array_iterator_1.ArrayIterator([]), function (v) { return 5; });
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('select iterator transforms values', function () {
        var it = new select_iterator_1.SelectIterator(new array_iterator_1.ArrayIterator([22]), function (v) { return 5; });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 5,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
});
//# sourceMappingURL=selector-iterator.test.js.map