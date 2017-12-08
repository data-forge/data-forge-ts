"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var index_1 = require("../lib/index");
var series_1 = require("../lib/series");
var array_iterable_1 = require("../lib/iterables/array-iterable");
describe('Series constructor', function () {
    it('create series from array of values', function () {
        chai_1.expect(new series_1.Series([10, 20, 30]).toArray()).to.eql([10, 20, 30]);
    });
    it('create series from empty array', function () {
        chai_1.expect(new series_1.Series([]).toArray()).to.eql([]);
    });
    it('create empty series using no params', function () {
        chai_1.expect(new series_1.Series().toArray()).to.eql([]);
    });
    it('create empty series from empty config', function () {
        chai_1.expect(new series_1.Series({}).toArray()).to.eql([]);
    });
    it('create empty series from config with no values, although index is set.', function () {
        chai_1.expect(new series_1.Series({ index: [100, 200, 300] }).toArray()).to.eql([]);
    });
    it('create series from array of values in config', function () {
        chai_1.expect(new series_1.Series({ values: [10, 20, 30] }).toArray()).to.eql([10, 20, 30]);
    });
    it('create series from empty array in config', function () {
        chai_1.expect(new series_1.Series({ values: [] }).toArray()).to.eql([]);
    });
    it('create series with values iterable', function () {
        var series = new series_1.Series({ values: new array_iterable_1.ArrayIterable([10, 20, 30]) });
        chai_1.expect(series.toArray()).to.eql([10, 20, 30]);
    });
    it('passing something other than an array or iterable for values is an error', function () {
        // This isn't possible in TypeScript, but is in JavaScript.
        chai_1.expect(function () { return new series_1.Series({ values: 3 }); }).to.throw();
    });
    //todo: create series with values iterable in config
    //todo create series from values array and index iterable
    // create series from values iterable and index iterable
    //tod: 
    it('index is set by default when values are passed in by array', function () {
        var series = new series_1.Series([10, 20, 30]);
        chai_1.expect(series.toPairs()).to.eql([
            [0, 10],
            [1, 20],
            [2, 30],
        ]);
    });
    it('index is set by default when values are passed in by config', function () {
        var series = new series_1.Series({
            values: [10, 20, 30]
        });
        chai_1.expect(series.toPairs()).to.eql([
            [0, 10],
            [1, 20],
            [2, 30],
        ]);
    });
    it('can set index via array passed to constructor', function () {
        var series = new series_1.Series({
            values: [10, 20, 30],
            index: [100, 200, 300]
        });
        chai_1.expect(series.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);
    });
    it('can create series with values array and index iterable', function () {
        var series = new series_1.Series({
            values: [10, 20, 30],
            index: new array_iterable_1.ArrayIterable([100, 200, 300])
        });
        chai_1.expect(series.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);
    });
    it('can create series with values iterable and index iterable', function () {
        var series = new series_1.Series({
            values: new array_iterable_1.ArrayIterable([10, 20, 30]),
            index: new array_iterable_1.ArrayIterable([100, 200, 300])
        });
        chai_1.expect(series.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);
    });
    it('passing something other than an array or iterable for index is an error', function () {
        // This isn't possible in TypeScript, but is in JavaScript.
        chai_1.expect(function () { return new series_1.Series({ values: [10, 20, 30], index: 3 }); }).to.throw();
    });
    it('can create series with index from another series', function () {
        var series = new series_1.Series({
            values: [10, 20, 30],
            index: new series_1.Series([100, 200, 300])
        });
        chai_1.expect(series.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);
    });
    it('can get index from series', function () {
        var series = new series_1.Series({
            values: [10, 20, 30],
            index: [100, 200, 300]
        });
        chai_1.expect(series.getIndex().toArray()).to.eql([
            100,
            200,
            300,
        ]);
    });
    it('can create series with index from another index', function () {
        var series = new series_1.Series({
            values: [10, 20, 30],
            index: new index_1.Index([100, 200, 300])
        });
        chai_1.expect(series.toPairs()).to.eql([
            [100, 10],
            [200, 20],
            [300, 30],
        ]);
    });
    it('can create series from pairs', function () {
        var series = new series_1.Series({
            pairs: new array_iterable_1.ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],
            ]),
        });
        chai_1.expect(series.getIndex().toArray()).to.eql([100, 200, 300]);
        chai_1.expect(series.toArray()).to.eql([10, 20, 30]);
    });
    it('can create series from values and pairs', function () {
        var series = new series_1.Series({
            values: new array_iterable_1.ArrayIterable([
                5, 4, 6,
            ]),
            pairs: new array_iterable_1.ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],
            ]),
        });
        chai_1.expect(series.getIndex().toArray()).to.eql([100, 200, 300]);
        chai_1.expect(series.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        chai_1.expect(series.toArray()).to.eql([5, 4, 6]); // Different values! A hack to test.
    });
    it('can create series from index and pairs', function () {
        var series = new series_1.Series({
            index: new array_iterable_1.ArrayIterable([
                15, 16, 17 // Trick. Separate index values.
            ]),
            pairs: new array_iterable_1.ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],
            ]),
        });
        chai_1.expect(series.getIndex().toArray()).to.eql([15, 16, 17]); // Different values!
        chai_1.expect(series.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        chai_1.expect(series.toArray()).to.eql([10, 20, 30]);
    });
    it('can create series from values, index and pairs', function () {
        var series = new series_1.Series({
            values: new array_iterable_1.ArrayIterable([
                5, 4, 6,
            ]),
            index: new array_iterable_1.ArrayIterable([
                15, 16, 17 // Trick. Separate index values.
            ]),
            pairs: new array_iterable_1.ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],
            ]),
        });
        chai_1.expect(series.getIndex().toArray()).to.eql([15, 16, 17]); // Different values!
        chai_1.expect(series.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        chai_1.expect(series.toArray()).to.eql([5, 4, 6]); // Different values! A hack to test.
    });
});
//# sourceMappingURL=series.constructor.test.js.map