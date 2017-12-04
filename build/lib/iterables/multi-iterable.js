"use strict";
//
// An iterable that allows multiple other iterables to be iterated at once.
// This allows iterables to be composed.
// This is used in Data-Forge to combine iterables for index and values.
//
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
var multi_iterator_1 = require("../iterators/multi-iterator");
var MultiIterable = /** @class */ (function () {
    function MultiIterable(iterables) {
        this.iterables = iterables;
    }
    MultiIterable.prototype[Symbol.iterator] = function () {
        var iterators = [];
        try {
            for (var _a = __values(this.iterables), _b = _a.next(); !_b.done; _b = _a.next()) {
                var iterable = _b.value;
                iterators.push(iterable[Symbol.iterator]());
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return new multi_iterator_1.MultiIterator(iterators);
        var e_1, _c;
    };
    return MultiIterable;
}());
exports.MultiIterable = MultiIterable;
//# sourceMappingURL=multi-iterable.js.map