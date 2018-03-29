import { expect } from 'chai';
import * as dataForge from '../index';
import * as fs from 'fs';
import * as path from 'path';

//
// Examples implemented from this blog:
//
// http://pythonhow.com/accessing-dataframe-columns-rows-and-cells
//

describe('accessing columns, rows and cells', function () {

    this.timeout(4000);

    var df1: dataForge.IDataFrame<any, any>;
    var df2: dataForge.IDataFrame<any, any>;

    beforeEach(function () {

        var csv = fs.readFileSync(path.join(__dirname, 'accessing-columns-rows-and-cells.csv'), 'utf8');
        df1 = dataForge.fromCSV(csv)
            .parseInts(["2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", ])
            ;

        df2 = df1
            .setIndex("State")
            .dropSeries("State")
            ;
    })

    it('can load csv', function () {

        expect(df1.getColumnNames()).to.eql(["GEOID", "State", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", ]);
        expect(df1.getIndex().head(5).toArray()).to.eql([0, 1, 2, 3, 4]);        
        expect(df1.toRows()).to.eql([
            ["04000US01", "Alabama", 37150, 37952, 42212, 44476, 39980, 40933, 42590, 43464, 41381],            
            ["04000US02", "Alaska", 55891, 56418, 62993, 63989, 61604, 57848, 57431, 63648, 61137],         
            ["04000US04", "Arizona", 45245, 46657, 47215, 46914, 45739, 46896, 48621, 47044, 50602],
            ["04000US05", "Arkansas", 36658, 37057, 40795, 39586, 36538, 38587, 41302, 39018, 39919],
            ["04000US06", "California", 51755, 55319, 55734, 57014, 56134, 54283, 53367, 57020, 57528],
        ]);
    });

    it('can set index', function () {

        expect(df2.getColumnNames()).to.eql(["GEOID", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", ]);
        expect(df2.getIndex().toArray()).to.eql(["Alabama", "Alaska", "Arizona", "Arkansas", "California", ]);        
        expect(df2.toRows()).to.eql([
            ["04000US01", 37150, 37952, 42212, 44476, 39980, 40933, 42590, 43464, 41381],            
            ["04000US02", 55891, 56418, 62993, 63989, 61604, 57848, 57431, 63648, 61137],         
            ["04000US04", 45245, 46657, 47215, 46914, 45739, 46896, 48621, 47044, 50602],
            ["04000US05", 36658, 37057, 40795, 39586, 36538, 38587, 41302, 39018, 39919],
            ["04000US06", 51755, 55319, 55734, 57014, 56134, 54283, 53367, 57020, 57528],
        ]);
    });

    it('can take subset', function () {

        var subset = df2
            .subset(["2005", "2006", "2007"]) 
            .between("Alaska", "Arkansas")
            ;

        expect(subset.getColumnNames()).to.eql(["2005", "2006", "2007", ]);
        expect(subset.getIndex().toArray()).to.eql(["Alaska", "Arizona", "Arkansas", ]);        
        expect(subset.toRows()).to.eql([
            [55891, 56418, 62993],         
            [45245, 46657, 47215],
            [36658, 37057, 40795],
        ]);
    });

    it('can take column', function () {

        var series = df2.getSeries("2005");

        //todo: expect(series.getIndex().toArray()).to.eql(["Alabama", "Alaska", "Arizona", "Arkansas", "California"]);        
        expect(series.toArray()).to.eql([ 37150, 55891, 45245, 36658, 51755, ]);
    });

    it('can get single cell', function () {

        var value = df2.getSeries("2013").at("California");

        expect(value).to.eql(57528);
    });

    it('apply method to series', function () {

        var average = df2.getSeries("2005").average();

        expect(average).to.eql(45339.8);
    });
    
});