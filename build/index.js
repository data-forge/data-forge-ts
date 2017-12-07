"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./lib/index");
exports.Index = index_1.Index;
var series_1 = require("./lib/series");
exports.Series = series_1.Series;
var dataframe_1 = require("./lib/dataframe");
exports.DataFrame = dataframe_1.DataFrame;
var dataframe_2 = require("./lib/dataframe");
var dr = new dataframe_2.DataFrame([
    {
        A: 1,
        B: 2,
    },
    {
        A: 10,
        B: 20,
    }
]);
console.log(dr.toString());
//# sourceMappingURL=index.js.map