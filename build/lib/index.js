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
var Sugar = require("sugar");
var moment = require("moment");
/**
 * Class that represents an index for a Series.
 */
var Index = /** @class */ (function (_super) {
    __extends(Index, _super);
    function Index(config) {
        return _super.call(this, config) || this;
    }
    /**
     * Get the type of the index.
     *
     * @returns Returns a string that specifies the type of the index.
     */
    Index.prototype.getType = function () {
        if (!this._type) {
            //
            // Detect the type.
            //
            if (this.any()) {
                var firstValue = this.first();
                if (Sugar.Object.isNumber(firstValue)) {
                    this._type = 'number';
                }
                else if (Sugar.Object.isString(firstValue)) {
                    this._type = 'string';
                }
                else if (firstValue instanceof Date) {
                    this._type = 'date';
                }
                else {
                    this._type = 'unsupported';
                }
            }
            else {
                this._type = 'empty';
            }
        }
        return this._type;
    };
    ;
    /**
     * Get the less than operation for the index.
     *
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    Index.prototype.getLessThan = function () {
        switch (this.getType()) {
            case "date":
                return function (d1, d2) { return moment(d1).isBefore(d2); };
            case "string":
            case "number":
                return function (v1, v2) { return v1 < v2; };
            case "empty":
                return function () { return true; }; // Series is empty, so this makes no difference.
            default:
                throw new Error("No less than operation available for type: " + this.getType());
        }
    };
    ;
    /**
     * Get the less than or equal to operation for the index.
     *
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    Index.prototype.getLessThanOrEqualTo = function () {
        var _this = this;
        return function (v1, v2) { return !_this.getGreaterThan()(v1, v2); }; //TODO: Should expand  this out.
    };
    /**
     * Get the greater than operation for the index.
     *
     * @returns Returns a function that can be used to compare a value against an index value.
     */
    Index.prototype.getGreaterThan = function () {
        switch (this.getType()) {
            case "date":
                return function (d1, d2) { return moment(d1).isAfter(d2); };
            case "string":
            case "number":
                return function (v1, v2) { return v1 > v2; };
            case "empty":
                return function () { return true; }; // Series is empty, so this makes no difference.
            default:
                throw new Error("No greater than operation available for type: " + this.getType());
        }
    };
    ;
    return Index;
}(series_1.Series));
exports.Index = Index;
//# sourceMappingURL=index.js.map