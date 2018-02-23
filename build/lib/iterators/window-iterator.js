"use strict";
//
// Iterates an underlying iterable in the 'windows'.
//
Object.defineProperty(exports, "__esModule", { value: true });
var take_iterable_1 = require("../iterables/take-iterable");
var skip_iterable_1 = require("../iterables/skip-iterable");
var series_1 = require("../series");
var WindowIterator = /** @class */ (function () {
    function WindowIterator(iterable, period) {
        this.windowIndex = 0;
        this.iterable = iterable;
        this.period = period;
    }
    WindowIterator.prototype.next = function () {
        /*
        console.log('>> next'); //fio:

        for (const xx of new TakeIterable(
                new SkipIterable(
                    this.iterable,
                    this.windowIndex * this.period
                ),
                this.period
            )) {
                console.log(xx);
            }
            */
        var window = new series_1.Series({
            pairs: new take_iterable_1.TakeIterable(new skip_iterable_1.SkipIterable(this.iterable, this.windowIndex++ * this.period), this.period)
        });
        //console.log('window'); //fio:
        //console.log(window.toPairs()); //fio:
        if (window.none()) {
            // Nothing more to read from the underlying iterable.
            // https://github.com/Microsoft/TypeScript/issues/8938
            return { done: true }; // <= explicit cast here!;
        }
        return {
            value: window,
            done: false,
        };
    };
    return WindowIterator;
}());
exports.WindowIterator = WindowIterator;
//# sourceMappingURL=window-iterator.js.map