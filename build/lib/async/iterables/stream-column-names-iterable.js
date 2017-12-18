"use strict";
//
// An iterable that iterates column names that are read from a file stream.
//
Object.defineProperty(exports, "__esModule", { value: true });
var stream_column_names_iterator_1 = require("../iterators/stream-column-names-iterator");
var StreamColumnNamesIterable = /** @class */ (function () {
    function StreamColumnNamesIterable(streamIterable) {
        this.streamIterable = streamIterable;
    }
    StreamColumnNamesIterable.prototype[Symbol.asyncIterator] = function () {
        return new stream_column_names_iterator_1.StreamColumnNamesIterator(this.streamIterable);
    };
    return StreamColumnNamesIterable;
}());
exports.StreamColumnNamesIterable = StreamColumnNamesIterable;
//# sourceMappingURL=stream-column-names-iterable.js.map