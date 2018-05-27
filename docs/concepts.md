# Key Concepts

This document explains the key concepts of *Data-Forge*.

## Series

A series is an indexed sequence of values and is implemented by the `Series` class. By default a series has an integer index starting at 0 and counting up (just like a JavaScript array). Series will often be used with a date-time index, something usually known as a [time series](https://en.wikipedia.org/wiki/Time_series).

All values in a series are generally expected to have the same type, although this is not specifically a requirement of Data-Forge.

A series can easily be constructed from a JavaScript array of data. It is also easily exported back to a JavaScript array. We can also extract a series from a column in a dataframe. Or plug a series into an existing dataframe to create a new column.

## DataFrame

A dataframe is really the *main* concept. It is implemented by the `DataFrame` class. 

A dataframe contains a sequence of rows. Each row is just a JavaScript object where each field contains the value for a column of data at that row. You might also think of it as a matrix (rows and columns) of structured data. You can also think of it as a spreadsheet in memory.

Although a dataframe ostensibly represents tabular data, it's actually pretty flexible and different rows can contain different data types and field values can contain deeply nested data.

A dataframe is composed of multiple series, where each series has a name and represents a column of tabular data.

A dataframe can be easily constructed from a JavaScript array containing data or parsed from CSV and JSON data formats. A dataframe can be exported back to a JavaScript array or serialized/stringified to CSV or JSON.

`DataFrame` and `Series` are very similar although not exactly the same. For example, because a dataframe has columns it therefore has functions such as `getSeries` for working with its columns. Series on the hand is specialised for working with a sequence of values and thus has functions that dataframe does not have, such as `average` which computes the average value of the series.

## Column

A column is a single *named* series of data contained within a dataframe. Each column is simply a series with a name, the values of the series are the values of the column. 

A column can be thought of a as a slice of data that cuts through all rows of the dataframe.

## Index 

An index is a sequence of values that is used to index a dataframe or series. When the data is a *time-series* the index is expected to contain *Date* values.
 
An index is used for operations that search and merge data-farmes and series. 

If not specified an integer index (starting at 0) is generated based on row position. An index can be explicitly by specifying a column by name, from a JavaScript array of data or generated on the fly from another column or series.

## Pair

Through the documentation and the code you will occasionally see a reference to a *pair* or *pairs*. Series and dataframes are actually sequences of *pairs*, where each pair contains a index and a value or row.  

## Lazy evaluation

Dataframe, series and index are only fully evaluated when necessary. Operations are queued up (like a *data-pipeline*) and only fully evaluated as needed and when required, for example when serializing to csv or json (eg `toCSV` or `toJSON`) or when baking to values (eg `toArray` or `toRows`). 

A dataframe, series or index can be forcibly evaluated and *baked* into memory by calling the `bake` function. 

## Iterable / Iterator

These are JavaScript concepts defined in ES6 and they are at the core of Data-Forge. To use Data-Forge you don't really need to know about these - but it's useful to understand them to understand the internals of Data-Forge and how lazy evaluation is implemented.

An iterator allows the rows of a dataframe, series or index to be iterated. Iterators allow lazy evaluation (row by row evaluation) of data frames, series and index. This is the same concept as an [enumerator in C#](https://msdn.microsoft.com/en-us/library/system.collections.ienumerator(v=vs.110).aspx), the concept that powers lazy evaluation in LINQ.

## Selector

A *selector* is a user-defined function (usually anonymous) that is passed to various Data-Forge functions to process or transform each value in the sequence. Selectors are also used to instruct Data-Forge on which part of the data to work with.

For example say you have a row that looks as follows:

	{
		Column1: "some data",
		Column2: 42,
	},

Here is an example a *selector* that identifies *Column2*:

	var mySelector = row => {
        return row.Column2;
    };

Selectors are usually applied to each row in the series or dataframe. 

Selectors are often also applied to the *index* (although we ignored this in the previous snippet).

An example of a selector that works with index rather than row: 

	var mySelector = (row, index) => {
		return index;
	};

## Predicate

A *predicate* function is similar to a *selector*, but returns a boolean value (technically you can return any value that can be considered *truthy* or *falsey*).

An example predicate function:

	var myPredicate = row => {
		return row.Column2 >= 42;	
	};

## Comparer

A *comparer* method is used to compare to values for equality. It returns true (or *truthy*) to indicate equality or false (or *falsey*) to indicate inequality. 

An example:

	var myComparer = (row1, row2) => {
		return row1.ClientName === row.ClientName; // Row comparison based on client name.
	}; 

## Generator

A generator is a function that produces zero or more values to be inserted into a Series or DataFrame.

A generator may take arguments and it can return an array of values or rows:

	var myGenerator = function (... appropriate arguments ...) {
		return [
			[ .. generated row 1 .. ],
			[ .. row 2 .. ],
			[ .. row 3 .. ],
			[ .. etc .. ]
		];	
	};

Alternatively (to support lazy evaluation) a generator may return a lazily evaluated *iterable*, that is a function that returns an iterator for a sequence of values or rows:

	var myGenerator = function (... appropriate arguments ...) {
		return function () {
			var myIterator = ... some iterator for a sequence of values or rows ...
			return myIterator;
		};
	};

## Group / Window

A series where each value in the series is itself another series or dataframe. Think of it as a sequence of groups or batches of data. This concept is used by the multiple Data-Forge functions that create groups and windows, for example `groupBy`, `window` and `rollingWindow`.

