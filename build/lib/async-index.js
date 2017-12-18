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
var async_series_1 = require("./async-series");
/**
 * Class that represents an index for a Series.
 */
var AsyncIndex = /** @class */ (function (_super) {
    __extends(AsyncIndex, _super);
    function AsyncIndex(config) {
        return _super.call(this, config) || this;
    }
    return AsyncIndex;
}(async_series_1.AsyncSeries));
exports.AsyncIndex = AsyncIndex;
//# sourceMappingURL=async-index.js.map