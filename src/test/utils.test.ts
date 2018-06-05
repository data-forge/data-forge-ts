import { assert, expect } from 'chai';
import 'mocha';
import { determineType } from '../lib/utils';
import * as moment from 'moment';

describe("utils", () => {

    it("can determine type of date", () => {
        expect(determineType(new Date())).to.eql("date");
    });

    it("can determine type of moment", () => {
        expect(determineType(moment())).to.eql("date");
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
    
});
