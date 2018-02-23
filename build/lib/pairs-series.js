"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var series_1 = require("./series");
/**
 * Class that represents a series of index/value pairs.
 */
var PairsSeries = /** @class */ (function (_super) {
    __extends(PairsSeries, _super);
    function PairsSeries(pairs) {
        return _super.call(this, {
            values: pairs,
        }) || this;
    }
    return PairsSeries;
}(series_1.Series));
exports.PairsSeries = PairsSeries;
//# sourceMappingURL=pairs-series.js.map