import { assert, expect } from 'chai';
import 'mocha';
import * as dataForge from '../index';

describe('csv async integration', () => {

	it('can read streaming CSV file', async function () {

        var data = await dataForge.readFileIncremental('./src/test/data/example-data.csv')
            .parseCSV()
            .toArray();
            
        expect(data).to.eql([
            {
                Date: '2013-01-02',
                CashPool: '20000',
                SharesValue: '0',
            },
            {
                Date: '2013-01-03',
                CashPool: '2121.303004999999',
                SharesValue: '17721.62596',
            },
            {
                Date: '2013-01-04',
                CashPool: '2121.303004999999',
                SharesValue: '17555.82369',
            },
        ]);
    });
    
});
