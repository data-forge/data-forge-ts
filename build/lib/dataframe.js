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
var DataFrame = /** @class */ (function (_super) {
    __extends(DataFrame, _super);
    function DataFrame() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DataFrame;
}(series_1.Series));
exports.DataFrame = DataFrame;
//# sourceMappingURL=dataframe.js.map