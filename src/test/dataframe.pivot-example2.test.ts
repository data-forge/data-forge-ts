import { assert, expect } from 'chai';
import 'mocha';
import { Index } from '../lib/index';
import { DataFrame } from '../lib/dataframe';
import { ArrayIterable } from '../lib/iterables/array-iterable';
import { Series } from '../lib/series';

//
// Replicate the following pandas examples:
//
// http://pbpython.com/pandas-pivot-table-explained.html
//

describe('DataFrame pivot examples 2', () => {

    var df: DataFrame<number, any>;

    beforeEach(() => {
        df = new DataFrame({
            columnNames: 
                ["Account", "Name",                         "Rep",              "Manager",          "Product", "Quantity", "Price", "Status"],
            rows: [
                [ 714466,   "Trantow-Barrows",              "Craig Booker",     "Debra Henley",     "CPU", 1,30000, "presented" ],
            [ 714466,   "Trantow-Barrows",                  "Craig Booker",     "Debra Henley",     "Software", 1,10000, "presented" ],
                [ 714466,   "Trantow-Barrows",              "Craig Booker",     "Debra Henley",     "Maintenance", 2,5000, "pending" ],
                [ 737550,   "Fritsch, Russel and Anderson", "Craig Booker",     "Debra Henley",     "CPU", 1,35000, "declined" ],
                [ 146832,   "Kiehn-Spinka",                 "Daniel Hilton",    "Debra Henley",     "CPU",2,65000, "won" ],
                [ 218895,   "Kulas Inc",                    "Daniel Hilton",    "Debra Henley",     "CPU",2,40000, "pending" ],
                [ 218895,   "Kulas Inc",                    "Daniel Hilton",    "Debra Henley",     "Software",1,10000, "presented" ],
                [ 412290,   "Jerde-Hilpert",                "John Smith",       "Debra Henley",     "Maintenance",2,5000, "pending" ],
                [ 740150,   "Barton LLC",                   "John Smith",       "Debra Henley",     "CPU",1,35000, "declined" ],
                [ 141962,   "Herman LLC",                   "Cedric Moss",      "Fred Anderson",    "CPU",2,65000, "won" ],
                [ 163416,   "Purdy-Kunde",                  "Cedric Moss",      "Fred Anderson",    "CPU",1,30000, "presented" ],
                [ 239344,   "Stokes LLC",                   "Cedric Moss",      "Fred Anderson",    "Maintenance",1,5000, "pending" ],
                [ 239344,   "Stokes LLC",                   "Cedric Moss",      "Fred Anderson",    "Software",1,10000, "presented" ],
                [ 307599,   "Kassulke, Ondricka and Metz",  "Wendy Yule",       "Fred Anderson",    "Maintenance", 3,7000, "won" ],
                [ 688981,   "Keeling LLC",                  "Wendy Yule",       "Fred Anderson",    "CPU",5,100000, "won" ],
                [ 729833,   "Koepp Ltd",                    "Wendy Yule",       "Fred Anderson",    "CPU",2,65000, "declined" ],
                [ 729833,   "Koepp Ltd",                    "Wendy Yule",       "Fred Anderson",     "Monitor",2,5000, "presented" ],                                
            ]
        });
    })

    //
    // Pandas example:
    // 
    // pd.pivot_table(df,index=["Name"])
    //
	it('Can pivot on Name column and sum values', () => {

       const pivotted =  df.pivot("Name", {
                Account: values => values.sum(),
                Price: values => values.sum(),
                Quantity: values => values.sum(),
            });
            
        expect(pivotted.getColumnNames()).to.eql(["Name", "Account", "Price", "Quantity"]);
        expect(pivotted.toArray()).to.eql([
            {
                "Name": "Barton LLC",
                "Account": 740150,
                "Price": 35000,
                "Quantity": 1
            },
            {
                "Name": "Fritsch, Russel and Anderson",
                "Account": 737550,
                "Price": 35000,
                "Quantity": 1
            },
            {
                "Name": "Herman LLC",
                "Account": 141962,
                "Price": 65000,
                "Quantity": 2
            },
            {
                "Name": "Jerde-Hilpert",
                "Account": 412290,
                "Price": 5000,
                "Quantity": 2
            },
            {
                "Name": "Kassulke, Ondricka and Metz",
                "Account": 307599,
                "Price": 7000,
                "Quantity": 3
            },
            {
                "Name": "Keeling LLC",
                "Account": 688981,
                "Price": 100000,
                "Quantity": 5
            },
            {
                "Name": "Kiehn-Spinka",
                "Account": 146832,
                "Price": 65000,
                "Quantity": 2
            },
            {
                "Name": "Koepp Ltd",
                "Account": 1459666,
                "Price": 70000,
                "Quantity": 4
            },
            {
                "Name": "Kulas Inc",
                "Account": 437790,
                "Price": 50000,
                "Quantity": 3
            },
            {
                "Name": "Purdy-Kunde",
                "Account": 163416,
                "Price": 30000,
                "Quantity": 1
            },
            {
                "Name": "Stokes LLC",
                "Account": 478688,
                "Price": 15000,
                "Quantity": 2
            },
            {
                "Name": "Trantow-Barrows",
                "Account": 2143398,
                "Price": 45000,
                "Quantity": 4
            }
        ]);
	});

    //
    // Pandas example:
    //
    // pd.pivot_table(df,index=["Name","Rep","Manager"])
    //
	it('Can pivot on multiple columns and sum values', () => {

        const pivotted =  df.pivot(["Name","Rep","Manager"], {
                Account: values => values.sum(),
                Price: values => values.sum(),
                Quantity: values => values.sum(),
            });
                
        expect(pivotted.getColumnNames()).to.eql(["Name", "Rep", "Manager", "Account", "Price", "Quantity"]);
        expect(pivotted.toArray()).to.eql([
            {
                "Name": "Barton LLC",
                "Rep": "John Smith",
                "Manager": "Debra Henley",
                "Account": 740150,
                "Price": 35000,
                "Quantity": 1
            },
            {
                "Name": "Fritsch, Russel and Anderson",
                "Rep": "Craig Booker",
                "Manager": "Debra Henley",
                "Account": 737550,
                "Price": 35000,
                "Quantity": 1
            },
            {
                "Name": "Herman LLC",
                "Rep": "Cedric Moss",
                "Manager": "Fred Anderson",
                "Account": 141962,
                "Price": 65000,
                "Quantity": 2
            },
            {
                "Name": "Jerde-Hilpert",
                "Rep": "John Smith",
                "Manager": "Debra Henley",
                "Account": 412290,
                "Price": 5000,
                "Quantity": 2
            },
            {
                "Name": "Kassulke, Ondricka and Metz",
                "Rep": "Wendy Yule",
                "Manager": "Fred Anderson",
                "Account": 307599,
                "Price": 7000,
                "Quantity": 3
            },
            {
                "Name": "Keeling LLC",
                "Rep": "Wendy Yule",
                "Manager": "Fred Anderson",
                "Account": 688981,
                "Price": 100000,
                "Quantity": 5
            },
            {
                "Name": "Kiehn-Spinka",
                "Rep": "Daniel Hilton",
                "Manager": "Debra Henley",
                "Account": 146832,
                "Price": 65000,
                "Quantity": 2
            },
            {
                "Name": "Koepp Ltd",
                "Rep": "Wendy Yule",
                "Manager": "Fred Anderson",
                "Account": 1459666,
                "Price": 70000,
                "Quantity": 4
            },
            {
                "Name": "Kulas Inc",
                "Rep": "Daniel Hilton",
                "Manager": "Debra Henley",
                "Account": 437790,
                "Price": 50000,
                "Quantity": 3
            },
            {
                "Name": "Purdy-Kunde",
                "Rep": "Cedric Moss",
                "Manager": "Fred Anderson",
                "Account": 163416,
                "Price": 30000,
                "Quantity": 1
            },
            {
                "Name": "Stokes LLC",
                "Rep": "Cedric Moss",
                "Manager": "Fred Anderson",
                "Account": 478688,
                "Price": 15000,
                "Quantity": 2
            },
            {
                "Name": "Trantow-Barrows",
                "Rep": "Craig Booker",
                "Manager": "Debra Henley",
                "Account": 2143398,
                "Price": 45000,
                "Quantity": 4
            }
        ]);
	});

    //
    // Pandas example:
    //
    // pd.pivot_table(df,index=["Manager","Rep"])
    //
    it('Can pivot on multiple columns and sum values 2', () => {

        const pivotted =  df.pivot([ "Manager", "Rep" ], {
            Account: values => values.sum(),
            Price: values => values.sum(),
            Quantity: values => values.sum(),
        });

        expect(pivotted.getColumnNames()).to.eql([ "Manager", "Rep", "Account", "Price", "Quantity" ]);
        expect(pivotted.toArray()).to.eql([
            {
                "Manager": "Debra Henley",
                "Rep": "Craig Booker",
                "Account": 2880948,
                "Price": 80000,
                "Quantity": 5
            },
            {
                "Manager": "Debra Henley",
                "Rep": "Daniel Hilton",
                "Account": 584622,
                "Price": 115000,
                "Quantity": 5
            },
            {
                "Manager": "Debra Henley",
                "Rep": "John Smith",
                "Account": 1152440,
                "Price": 40000,
                "Quantity": 3
            },
            {
                "Manager": "Fred Anderson",
                "Rep": "Cedric Moss",
                "Account": 784066,
                "Price": 110000,
                "Quantity": 5
            },
            {
                "Manager": "Fred Anderson",
                "Rep": "Wendy Yule",
                "Account": 2456246,
                "Price": 177000,
                "Quantity": 12
            }
        ]);
    });

    // 
    // Pandas example:
    //
    // pd.pivot_table(df,index=["Manager","Rep"],values=["Price"])
    //
    it('Can pivot on multiple columns and avg price', () => {

        const pivotted =  df.pivot([ "Manager", "Rep" ], {
            Price: values => values.mean(),
        });

        expect(pivotted.getColumnNames()).to.eql([ "Manager", "Rep", "Price" ]);
        expect(pivotted.toArray()).to.eql([
            {
                "Manager": "Debra Henley",
                "Rep": "Craig Booker",
                "Price": 20000,
            },
            {
                "Manager": "Debra Henley",
                "Rep": "Daniel Hilton",
                "Price": 38333.333333333336,
            },
            {
                "Manager": "Debra Henley",
                "Rep": "John Smith",
                "Price": 20000,
            },
            {
                "Manager": "Fred Anderson",
                "Rep": "Cedric Moss",
                "Price": 27500,
            },
            {
                "Manager": "Fred Anderson",
                "Rep": "Wendy Yule",
                "Price": 44250,
            }
        ]);
    });

    // 
    // Pandas example:
    //
    // pd.pivot_table(df,index=["Manager","Rep"],values=["Price"],aggfunc=np.sum)
    //
    it('Can pivot on multiple columns and sum price', () => {

        const pivotted =  df.pivot([ "Manager", "Rep" ], {
            Price: values => values.sum(),
        });

        expect(pivotted.getColumnNames()).to.eql([ "Manager", "Rep", "Price" ]);
        expect(pivotted.toArray()).to.eql([
            {
                "Manager": "Debra Henley",
                "Rep": "Craig Booker",
                "Price": 80000,
            },
            {
                "Manager": "Debra Henley",
                "Rep": "Daniel Hilton",
                "Price": 115000,
            },
            {
                "Manager": "Debra Henley",
                "Rep": "John Smith",
                "Price": 40000,
            },
            {
                "Manager": "Fred Anderson",
                "Rep": "Cedric Moss",
                "Price": 110000,
            },
            {
                "Manager": "Fred Anderson",
                "Rep": "Wendy Yule",
                "Price": 177000,
            }
        ]);
    });

    // 
    // Pandas example:
    //
    // pd.pivot_table(df,index=["Manager","Rep"],values=["Price"],aggfunc=[np.mean,len])
    //
    it('Can pivot on multiple columns and aggregate multiple times over same colmmn', () => {

        const pivotted =  df.pivot([ "Manager", "Rep" ], {
            Price: {
                Price_Average: values => values.mean(),
                Price_Count: values => values.count(),
            },
        });

        expect(pivotted.getColumnNames()).to.eql([ "Manager", "Rep", "Price_Average", "Price_Count" ]);
        expect(pivotted.toArray()).to.eql([
            {
                "Manager": "Debra Henley",
                "Rep": "Craig Booker",
                "Price_Average": 20000,
                "Price_Count": 4
            },
            {
                "Manager": "Debra Henley",
                "Rep": "Daniel Hilton",
                "Price_Average": 38333.333333333336,
                "Price_Count": 3
            },
            {
                "Manager": "Debra Henley",
                "Rep": "John Smith",
                "Price_Average": 20000,
                "Price_Count": 2
            },
            {
                "Manager": "Fred Anderson",
                "Rep": "Cedric Moss",
                "Price_Average": 27500,
                "Price_Count": 4
            },
            {
                "Manager": "Fred Anderson",
                "Rep": "Wendy Yule",
                "Price_Average": 44250,
                "Price_Count": 4
            }
        ]);
    });
});	

