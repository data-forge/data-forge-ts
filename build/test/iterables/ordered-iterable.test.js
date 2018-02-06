"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var ordered_iterable_1 = require("../../lib/iterables/ordered-iterable");
describe('ordered iterable', function () {
    function flattenIterable(iterable) {
        var output = [];
        try {
            for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
                var value = iterable_1_1.value;
                output.push(value);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return output;
        var e_1, _a;
    }
    it('empty input is empty output', function () {
        var orderedIterable = new ordered_iterable_1.OrderedIterable([], [{ sortLevel: 0, selector: function () { return 0; }, direction: ordered_iterable_1.Direction.Ascending }]);
        chai_1.expect(flattenIterable(orderedIterable)).to.eql([]);
    });
    it('sorted list is returned unchanged - ascending', function () {
        var orderedIterable = new ordered_iterable_1.OrderedIterable([1, 2, 3], [{ sortLevel: 0, selector: function (v) { return v; }, direction: ordered_iterable_1.Direction.Ascending }]);
        chai_1.expect(flattenIterable(orderedIterable)).to.eql([1, 2, 3]);
    });
    it('sorted list is returned unchanged - descending', function () {
        var orderedIterable = new ordered_iterable_1.OrderedIterable([3, 2, 1], [{ sortLevel: 0, selector: function (v) { return v; }, direction: ordered_iterable_1.Direction.Descending }]);
        chai_1.expect(flattenIterable(orderedIterable)).to.eql([3, 2, 1]);
    });
    it('out of order list is sorted - ascending', function () {
        var orderedIterable = new ordered_iterable_1.OrderedIterable([3, 1, 2], [{ sortLevel: 0, selector: function (v) { return v; }, direction: ordered_iterable_1.Direction.Ascending }]);
        chai_1.expect(flattenIterable(orderedIterable)).to.eql([1, 2, 3]);
    });
    it('out of order list is sorted - descending', function () {
        var orderedIterable = new ordered_iterable_1.OrderedIterable([1, 3, 2], [{ sortLevel: 0, selector: function (v) { return v; }, direction: ordered_iterable_1.Direction.Descending }]);
        chai_1.expect(flattenIterable(orderedIterable)).to.eql([3, 2, 1]);
    });
    it('can sort based on field', function () {
        var orderedIterable = new ordered_iterable_1.OrderedIterable([{ x: 3 }, { x: 1 }, { x: 2 }], [{ sortLevel: 0, selector: function (v) { return v.x; }, direction: ordered_iterable_1.Direction.Ascending }]);
        chai_1.expect(flattenIterable(orderedIterable)).to.eql([{ x: 1 }, { x: 2 }, { x: 3 }]);
    });
    it('can do nested sort - ascending', function () {
        var orderedIterable = new ordered_iterable_1.OrderedIterable([{ x: 3, y: 2 }, { x: 3, y: 5 }, { x: 2, y: 10 }], [
            { sortLevel: 0, selector: function (v) { return v.x; }, direction: ordered_iterable_1.Direction.Ascending },
            { sortLevel: 1, selector: function (v) { return v.y; }, direction: ordered_iterable_1.Direction.Ascending },
        ]);
        chai_1.expect(flattenIterable(orderedIterable)).to.eql([
            { x: 2, y: 10 },
            { x: 3, y: 2 },
            { x: 3, y: 5 }
        ]);
    });
    it('can do nested sort - descending', function () {
        var orderedIterable = new ordered_iterable_1.OrderedIterable([{ x: 3, y: 2 }, { x: 3, y: 5 }, { x: 2, y: 10 }], [
            { sortLevel: 0, selector: function (v) { return v.x; }, direction: ordered_iterable_1.Direction.Ascending },
            { sortLevel: 1, selector: function (v) { return v.y; }, direction: ordered_iterable_1.Direction.Descending },
        ]);
        chai_1.expect(flattenIterable(orderedIterable)).to.eql([
            { x: 2, y: 10 },
            { x: 3, y: 5 },
            { x: 3, y: 2 }
        ]);
    });
});
//# sourceMappingURL=ordered-iterable.test.js.map