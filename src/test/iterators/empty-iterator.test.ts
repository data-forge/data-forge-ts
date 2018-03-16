'use strict';

import { assert, expect } from 'chai';
import 'mocha';
import { EmptyIterator } from '../../lib/iterators/empty-iterator';

describe('array iterator', function () {

	it('iterator for empty array', function () {

        var it = new EmptyIterator();
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
        expect(it.next().done).to.eql(true);
	});


});