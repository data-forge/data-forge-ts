"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dataForge = require("../index");
var chai_1 = require("chai");
require("mocha");
var moment = require("moment");
var Series = dataForge.Series;
describe('Series parse', function () {
    it('can parse string series to int', function () {
        var series = new Series({ index: [10, 5, 2], values: ['1', '100', '5'] });
        var parsed = series.parseInts();
        chai_1.expect(parsed.getIndex().toArray()).to.eql([10, 5, 2]);
        chai_1.expect(parsed.toArray()).to.eql([1, 100, 5]);
    });
    it('can parse string series to int - with empty string', function () {
        var series = new Series({ index: [10], values: [''] });
        var parsed = series.parseInts();
        chai_1.expect(parsed.getIndex().toArray()).to.eql([10]);
        chai_1.expect(parsed.toArray()).to.eql([]);
    });
    it('can parse string series to int - with undefined', function () {
        var series = new Series({ index: [10], values: [undefined] });
        var parsed = series.parseInts();
        chai_1.expect(parsed.getIndex().toArray()).to.eql([10]);
        chai_1.expect(parsed.toArray()).to.eql([]);
    });
    it('can parse string series to int - throws when source value is not a string', function () {
        var series = new Series({ index: [10], values: [5] });
        var parsed = series.parseInts();
        chai_1.expect(function () {
            parsed.toArray();
        }).to.throw();
    });
    it('can parse string series to float', function () {
        var series = new Series({ index: [10, 5, 2], values: ['1', '100.2020', '5.5'] });
        var parsed = series.parseFloats();
        chai_1.expect(parsed.getIndex().toArray()).to.eql([10, 5, 2]);
        chai_1.expect(parsed.toArray()).to.eql([1, 100.2020, 5.5]);
    });
    it('can parse string series to float - with empty string', function () {
        var series = new Series({ index: [10], values: [''] });
        var parsed = series.parseFloats();
        chai_1.expect(parsed.getIndex().toArray()).to.eql([10]);
        chai_1.expect(parsed.toArray()).to.eql([]);
    });
    it('can parse string series to float - with undefined', function () {
        var series = new Series({ index: [10], values: [undefined] });
        var parsed = series.parseFloats();
        chai_1.expect(parsed.getIndex().toArray()).to.eql([10]);
        chai_1.expect(parsed.toArray()).to.eql([]);
    });
    it('can parse string series to float - throws when source value is not a string', function () {
        var series = new Series({ index: [10], values: [5] });
        var parsed = series.parseFloats();
        chai_1.expect(function () {
            parsed.toArray();
        }).to.throw();
    });
    it('can parse string series to date', function () {
        var series = new Series({ index: [10, 5], values: ['1975-2-24', '2015-2-24'] });
        var parsed = series.parseDates();
        chai_1.expect(parsed.getIndex().toArray()).to.eql([10, 5]);
        chai_1.expect(parsed.toArray()).to.eql([new Date(1975, 1, 24), new Date(2015, 1, 24)]); // Note months are 0-based here.
    });
    it('can parse string series to date - with empty string', function () {
        var series = new Series({ index: [10], values: [''] });
        var parsed = series.parseDates();
        chai_1.expect(parsed.getIndex().toArray()).to.eql([10]);
        chai_1.expect(parsed.toArray()).to.eql([]);
    });
    it('can parse string series to date - with undefined', function () {
        var series = new Series({ index: [10], values: [undefined] });
        var parsed = series.parseDates();
        chai_1.expect(parsed.getIndex().toArray()).to.eql([10]);
        chai_1.expect(parsed.toArray()).to.eql([]);
    });
    it('can parse string series to date - throws when source value is not a string', function () {
        var series = new Series({ index: [10], values: [5] });
        var parsed = series.parseDates();
        chai_1.expect(function () {
            parsed.toArray();
        }).to.throw();
    });
    it('can parse string series to date - with format string', function () {
        var series = new Series({ index: [10, 5], values: ['24-02-75', '24-02-15'] });
        var parsed = series.parseDates('DD-MM-YY');
        chai_1.expect(parsed.getIndex().toArray()).to.eql([10, 5]);
        chai_1.expect(parsed.toArray()).to.eql([new Date(1975, 1, 24), new Date(2015, 1, 24)]); // Note months are 0-based here.
    });
    it('can parse values to strings', function () {
        var series = new Series({ index: [1, 2, 3, 4, 5, 6], values: [1, null, undefined, "foo", 5.5, new Date(2015, 1, 1)] });
        var converted = series.toStrings();
        chai_1.expect(converted.getIndex().toArray()).to.eql([1, 2, 3, 4, 5, 6]);
        chai_1.expect(converted.toArray()).to.eql([
            '1',
            null,
            "foo",
            '5.5',
            'Sun Feb 01 2015 00:00:00 GMT+1000 (E. Australia Standard Time)'
        ]);
    });
    it('can specify format string for date series', function () {
        var series = new Series({ index: [1], values: [new Date(2015, 1, 3)] });
        var converted = series.toStrings('YYYY-DD-MM');
        chai_1.expect(converted.getIndex().toArray()).to.eql([1]);
        chai_1.expect(converted.toArray()).to.eql([
            '2015-03-02',
        ]);
    });
    it('can specify format string for date series - with moment', function () {
        var series = new Series({ index: [1], values: [moment(new Date(2015, 1, 3))] });
        var converted = series.toStrings('YYYY-DD-MM');
        chai_1.expect(converted.getIndex().toArray()).to.eql([1]);
        chai_1.expect(converted.toArray()).to.eql([
            '2015-03-02',
        ]);
    });
});
//# sourceMappingURL=series.parse.test.js.map