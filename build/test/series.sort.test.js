"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dataForge = require("../index");
var chai_1 = require("chai");
require("mocha");
/*
import { Index } from '../lib/index';
import { Series } from '../lib/series';
import { DataFrame } from '../lib/dataframe';
*/
var Series = dataForge.Series;
describe('Series sort', function () {
    it('can sort nested objects using selector - ascending', function () {
        var series = new Series({
            index: [0, 1, 2, 3],
            values: [
                {
                    i: 1,
                    v: 300,
                },
                {
                    i: 2,
                    v: 100,
                },
                {
                    i: 0,
                    v: 100,
                },
                {
                    i: 3,
                    v: 5
                }
            ]
        });
        var sorted = series
            .orderBy(function (row) { return row.v; })
            .thenBy(function (row) { return row.i; });
        chai_1.expect(sorted.getIndex().toArray()).to.eql([3, 2, 1, 0]);
        chai_1.expect(sorted.toArray()).to.eql([
            {
                i: 3,
                v: 5
            },
            {
                i: 0,
                v: 100,
            },
            {
                i: 2,
                v: 100,
            },
            {
                i: 1,
                v: 300,
            },
        ]);
    });
    it('can sort nested objects using selector - descending', function () {
        var series = new Series({
            index: [0, 1, 2, 3],
            values: [
                {
                    i: 1,
                    v: 300,
                },
                {
                    i: 2,
                    v: 100,
                },
                {
                    i: 0,
                    v: 100,
                },
                {
                    i: 3,
                    v: 5
                }
            ]
        });
        var sorted = series
            .orderByDescending(function (row) { return row.v; })
            .thenByDescending(function (row) { return row.i; });
        chai_1.expect(sorted.getIndex().toArray()).to.eql([0, 1, 2, 3]);
        chai_1.expect(sorted.toArray()).to.eql([
            {
                i: 1,
                v: 300,
            },
            {
                i: 2,
                v: 100,
            },
            {
                i: 0,
                v: 100,
            },
            {
                i: 3,
                v: 5
            },
        ]);
    });
});
//# sourceMappingURL=series.sort.test.js.map