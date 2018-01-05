'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var column_names_iterator_1 = require("../../lib/iterators/column-names-iterator");
var array_iterable_1 = require("../../lib/iterables/array-iterable");
describe('column names iterator', function () {
    it('iterator for empty values iterable', function () {
        var it = new column_names_iterator_1.ColumnNamesIterator(new array_iterable_1.ArrayIterable([]), false);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('iterator for column names with 1 elem, but zero fields', function () {
        var it = new column_names_iterator_1.ColumnNamesIterator(new array_iterable_1.ArrayIterable([
            {},
        ]), false);
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('iterator for column names with 1 elem', function () {
        var it = new column_names_iterator_1.ColumnNamesIterator(new array_iterable_1.ArrayIterable([
            {
                A: 1,
                B: 2,
            },
        ]), false);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: "A",
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: "B",
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('iterator for column names with 2 elems', function () {
        var it = new column_names_iterator_1.ColumnNamesIterator(new array_iterable_1.ArrayIterable([
            {
                A: 1,
                B: 2,
            },
            {
                C: 10,
                D: 20,
            },
        ]), false);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: "A",
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: "B",
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
    it('iterator for column names with varying elems - when all elems are considered', function () {
        var it = new column_names_iterator_1.ColumnNamesIterator(new array_iterable_1.ArrayIterable([
            {
                A: 1,
                B: 2,
            },
            {
                C: 10,
                D: 20,
            },
        ]), true);
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: "A",
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: "B",
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: "C",
        });
        chai_1.expect(it.next()).to.eql({
            done: false,
            value: "D",
        });
        chai_1.expect(it.next().done).to.eql(true);
    });
});
//# sourceMappingURL=column-names-iterator.test.js.map