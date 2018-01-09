"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var index_1 = require("../lib/index");
var dataframe_1 = require("../lib/dataframe");
var array_iterable_1 = require("../lib/iterables/array-iterable");
describe('DataFrame constructor', function () {
    it('create dataframe from array of values', function () {
        var dataFrame = new dataframe_1.DataFrame([
            { A: 10 },
            { A: 20 },
            { A: 30 },
        ]);
        chai_1.expect(dataFrame.toArray()).to.eql([
            { A: 10 },
            { A: 20 },
            { A: 30 },
        ]);
    });
    it('can get rows from dataframe', function () {
        var dataFrame = new dataframe_1.DataFrame([
            { A: 10, B: 100 },
            { A: 20, B: 200 },
            { A: 30, B: 300 },
        ]);
        chai_1.expect(dataFrame.toRows()).to.eql([
            [10, 100],
            [20, 200],
            [30, 300],
        ]);
    });
    it('empty dataframe returns empty row', function () {
        chai_1.expect(new dataframe_1.DataFrame().toRows()).to.eql([]);
    });
    it('create dataframe from empty array', function () {
        chai_1.expect(new dataframe_1.DataFrame([]).toArray()).to.eql([]);
    });
    it('create empty dataframe using no params', function () {
        chai_1.expect(new dataframe_1.DataFrame().toArray()).to.eql([]);
    });
    it('create empty dataframe from empty config', function () {
        chai_1.expect(new dataframe_1.DataFrame({}).toArray()).to.eql([]);
    });
    it('create empty dataframe from config with no values, although index is set.', function () {
        chai_1.expect(new dataframe_1.DataFrame({ index: [100, 200, 300] }).toArray()).to.eql([]);
    });
    it('create dataframe from array of values in config', function () {
        var dataFrame = new dataframe_1.DataFrame({
            values: [
                { A: 10 },
                { A: 20 },
                { A: 30 },
            ],
        });
        chai_1.expect(dataFrame.toArray()).to.eql([
            { A: 10 },
            { A: 20 },
            { A: 30 },
        ]);
    });
    it('create dataframe from empty array in config', function () {
        chai_1.expect(new dataframe_1.DataFrame({ values: [] }).toArray()).to.eql([]);
    });
    it('create dataframe with values iterable', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: new array_iterable_1.ArrayIterable([
                { A: 10 },
                { A: 20 },
                { A: 30 },
            ])
        });
        chai_1.expect(dataframe.toArray()).to.eql([
            { A: 10 },
            { A: 20 },
            { A: 30 },
        ]);
    });
    it('passing something other than an array or iterable for values is an error', function () {
        // This isn't possible in TypeScript, but is in JavaScript.
        chai_1.expect(function () { return new dataframe_1.DataFrame({ values: 3 }); }).to.throw();
    });
    it('index is set by default when values are passed in by array', function () {
        var dataFrame = new dataframe_1.DataFrame([
            { A: 10 },
            { A: 20 },
            { A: 30 },
        ]);
        chai_1.expect(dataFrame.toPairs()).to.eql([
            [0, { A: 10 }],
            [1, { A: 20 }],
            [2, { A: 30 }],
        ]);
    });
    it('index is set by default when values are passed in by config', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: [
                { A: 10 },
                { A: 20 },
                { A: 30 },
            ]
        });
        chai_1.expect(dataframe.toPairs()).to.eql([
            [0, { A: 10 }],
            [1, { A: 20 }],
            [2, { A: 30 }],
        ]);
    });
    it('can set index via array passed to constructor', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: [
                { A: 10 },
                { A: 20 },
                { A: 30 },
            ],
            index: [100, 200, 300]
        });
        chai_1.expect(dataframe.toPairs()).to.eql([
            [100, { A: 10 }],
            [200, { A: 20 }],
            [300, { A: 30 }],
        ]);
    });
    it('can create dataframe with values array and index iterable', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: [
                { A: 10 },
                { A: 20 },
                { A: 30 },
            ],
            index: new array_iterable_1.ArrayIterable([100, 200, 300])
        });
        chai_1.expect(dataframe.toPairs()).to.eql([
            [100, { A: 10 }],
            [200, { A: 20 }],
            [300, { A: 30 }],
        ]);
    });
    it('can create dataframe with values iterable and index iterable', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: new array_iterable_1.ArrayIterable([
                { A: 10 },
                { A: 20 },
                { A: 30 },
            ]),
            index: new array_iterable_1.ArrayIterable([100, 200, 300])
        });
        chai_1.expect(dataframe.toPairs()).to.eql([
            [100, { A: 10 }],
            [200, { A: 20 }],
            [300, { A: 30 }],
        ]);
    });
    it('passing something other than an array or iterable for index is an error', function () {
        // This isn't possible in TypeScript, but is in JavaScript.
        chai_1.expect(function () { return new dataframe_1.DataFrame({ values: [10, 20, 30], index: 3 }); }).to.throw();
    });
    it('can create dataframe with index from another dataframe', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: [
                { A: 10 },
                { A: 20 },
                { A: 30 },
            ],
            index: new dataframe_1.DataFrame([100, 200, 300])
        });
        chai_1.expect(dataframe.toPairs()).to.eql([
            [100, { A: 10 }],
            [200, { A: 20 }],
            [300, { A: 30 }],
        ]);
    });
    it('can get index from dataframe', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: [
                { A: 10 },
                { A: 20 },
                { A: 30 },
            ],
            index: [100, 200, 300]
        });
        chai_1.expect(dataframe.getIndex().toArray()).to.eql([
            100,
            200,
            300,
        ]);
    });
    it('can create dataframe with index from another index', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: [
                { A: 10 },
                { A: 20 },
                { A: 30 },
            ],
            index: new index_1.Index([100, 200, 300])
        });
        chai_1.expect(dataframe.toPairs()).to.eql([
            [100, { A: 10 }],
            [200, { A: 20 }],
            [300, { A: 30 }],
        ]);
    });
    it('can create dataframe from pairs', function () {
        var dataframe = new dataframe_1.DataFrame({
            pairs: new array_iterable_1.ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],
            ]),
        });
        chai_1.expect(dataframe.getIndex().toArray()).to.eql([100, 200, 300]);
        chai_1.expect(dataframe.toArray()).to.eql([10, 20, 30]);
    });
    it('can create dataframe from values and pairs', function () {
        var dataframe = new dataframe_1.DataFrame({
            values: new array_iterable_1.ArrayIterable([
                5, 4, 6,
            ]),
            pairs: new array_iterable_1.ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],
            ]),
        });
        chai_1.expect(dataframe.getIndex().toArray()).to.eql([100, 200, 300]);
        chai_1.expect(dataframe.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        chai_1.expect(dataframe.toArray()).to.eql([5, 4, 6]); // Different values! A hack to test.
    });
    it('can create dataframe from index and pairs', function () {
        var dataframe = new dataframe_1.DataFrame({
            index: new array_iterable_1.ArrayIterable([
                15, 16, 17 // Trick. Separate index values.
            ]),
            pairs: new array_iterable_1.ArrayIterable([
                [100, 10],
                [200, 20],
                [300, 30],
            ]),
        });
        chai_1.expect(dataframe.getIndex().toArray()).to.eql([15, 16, 17]); // Different values!
        chai_1.expect(dataframe.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        chai_1.expect(dataframe.toArray()).to.eql([10, 20, 30]);
    });
    it('can create dataframe from values, index and pairs', function () {
        var dataframe = new dataframe_1.DataFrame({
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
        chai_1.expect(dataframe.getIndex().toArray()).to.eql([15, 16, 17]); // Different values!
        chai_1.expect(dataframe.toPairs()).to.eql([[100, 10], [200, 20], [300, 30]]);
        chai_1.expect(dataframe.toArray()).to.eql([5, 4, 6]); // Different values! A hack to test.
    });
    it('can create from rows', function () {
        var columnNames = ["c1", "c2"];
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: columnNames,
            values: [
                [1, 2],
                [3, 4],
            ],
        });
        chai_1.expect(dataFrame.getColumnNames()).to.eql(columnNames);
        chai_1.expect(dataFrame.toArray()).to.eql([
            { c1: 1, c2: 2 },
            { c1: 3, c2: 4 },
        ]);
    });
    it('can create from rows with index', function () {
        var columnNames = ["c1", "c2"];
        var dataFrame = new dataframe_1.DataFrame({
            columnNames: columnNames,
            values: [
                [1, 2],
                [3, 4],
            ],
            index: [10, 11],
        });
        chai_1.expect(dataFrame.getColumnNames()).to.eql(columnNames);
        chai_1.expect(dataFrame.toPairs()).to.eql([
            [10, { c1: 1, c2: 2 }],
            [11, { c1: 3, c2: 4 }],
        ]);
    });
    it("can handle undefined row", function () {
        var d = new dataframe_1.DataFrame({
            columnNames: ["c1", "c2"],
            values: [
                [1, 2],
                undefined,
                [5, 2]
            ],
        });
        chai_1.expect(function () {
            d.toArray();
        }).to.throw();
    });
});
//# sourceMappingURL=dataframe.constructor.test.js.map