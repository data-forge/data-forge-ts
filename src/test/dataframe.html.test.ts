import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';

describe('DataFrame html', () => {

	it('can convert data frame to html', function () {

        var dataFrame = new DataFrame([
                {
                    Col1: 1,
                    Col2: 2,
                },
                {
                    Col1: 3,
                    Col2: 4,
                },
            ]);

        var html = dataFrame.toHTML();
        
        expect(html).to.eql(
            '<table border="1" class="dataframe">\n' +
            '    <thead>\n' +
            '        <tr style="text-align: right;">\n' +
            '            <th></th>\n' +
            '            <th>Col1</th>\n' +
            '            <th>Col2</th>\n' +
            '       </tr>\n' +
            '    </thead>\n' +
            '    <tbody>\n' +
            '        <tr>\n' +
            '            <th>0</th>\n' +
            '            <td>1</td>\n' +
            '            <td>2</td>\n' +
            '        </tr>\n' +
            '        <tr>\n' +
            '            <th>1</th>\n' +
            '            <td>3</td>\n' +
            '            <td>4</td>\n' +
            '        </tr>\n' +
            '    </tbody>\n' +
            '</table>'
        );	
	});

});