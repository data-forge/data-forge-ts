"use strict";
//
// An iterator that can iterate multiple other iterators at once.
// This allows iterators to be composed.
// This is used in Data-Forge to combine iterators for index and values.
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
var MultiIterator = /** @class */ (function () {
    function MultiIterator(iterators) {
        this.iterators = iterators;
    }
    MultiIterator.prototype.next = function () {
        if (this.iterators.length === 0) {
            return {
                done: true,
                value: [],
            };
        }
        var multiResult = [];
        try {
            for (var _a = __values(this.iterators), _b = _a.next(); !_b.done; _b = _a.next()) {
                var iterator = _b.value;
                var result = iterator.next();
                if (result.done) {
                    return {
                        done: true,
                        value: [],
                    };
                }
                multiResult.push(result.value);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return {
            done: false,
            value: multiResult
        };
        var e_1, _c;
    };
    return MultiIterator;
}());
exports.MultiIterator = MultiIterator;
//# sourceMappingURL=multi-iterator.js.map