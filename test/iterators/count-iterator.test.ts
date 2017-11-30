'use strict';

import { assert, expect } from 'chai';
import 'mocha';
import { CountIterator } from '../../lib/iterators/count-iterator';

describe('count iterator', function () {

	it('counter iterator generates an infinite sequence starting at zero', function () {

        var it = new CountIterator();
        expect(it.next()).to.eql({
            done: false,
            value: 0,
        });
        expect(it.next()).to.eql({
            done: false,
            value: 1,
        });
        expect(it.next()).to.eql({
            done: false,
            value: 2,
        });
	});
    

});