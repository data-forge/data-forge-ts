"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var index_1 = require("../index");
describe('Series', function () {
    it('can bake series', function () {
        var series = new index_1.Series({
            values: [10, 20],
            index: [1, 2],
        });
        var baked = series.bake();
        chai_1.expect(baked).not.to.equal(series);
    });
    it('baking a baked series returns same', function () {
        var series = new index_1.Series({
            values: [10, 20],
            index: [1, 2],
        });
        var baked = series.bake();
        var rebaked = baked.bake();
        chai_1.expect(rebaked).to.equal(baked);
    });
    it('can inflate to dataframe', function () {
        var series = new index_1.Series({
            values: [10, 20],
            index: [100, 200]
        });
        var dataframe = series.select(function (v) { return ({ V: v }); }).inflate();
        chai_1.expect(dataframe.toArray()).to.eql([
            {
                V: 10,
            },
            {
                V: 20,
            },
        ]);
        chai_1.expect(dataframe.getIndex().toArray()).to.eql([100, 200]);
        chai_1.expect(dataframe.toPairs()).to.eql([
            [100, { V: 10, },],
            [200, { V: 20, },],
        ]);
    });
    it('can inflate to dataframe with no selector', function () {
        var series = new index_1.Series({
            values: [{ V: 10 }, { V: 20 }],
            index: [100, 200]
        });
        var dataframe = series.inflate();
        chai_1.expect(dataframe.toArray()).to.eql([
            {
                V: 10,
            },
            {
                V: 20,
            },
        ]);
        chai_1.expect(dataframe.getIndex().toArray()).to.eql([100, 200]);
        chai_1.expect(dataframe.toPairs()).to.eql([
            [100, { V: 10, },],
            [200, { V: 20, },],
        ]);
    });
    it('Series.toArray strips undefined values', function () {
        var series = new index_1.Series([10, undefined, 20, undefined]);
        chai_1.expect(series.toArray()).to.eql([10, 20]);
    });
    it('Series.toPairs strips undefined values', function () {
        var series = new index_1.Series([10, undefined, 20, undefined]);
        chai_1.expect(series.toPairs()).to.eql([
            [0, 10],
            [2, 20]
        ]);
    });
    it('can skip values in a series', function () {
        var series = new index_1.Series({
            values: [1, 2, 3, 4, 5],
            index: [0, 1, 2, 3, 4],
        });
        var result = series.skip(2);
        chai_1.expect(result.toArray()).to.eql([3, 4, 5]);
        chai_1.expect(result.getIndex().toArray()).to.eql([2, 3, 4]);
        chai_1.expect(result.toPairs()).to.eql([[2, 3], [3, 4], [4, 5]]);
    });
    it('can take', function () {
        var series = new index_1.Series({
            index: [0, 1, 2, 3],
            values: [100, 300, 200, 5]
        });
        var skipped = series.take(2);
        chai_1.expect(skipped.getIndex().toArray()).to.eql([0, 1]);
        chai_1.expect(skipped.toArray()).to.eql([100, 300]);
    });
    it('can filter', function () {
        var series = new index_1.Series({
            index: [0, 1, 2, 3],
            values: [100, 300, 200, 5]
        });
        var filtered = series.where(function (value) {
            return value >= 100 && value < 300;
        });
        chai_1.expect(filtered.getIndex().toArray()).to.eql([0, 2]);
        chai_1.expect(filtered.toArray()).to.eql([100, 200]);
    });
    it('can skip while', function () {
        var series = new index_1.Series({ index: [0, 1, 2, 3], values: [true, true, false, true] });
        var skipped = series.skipWhile(function (value) { return value; });
        chai_1.expect(skipped.toPairs()).to.eql([
            [2, false],
            [3, true],
        ]);
    });
    it('can skip until', function () {
        var series = new index_1.Series({ index: [0, 1, 2, 3], values: [false, false, true, false] });
        var skipped = series.skipUntil(function (value) { return value; });
        chai_1.expect(skipped.toPairs()).to.eql([
            [2, true],
            [3, false],
        ]);
    });
    it('can take while', function () {
        var series = new index_1.Series({ index: [0, 1, 2, 3], values: [true, true, false, true] });
        var skipped = series.takeWhile(function (value) { return value; });
        chai_1.expect(skipped.toPairs()).to.eql([
            [0, true],
            [1, true],
        ]);
    });
    it('can take until', function () {
        var series = new index_1.Series({ index: [0, 1, 2, 3], values: [false, false, true, false] });
        var skipped = series.takeUntil(function (value) { return value; });
        chai_1.expect(skipped.toPairs()).to.eql([
            [0, false],
            [1, false],
        ]);
    });
    it('can count number of elements', function () {
        var series = new index_1.Series([10, 20, 30]);
        chai_1.expect(series.count()).to.eql(3);
    });
    it('can get first and last values', function () {
        var series = new index_1.Series(['A', 'B', 'C']);
        chai_1.expect(series.first()).to.eql('A');
        chai_1.expect(series.last()).to.eql('C');
    });
    it('getting first of empty series throws exception', function () {
        var series = new index_1.Series();
        chai_1.expect(function () {
            series.first();
        }).to.throw();
    });
    it('getting last of empty series throws exception', function () {
        var series = new index_1.Series();
        chai_1.expect(function () {
            series.last();
        }).to.throw();
    });
    it('can get head of series', function () {
        var series = new index_1.Series({ index: [0, 1, 2], values: ['A', 'B', 'C'] });
        var head = series.head(2);
        chai_1.expect(head.toArray()).to.eql(['A', 'B']);
    });
    it('can get tail of series', function () {
        var series = new index_1.Series({ index: [0, 1, 2], values: ['A', 'B', 'C'] });
        var head = series.tail(2);
        chai_1.expect(head.toArray()).to.eql(['B', 'C']);
    });
    it('for each', function () {
        var series = new index_1.Series([0, 1, 2]);
        var count = 0;
        series.forEach(function (v) {
            chai_1.expect(v).to.eql(count);
            ++count;
        });
        chai_1.expect(count).to.eql(3);
    });
    it('all - zero elements', function () {
        var series = new index_1.Series({ values: [] });
        chai_1.expect(series.all(function (value) {
            return value === 200;
        })).to.eql(false);
    });
    it('all - no elements match', function () {
        var series = new index_1.Series({ values: [1, 2, 3, 4] });
        chai_1.expect(series.all(function (value) {
            return value === 200;
        })).to.eql(false);
    });
    it('all - some elements match', function () {
        var series = new index_1.Series({ values: [1, 3, 3, 4] });
        chai_1.expect(series.all(function (value) {
            return value === 3;
        })).to.eql(false);
    });
    it('all - all elements match', function () {
        var series = new index_1.Series({ values: [5, 5, 5, 5] });
        chai_1.expect(series.all(function (value) {
            return value === 5;
        })).to.eql(true);
    });
    it('any - zero elements', function () {
        var series = new index_1.Series({ values: [] });
        chai_1.expect(series.any(function (value) {
            return value === 200;
        })).to.eql(false);
    });
    it('any - no elements match', function () {
        var series = new index_1.Series({ values: [1, 2, 3, 4] });
        chai_1.expect(series.any(function (value) {
            return value === 200;
        })).to.eql(false);
    });
    it('any - some elements match', function () {
        var series = new index_1.Series({ values: [1, 3, 3, 4] });
        chai_1.expect(series.any(function (value) {
            return value === 3;
        })).to.eql(true);
    });
    it('any - all elements match', function () {
        var series = new index_1.Series({ values: [5, 5, 5, 5] });
        chai_1.expect(series.any(function (value) {
            return value === 5;
        })).to.eql(true);
    });
    it('any - with no predicate - no elements', function () {
        var series = new index_1.Series({ values: [] });
        chai_1.expect(series.any()).to.eql(false);
    });
    it('any - with no predicate - elements exist', function () {
        var series = new index_1.Series({ values: [5, 5, 5, 5] });
        chai_1.expect(series.any()).to.eql(true);
    });
    it('none - zero elements', function () {
        var series = new index_1.Series({ values: [] });
        chai_1.expect(series.none(function (value) {
            return value === 200;
        })).to.eql(true);
    });
    it('none - no elements match', function () {
        var series = new index_1.Series({ values: [1, 2, 3, 4] });
        chai_1.expect(series.none(function (value) {
            return value === 200;
        })).to.eql(true);
    });
    it('none - some elements match', function () {
        var series = new index_1.Series({ values: [1, 3, 3, 4] });
        chai_1.expect(series.none(function (value) {
            return value === 3;
        })).to.eql(false);
    });
    it('none - all elements match', function () {
        var series = new index_1.Series({ values: [5, 5, 5, 5] });
        chai_1.expect(series.none(function (value) {
            return value === 5;
        })).to.eql(false);
    });
    it('none - with no predicate - zero elements', function () {
        var series = new index_1.Series({ values: [] });
        chai_1.expect(series.none()).to.eql(true);
    });
    it('none - with no predicate - has existing elements', function () {
        var series = new index_1.Series({ values: [5, 5, 5, 5] });
        chai_1.expect(series.none()).to.eql(false);
    });
    it('can get series starting at particular index - with integer index', function () {
        var series = new index_1.Series({
            index: [10, 20, 30],
            values: [1, 2, 3],
        });
        var reduced = series.startAt(20);
        chai_1.expect(reduced.toPairs()).to.eql([
            [20, 2],
            [30, 3],
        ]);
    });
    it('can get series starting before a particular index - with integer index', function () {
        var series = new index_1.Series({
            index: [10, 20, 30],
            values: [1, 2, 3],
        });
        var reduced = series.startAt(15);
        chai_1.expect(reduced.toPairs()).to.eql([
            [20, 2],
            [30, 3],
        ]);
    });
    it('can get series starting at particular index - with date index', function () {
        var series = new index_1.Series({
            index: [
                new Date(2016, 5, 1),
                new Date(2016, 5, 5),
                new Date(2016, 5, 10),
            ],
            values: [1, 2, 3],
        });
        var reduced = series.startAt(new Date(2016, 5, 5));
        chai_1.expect(reduced.toPairs()).to.eql([
            [new Date(2016, 5, 5), 2],
            [new Date(2016, 5, 10), 3],
        ]);
    });
    it('can get series starting before a particular index - with date index', function () {
        var series = new index_1.Series({
            index: [
                new Date(2016, 5, 1),
                new Date(2016, 5, 5),
                new Date(2016, 5, 10),
            ],
            values: [1, 2, 3],
        });
        var reduced = series.startAt(new Date(2016, 5, 4));
        chai_1.expect(reduced.toPairs()).to.eql([
            [new Date(2016, 5, 5), 2],
            [new Date(2016, 5, 10), 3],
        ]);
    });
    it('can get series ending at particular index - with integer index', function () {
        var series = new index_1.Series({
            index: [10, 20, 30],
            values: [1, 2, 3],
        });
        var reduced = series.endAt(20);
        chai_1.expect(reduced.toPairs()).to.eql([
            [10, 1],
            [20, 2],
        ]);
    });
    it('can get series ending before a particular index - with integer index', function () {
        var series = new index_1.Series({
            index: [10, 20, 30],
            values: [1, 2, 3],
        });
        var reduced = series.endAt(25);
        chai_1.expect(reduced.toPairs()).to.eql([
            [10, 1],
            [20, 2],
        ]);
    });
    it('can get series ending at particular index - with date index', function () {
        var series = new index_1.Series({
            index: [
                new Date(2016, 5, 1),
                new Date(2016, 5, 5),
                new Date(2016, 5, 10),
            ],
            values: [1, 2, 3],
        });
        var reduced = series.endAt(new Date(2016, 5, 5));
        chai_1.expect(reduced.toPairs()).to.eql([
            [new Date(2016, 5, 1), 1],
            [new Date(2016, 5, 5), 2],
        ]);
    });
    it('can get series ending before a particular index - with date index', function () {
        var series = new index_1.Series({
            index: [
                new Date(2016, 5, 1),
                new Date(2016, 5, 5),
                new Date(2016, 5, 10),
            ],
            values: [1, 2, 3],
        });
        var reduced = series.endAt(new Date(2016, 5, 6));
        chai_1.expect(reduced.toPairs()).to.eql([
            [new Date(2016, 5, 1), 1],
            [new Date(2016, 5, 5), 2],
        ]);
    });
    it('can get series before a particular index - with integer index', function () {
        var series = new index_1.Series({
            index: [10, 20, 30],
            values: [1, 2, 3],
        });
        var reduced = series.before(25);
        chai_1.expect(reduced.toPairs()).to.eql([
            [10, 1],
            [20, 2],
        ]);
    });
    it('can get series before a particular index - with date index', function () {
        var series = new index_1.Series({
            index: [
                new Date(2016, 5, 1),
                new Date(2016, 5, 5),
                new Date(2016, 5, 10),
            ],
            values: [1, 2, 3],
        });
        var reduced = series.before(new Date(2016, 5, 6));
        chai_1.expect(reduced.toPairs()).to.eql([
            [new Date(2016, 5, 1), 1],
            [new Date(2016, 5, 5), 2],
        ]);
    });
    it('can get series after a particular index - with integer index', function () {
        var series = new index_1.Series({
            index: [10, 20, 30],
            values: [1, 2, 3],
        });
        var reduced = series.after(15);
        chai_1.expect(reduced.toPairs()).to.eql([
            [20, 2],
            [30, 3],
        ]);
    });
    it('can get series after a particular index - with date index', function () {
        var series = new index_1.Series({
            index: [
                new Date(2016, 5, 1),
                new Date(2016, 5, 5),
                new Date(2016, 5, 10),
            ],
            values: [1, 2, 3],
        });
        var reduced = series.after(new Date(2016, 5, 2));
        chai_1.expect(reduced.toPairs()).to.eql([
            [new Date(2016, 5, 5), 2],
            [new Date(2016, 5, 10), 3],
        ]);
    });
    it('can get series between particular indices - with integer index', function () {
        var series = new index_1.Series({
            index: [10, 20, 30],
            values: [1, 2, 3],
        });
        var reduced = series.between(11, 25);
        chai_1.expect(reduced.toPairs()).to.eql([
            [20, 2],
        ]);
    });
    it('can get slice of rows - with string indices', function () {
        var series = new index_1.Series({
            index: ["a", "b", "c", "d", "e"],
            values: [100, 300, 200, 5, 30],
        });
        var slice = series.between("b", "e");
        chai_1.expect(slice.toPairs()).to.eql([
            ["b", 300],
            ["c", 200],
            ["d", 5],
            ["e", 30],
        ]);
    });
    it('can get series between particular indices - with date index', function () {
        var series = new index_1.Series({
            index: [
                new Date(2016, 5, 1),
                new Date(2016, 5, 5),
                new Date(2016, 5, 10),
            ],
            values: [1, 2, 3],
        });
        var reduced = series.between(new Date(2016, 5, 2), new Date(2016, 5, 8));
        chai_1.expect(reduced.toPairs()).to.eql([
            [new Date(2016, 5, 5), 2],
        ]);
    });
    it('can transform a series to a series of pairs', function () {
        var series = new index_1.Series({
            index: [10, 20, 30],
            values: [1, 2, 3],
        });
        var pairs = series.asPairs().toArray();
        chai_1.expect(pairs).to.eql([
            [10, 1],
            [20, 2],
            [30, 3],
        ]);
    });
    it('can transform series of pairs to series of values', function () {
        var series = new index_1.Series({
            index: [10, 20, 30],
            values: [1, 2, 3],
        });
        var values = series.asPairs().asValues();
        chai_1.expect(values.toPairs()).to.eql([
            [10, 1],
            [20, 2],
            [30, 3],
        ]);
    });
});
//# sourceMappingURL=series.test.js.map