import { assert, expect } from 'chai';
import 'mocha';
import { determineType, isObject, isNumber, isString, isDate, isBoolean, isUndefined, isFunction } from '../lib/utils';
// @ts-ignore
import moment from "dayjs";

describe("utils", () => {

    it("can determine type of date", () => {
        expect(determineType(new Date())).to.eql("date");
    });

    it("can determine type of string", () => {
        expect(determineType("string")).to.eql("string");
    });

    it("can determine type of boolean", () => {
        expect(determineType(true)).to.eql("boolean");
    });

    it("can determine type of number", () => {
        expect(determineType(12.34)).to.eql("number");
    });

    it("can detect object", () => {
        expect(isObject({})).to.eql(true);
    });

    it("a number is not an object", () => {
        expect(isObject(5)).to.eql(false);        
    });

    it("a string is not an object", () => {
        expect(isObject("hello")).to.eql(false);
    });

    it("a date is not a object", () => {
        expect(isObject(new Date())).to.eql(false);
    });

    it("a array is not a object", () => {
        expect(isObject([])).to.eql(false);
    });

    it("a function is not a object", () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        expect(isObject(() => {})).to.eql(false);
    });
    
    it("can detect number", () => {
        expect(isNumber(5)).to.eql(true);
    });

    it("can detect string", () => {
        expect(isString("hello")).to.eql(true);
    });

    it("can detect date", () => {
        expect(isDate(new Date())).to.eql(true);
    });

    it("can detect boolean", () => {
        expect(isBoolean(true)).to.eql(true);
        expect(isBoolean(false)).to.eql(true);
    });
    
    it("can detect undefined", () => {
        expect(isUndefined(undefined)).to.eql(true);
        expect(isUndefined(null)).to.eql(false);
        expect(isUndefined(0)).to.eql(false);
    });

    it("can detect function", () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        expect(isFunction(() => {})).to.eql(true);
    });
});
