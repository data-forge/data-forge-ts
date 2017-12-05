'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var extract_element_iterator_1 = require("../../lib/iterators/extract-element-iterator");
var array_iterator_1 = require("../../lib/iterators/array-iterator");
describe('extract element iterator', function () {
    it('iterator for empty array', function () {
        var it = new extract_element_iterator_1.ExtractElementIterator(new array_iterator_1.ArrayIterator([]), 0);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can extract first element', function () {
        var it = new extract_element_iterator_1.ExtractElementIterator(new array_iterator_1.ArrayIterator([
            [10, 100],
            [20, 200],
        ]), 0);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 10,
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 20,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('can extract first second', function () {
        var it = new extract_element_iterator_1.ExtractElementIterator(new array_iterator_1.ArrayIterator([
            [10, 100],
            [20, 200],
        ]), 1);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 100,
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: 200,
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
});
//# sourceMappingURL=extract-element-iterator.test.js.map