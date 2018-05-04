# Key Concepts

This document explains the key concepts of *Data-Forge*.

## Series

A series is an indexed sequence of values and is implemented by the `Series` class. By default a series has an integer index starting at 0 and counting up (just like arrays). Series will often be used with a date-time index, something usually known as a [time series](https://en.wikipedia.org/wiki/Time_series).

All values in a series are generally expected to have the same type, although this is not specifically a requirement of *data-forge-js*.

## DataFrame

A dataframe is the *main* concept and type of data structure in data-forge. It is implemented by the `DataFrame`. It is a sequence of rows. It can also be considered a matrix (rows and columns) of structured data. Think of it as a spreadsheet in memory.

A *data-frame* can be easily constructed from various formats and it can be exported to various formats.

`DataFrame` is actually a sub-class of `Series`, so it inherits all the functions of `Series`. 

## Value / row

A single piece of data in a sequence. 

For `DataFrame` a value is a JavaScript object, each field of which represents a column in the dataframe. 

For `Series` each value can be any valid JavaScript value. 

## Column

A column is a single *named* series of data in a data-frame. Each column is simply a series with a name, the values of the series are the values of the column. A column is a slice of data through all rows.

## Index 

An index sequence of values that is used to index a data-frame or series. When the data is a *time-series* the index is expected to contain *Date* values.
 
Used for operations that search and merge data-farmes and series. 

If not specified an integer index (starting at 0) is generated based on row position. An index can be explicitly by specifying a column by name.

## Pair

Through this documentation and the Data-Forge code you will occasionally see a reference to a *pair* or *pairs*. Series and DataFrames are actually sequences of *pairs*, where each pair contains a index and a value or row.  

## Lazy Evaluation

Data-frames, series and index are only fully evaluated when necessary. Operations are queued up and only fully evaluated as needed and when required, for example when serializing to csv or json (`toCSV` or `toJSON`) or when baking to values (`toArray` or `toRows`). 

A data-frame, series or index can be forcibly evaluated by calling the `bake` function. 

## Iterator

Iterates the rows of a data-frame, series or index. Iterators allow lazy evaluation (row by row evaluation) of data frames, series and index. This is the same concept as an [iterator in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators) or an [enumerator in C#](https://msdn.microsoft.com/en-us/library/system.collections.ienumerator(v=vs.110).aspx).

The specification for an iterator is simple:

	var anIterator = {

		moveNext: function () {
			// Move to the next element in the sequence.
			// Return true if the sequence contains more elements.
			// Return false when the sequence is exhausted.
		},

		getCurrent: function () {
			// Return the current element in the sequence. 
		},

	};

## Iterable

An *iterable* is an anonymous function that instantiates and returns an *iterator*. A iterable conceptually represents *a sequence that can be iterated*.

An example iterable:

	var myIterable = function () {
		var myIterator = ... create an iterator for the sequence ...
		return myIterator;
	};


## Selector

A *selector* is a user-defined function (usually anonymous) that is passed to Data-Forge functions to process or transform each value in the sequence. Selectors are also used to instruct Data-Forge on which part of the data to work with.

For example say you have a row that looks as follows:

	{
		Column1: "some data",
		Column2: 42,
	},

Here is an example a *selector* that identifies *Column2*:

	var mySelector = function (row) {
		return row.Column2;
	};

Selectors are usually passed each row in the Data-Frame or each value in the Series. 

Selectors are usually also passed the *index* for the value (although you can ignore this as demonstrated in the previous snippet).

An example of a selector that works with index rather than row: 

	var mySelector = function (row, index) {
		return index;
	};

## Predicate

A *predicate* function is similar to a *selector*, but returns a boolean value (technically you can return any value that can be considered *truthy* or *falsey*).

An example predicate function:

	var myPredicate = function (row) {
		return row.Column2 >= 42;	
	};

Predicates can also take the index: 

	var myPredicate = function (row, index) {
		return index > 20;
	};

## Comparer

A *comparer* method is used to compare to values for equality. It returns true (or *truthy*) to indicate equality or false (or *falsey*) to indicate inequality. 

An example:

	var myComparer = function (row1, row2) {
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

A Series where each value in the series is itself another Series or DataFrame. Think of it as a sequence of groups. This concept is used by the multiple Data-Forge functions that create groups and windows, for example `groupBy`, `window` and `rollingWindow`.

