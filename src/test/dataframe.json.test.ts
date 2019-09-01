import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('DataFrame json', () => {

	it('can save empty data frame to json', function () {

		var df = new DataFrame();
		expect(df.toJSON()).to.eql("[]");
	});

	it('can save data frame to json', function () {

        var df = new DataFrame([
            {
                Column1: 'A',
                Column2: 1,
            },
            {
                Column1: 'B',
                Column2: 2,
            },
        ]);

		expect(df.toJSON()).to.eql(
			'[\n' +
			'    {\n' +
			'        "Column1": "A",\n' +
			'        "Column2": 1\n' +
			'    },\n' +
			'    {\n' +
			'        "Column1": "B",\n' +
			'        "Column2": 2\n' +
			'    }\n' +
			']'
		);
    });	
     
});

describe('DataFrame json5', () => {

	it('can save empty data frame to json5', function () {

		var df = new DataFrame();
		expect(df.toJSON5()).to.eql("[]");
	});

	it('can save data frame to json5', function () {

        var df = new DataFrame([
            {
                Column1: 'A',
                Column2: 1,
            },
            {
                Column1: 'B',
                Column2: 2,
            },
        ]);

		expect(df.toJSON5()).to.eql(
			'[\n' +
			'    {\n' +
			'        Column1: \'A\',\n' +
			'        Column2: 1,\n' +
			'    },\n' +
			'    {\n' +
			'        Column1: \'B\',\n' +
			'        Column2: 2,\n' +
			'    },\n' +
			']'
		);
    });	
     
});