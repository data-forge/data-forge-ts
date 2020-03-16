import { ArrayIterable }  from './iterables/array-iterable';
import { EmptyIterable }  from './iterables/empty-iterable';
import { CountIterable }  from './iterables/count-iterable';
import { MultiIterable }  from './iterables/multi-iterable';
import { SelectIterable }  from './iterables/select-iterable';
import { SelectManyIterable }  from './iterables/select-many-iterable';
import { TakeIterable }  from './iterables/take-iterable';
import { TakeWhileIterable }  from './iterables/take-while-iterable';
import { WhereIterable }  from './iterables/where-iterable';
import { ConcatIterable }  from './iterables/concat-iterable';
import { DataFrameWindowIterable }  from './iterables/dataframe-window-iterable';
import { ReverseIterable }  from './iterables/reverse-iterable';
import { ZipIterable }  from './iterables/zip-iterable';
import { CsvRowsIterable }  from './iterables/csv-rows-iterable';
import { DistinctIterable }  from './iterables/distinct-iterable';
import { DataFrameRollingWindowIterable }  from './iterables/dataframe-rolling-window-iterable';
import { DataFrameVariableWindowIterable }  from './iterables/dataframe-variable-window-iterable';
import { OrderedIterable, Direction, ISortSpec, SelectorFn as SortSelectorFn }  from './iterables/ordered-iterable';
import { IIndex, Index } from './index';
import { ExtractElementIterable } from './iterables/extract-element-iterable';
import { SkipIterable } from './iterables/skip-iterable';
import { SkipWhileIterable } from './iterables/skip-while-iterable';
// @ts-ignore
import Table from 'easy-table';
// @ts-ignore
import moment from "dayjs";
import { ISeries, Series, SelectorWithIndexFn, PredicateFn, ComparerFn, SelectorFn, AggregateFn, Zip2Fn, Zip3Fn, Zip4Fn, Zip5Fn, ZipNFn, CallbackFn, JoinFn, GapFillFn, ISeriesConfig } from './series';
import { ColumnNamesIterable } from './iterables/column-names-iterable';
import { toMap, makeDistinct, mapIterable, determineType, toMap2, isArray, isString, isFunction, isObject, isUndefined, isNumber } from './utils';
import { ISerializedDataFrame } from "@data-forge/serialization";
import JSON5 from 'json5';

// @ts-ignore
import PapaParse from 'papaparse';

/** 
 * An object whose fields specify the data for named columns.
 */
export interface IColumnSpec {
    [index: string]: Iterable<any> | ISeries<any, any>,
}

/**
 * Specifes the format per column when converting columns to strings.
 */
export interface IFormatSpec {
    [index: string]: string;
}

/**
 * An function that aggregates a series.
 */
export type SeriesAggregatorFn<IndexT, ValueT, OutputT> = (values: ISeries<IndexT, ValueT>) => OutputT;

/**
 * Specification that can produce multiple output columns from a single input column of a dataframe.
 */
export interface IColumnAggregatorSpec {
    [outputColumnName: string]: SeriesAggregatorFn<any, any, any>,
} 

/**
 * Specification that can aggregate multiple input columns in a dataframe to produce multiple output columns.
 */
export interface IMultiColumnAggregatorSpec {
    [inputColumnName: string]: SeriesAggregatorFn<any, any, any> | IColumnAggregatorSpec;
}

/**
 * Defines the configuration for a new column.
 */
export interface IColumnConfig {
    /**
     * The name of the new column.
     */
    name: string;

    /**
     * The series of values for the column.
     */
    series: Iterable<any> | ISeries<any, any>;
}

/**
 * Options for CSV output.
 */
export interface ICSVOutputOptions {
    /**
     * Enable or disable output of the CSV header line.
     * Defaults to true.
     */
    header?: boolean;
}

/**
 * Used to configure a dataframe.
 */
export interface IDataFrameConfig<IndexT, ValueT> {
    /**
     * Values to put in the dataframe.
     * This should be array or iterable of JavaScript objects.
     * Each element in the array contains fields that match the columns of the dataframe.
     */
    values?: Iterable<ValueT>,

    /**
     * CSV style rows to put in the dataframe.
     * An array of arrays. Each element in the top level array is a row of data.
     * Each row of data contains field values in column order.
     */
    rows?: Iterable<any[]>,

    /***
     * The index for the dataframe.
     * If omitted the index will default to a 0-based index.
     */
    index?: Iterable<IndexT>,

    /**
     * Array or iterable of index,value pairs to put in the dataframe.
     * If index and values are not separately specified they can be extracted
     * from the pairs.
     */
    pairs?: Iterable<[IndexT, ValueT]>,

    /**
     * Array or iterable of column names that are in the dataframe.
     * The order matters. This arrays specifies the ordering of columns which
     * is important when rendering tables or writing out CSV data files.
     * If this is omitted column names will automatically be determined
     * from the fields of the first row/value in the dataframe.
     */
    columnNames?: Iterable<string>,

    /***
     * Set to true when the dataframe has been baked into memory
     * and does not need to be lazily evaluated.
     */
    baked?: boolean,

    /**
     * Set to true to consider all rows/values in the dataframe when
     * determining the column names. Otherwise only the first row is considered.
     * You should use this if you have ireggular fields in the objects that
     * make up the rows/values of the dataframe.
     */
    considerAllRows?: boolean,

    /**
     * Explicitly specify data for named columns to put in the dataframe.
     */
    columns?: Iterable<IColumnConfig> | IColumnSpec,
};

/** 
 * Represents a named column in a dataframe.
 */
export interface IColumn {
    
    /**
     * The name of the column.
     */
    name: string;

    /**
     * The data type of the column.
     */
    type: string;

    /**
     * The data series from the column.
     */
    series: ISeries<any, any>;
}

/** 
 * An object whose fields specify data for named named columns or user-defined generator functions that generate the data for the columns.
 */
export interface IColumnGenSpec { //todo: this should allow iterable as well!
    [index: string]: ISeries<any, any> | SeriesSelectorFn<any, any, any>,
}

/**
 * A string-to-string mapping that specifies how to rename columns.
 */
export interface IColumnRenameSpec {
    [index: string]: string;
}

/**
 * Specifies columns to transform and the user-defined selector function that does the transformation.
 */
export interface IColumnTransformSpec {
    [columnName: string]: SelectorWithIndexFn<any, any>;
}

/**
 * Specifies columns that should be aggregated and a user-defined aggregator function to do the aggregation.
 */
export interface IColumnAggregateSpec {
    [index: string]: AggregateFn<any, any>;
}

/**
 * A selector function that can select a series from a dataframe.
 */
export type SeriesSelectorFn<IndexT, DataFrameValueT, SeriesValueT> = (dataFrame: IDataFrame<IndexT, DataFrameValueT>) => ISeries<IndexT, SeriesValueT>;

/*
 * A function that generates a dataframe content object.
 * Used to make it easy to create lazy evaluated dataframes.
 */
export type DataFrameConfigFn<IndexT, ValueT> = () => IDataFrameConfig<IndexT, ValueT>;

/**
 * Represents the frequency of a type in a series or dataframe.
 */
export interface ITypeFrequency {

    /**
     * Name of the column containing the value.
     */
    Column: string;

    /**
     * The name of the type.
     */
    Type: string; 

    /**
     * The frequency of the type's appearance in the series or dataframe.
     */
    Frequency: number;
}

/**
 * Represents the frequency of a value in a series or dataframe.
 */
export interface IValueFrequency {

    /**
     * Name of the column containing the value.
     */
    Column: string;

    /**
     * The value.
     */
    Value: any; 

    /**
     * The frequency of the value's appearance in the series or dataframe.
     */
    Frequency: number;
}

/**
 * Interface that represents a dataframe.
 * A dataframe contains an indexed sequence of data records.
 * Think of it as a spreadsheet or CSV file in memory.
 * 
 * Each data record contains multiple named fields, the value of each field represents one row in a column of data.
 * Each column of data is a named {@link Series}.
 * You think of a dataframe a collection of named data series.
 * 
 * @typeparam IndexT The type to use for the index.
 * @typeparam ValueT The type to use for each row/data record.
 */
export interface IDataFrame<IndexT = number, ValueT = any> extends Iterable<ValueT> {

    /**
     * Get an iterator to enumerate the rows of the dataframe.
     * Enumerating the iterator forces lazy evaluation to complete.
     * This function is automatically called by `for...of`.
     * 
     * @return An iterator for the rows in the dataframe.
     * 
     * @example
     * <pre>
     * 
     * for (const row of df) {
     *     // ... do something with the row ...
     * }
     * </pre>
     */
    [Symbol.iterator] (): Iterator<ValueT>;

    /**
     * Get the names of the columns in the dataframe.
     * 
     * @return Returns an array of the column names in the dataframe.  
     * 
     * @example
     * <pre>
     * 
     * console.log(df.getColumnNames());
     * </pre>
     */
    getColumnNames (): string[];

    /** 
     * Retreive the collection of all columns in the dataframe.
     * 
     * @return Returns a {@link Series} containing the names of the columns in the dataframe.
     * 
     * @example
     * <pre>
     * 
     * for (const column in df.getColummns()) {
     *      console.log("Column name: ");
     *      console.log(column.name);
     * 
     *      console.log("Data:");
     *      console.log(column.series.toArray());
     * }
     * </pre>
     */
    getColumns (): ISeries<number, IColumn>;

    /**
     * Cast the value of the dataframe to a new type.
     * This operation has no effect but to retype the r9ws that the dataframe contains.
     * 
     * @return The same dataframe, but with the type changed.
     * 
     * @example
     * <pre>
     * 
     * const castDf = df.cast<SomeOtherType>();
     * </pre>
     */
    cast<NewValueT> (): IDataFrame<IndexT, NewValueT>;
    
    /**
     * Get the index for the dataframe.
     * 
     * @return The {@link Index} for the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const index = df.getIndex();
     * </pre>
     */
    getIndex (): IIndex<IndexT>;

    /**
     * Set a named column as the {@link Index} of the dataframe.
     *
     * @param columnName Name of the column to use as the new {@link Index} of the returned dataframe.
     *
     * @return Returns a new dataframe with the values of the specified column as the new {@link Index}.
     * 
     * @example
     * <pre>
     * 
     * const indexedDf = df.setIndex("SomeColumn");
     * </pre>
     */
    setIndex<NewIndexT = any> (columnName: string): IDataFrame<NewIndexT, ValueT>;
    
    /**
     * Apply a new {@link Index} to the dataframe.
     * 
     * @param newIndex The new array or iterable to be the new {@link Index} of the dataframe. Can also be a selector to choose the {@link Index} for each row in the dataframe.
     * 
     * @return Returns a new dataframe with the specified {@link Index} attached.
     * 
     * @example
     * <pre>
     * 
     * const indexedDf = df.withIndex([10, 20, 30]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const indexedDf = df.withIndex(df.getSeries("SomeColumn"));
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const indexedDf = df.withIndex(row => row.SomeColumn);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const indexedDf = df.withIndex(row => row.SomeColumn + 20);
     * </pre>
     */
    withIndex<NewIndexT> (newIndex: Iterable<NewIndexT> | SelectorFn<ValueT, NewIndexT>): IDataFrame<NewIndexT, ValueT>;

    /**
     * Resets the {@link Index} of the dataframe back to the default zero-based sequential integer index.
     * 
     * @return Returns a new dataframe with the {@link Index} reset to the default zero-based index. 
     * 
     * @example
     * <pre>
     * 
     * const dfWithResetIndex = df.resetIndex();
     * </pre>
     */
    resetIndex (): IDataFrame<number, ValueT>;
    
    /**
     * Extract a {@link Series} from a named column in the dataframe.
     *
     * @param columnName Specifies the name of the column that contains the {@link Series} to retreive.
     * 
     * @return Returns the {@link Series} extracted from the named column in the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const series = df.getSeries("SomeColumn");
     * </pre>
     */
    getSeries<SeriesValueT = any> (columnName: string): ISeries<IndexT, SeriesValueT>;

    /**
     * Determine if the dataframe contains a {@link Series} the specified named column.
     *
     * @param columnName Name of the column to check for.
     * 
     * @return Returns true if the dataframe contains the requested {@link Series}, otherwise returns false.
     * 
     * @example
     * <pre>
     * 
     * if (df.hasSeries("SomeColumn")) {
     *      // ... the dataframe contains a series with the specified column name ...
     * }
     * </pre>
     */
    hasSeries (columnName: string): boolean;

    /**
     * Verify the existence of a name column and extracts the {@link Series} for it.
     * Throws an exception if the requested column doesn't exist.
     *
     * @param columnName Name of the column to extract.
     * 
     * @return Returns the {@link Series} for the column if it exists, otherwise it throws an exception.
     * 
     * @example
     * <pre>
     * 
     * try {
     *      const series = df.expectSeries("SomeColumn");
     *      // ... do something with the series ...
     * }
     * catch (err) {
     *      // ... the dataframe doesn't contain the column "SomeColumn" ...
     * }
     * </pre>
     */
    expectSeries<SeriesValueT> (columnName: string): ISeries<IndexT, SeriesValueT>;

    /**
     * Create a new dataframe with a replaced or additional column specified by the passed-in series.
     *
     * @param columnNameOrSpec The name of the column to add or replace or a {@link IColumnGenSpec} that defines the columns to add.
     * @param [series] When columnNameOrSpec is a string that identifies the column to add, this specifies the {@link Series} to add to the dataframe or a function that produces a series (given a dataframe).
     *
     * @return Returns a new dataframe replacing or adding a particular named column.
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.withSeries("ANewColumn", new Series([1, 2, 3]));
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.withSeries("ANewColumn", df => 
     *      df.getSeries("SourceData").select(aTransformation)
     * );
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.withSeries({
     *      ANewColumn: new Series([1, 2, 3]),
     *      SomeOtherColumn: new Series([10, 20, 30])
     * });
     * <pre>
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.withSeries({
     *      ANewColumn: df => df.getSeries("SourceData").select(aTransformation))
     * });
     * <pre>
     */
    withSeries<OutputValueT = any, SeriesValueT = any> (columnNameOrSpec: string | IColumnGenSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, OutputValueT>;

    /**
     * Merge one or more dataframes into this single dataframe.
     * Rows are merged by indexed. 
     * Same named columns in subsequent dataframes override columns in earlier dataframes.
     * 
     * @param otherDataFrames... One or more dataframes to merge into this dataframe.
     * 
     * @returns The merged data frame.
     * 
     * @example
     * <pre>
     * 
     * const mergedDF = df1.merge(df2);
     * </pre>
     * 
     * <pre>
     * 
     * const mergedDF = df1.merge(df2, df3, etc);
     * </pre>
     */
    merge<MergedValueT = any>(...otherDataFrames: IDataFrame<IndexT, any>[]): IDataFrame<IndexT, MergedValueT>;
    
    /**
     * Add a series to the dataframe, but only if it doesn't already exist.
     * 
     * @param columnNameOrSpec The name of the series to add or a {@link IColumnGenSpec} that specifies the columns to add.
     * @param [series] If columnNameOrSpec is a string that specifies the name of the series to add, this specifies the actual {@link Series} to add or a selector that generates the series given the dataframe.
     * 
     * @return Returns a new dataframe with the specified series added, if the series didn't already exist. Otherwise if the requested series already exists the same dataframe is returned.
     * 
     * @example
     * <pre>
     * 
     * const updatedDf = df.ensureSeries("ANewColumn", new Series([1, 2, 3]));
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const updatedDf = df.ensureSeries("ANewColumn", df => 
     *      df.getSeries("AnExistingSeries").select(aTransformation)
     * );
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.ensureSeries({
     *      ANewColumn: new Series([1, 2, 3]),
     *      SomeOtherColumn: new Series([10, 20, 30])
     * });
     * <pre>
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.ensureSeries({
     *      ANewColumn: df => df.getSeries("SourceData").select(aTransformation))
     * });
     * <pre>
     */
    ensureSeries<SeriesValueT> (columnNameOrSpec: string | IColumnGenSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Create a new dataframe with just a subset of columns.
     *
     * @param columnNames Array of column names to include in the new dataframe.
     * 
     * @return Returns a dataframe with a subset of columns from the original dataframe.
     * 
     * @example
     * <pre>
     * const subsetDf = df.subset(["ColumnA", "ColumnB"]);
     * </pre>
     */
    subset<NewValueT = ValueT> (columnNames: string[]): IDataFrame<IndexT, NewValueT>;

    /**
     * Create a new dataframe with the requested column or columns dropped.
     *
     * @param columnOrColumns Specifies the column name (a string) or columns (array of strings) to drop.
     * 
     * @return Returns a new dataframe with a particular named column or columns removed.
     * 
     * @example
     * <pre>
     * const modifiedDf = df.dropSeries("SomeColumn");
     * </pre>
     * 
     * @example
     * <pre>
     * const modifiedDf = df.dropSeries(["ColumnA", "ColumnB"]);
     * </pre>
     */
    dropSeries<NewValueT = ValueT> (columnOrColumns: string | string[]): IDataFrame<IndexT, NewValueT>;

    /**
     * Create a new dataframe with columns reordered.
     * New column names create new columns (with undefined values), omitting existing column names causes those columns to be dropped.
     * 
     * @param columnNames Specifies the new order for columns.
     * 
     * @return Returns a new dataframe with columns reodered according to the order of the array of column names that is passed in.
     * 
     * @example
     * <pre>
     * const reorderedDf = df.reorderSeries(["FirstColumn", "SecondColumn", "etc"]);
     * </pre>
     */
    reorderSeries<NewValueT = ValueT> (columnNames: string[]): IDataFrame<IndexT, NewValueT>;

    /**
     * Bring the column(s) with specified name(s) to the front of the column order, making it (or them) the first column(s) in the output dataframe.
     *
     * @param columnOrColumns Specifies the column or columns to bring to the front.
     *
     * @return Returns a new dataframe with 1 or more columns bought to the front of the column ordering.
     * 
     * @example
     * <pre>
     * const modifiedDf = df.bringToFront("NewFirstColumn");
     * </pre>
     * 
     * @example
     * <pre>
     * const modifiedDf = df.bringToFront(["NewFirstColumn", "NewSecondColumn"]);
     * </pre>
     */
    bringToFront (columnOrColumns: string | string[]): IDataFrame<IndexT, ValueT>;

    /**
     * Bring the column(s) with specified name(s) to the back of the column order, making it (or them) the last column(s) in the output dataframe.
     *
     * @param columnOrColumns Specifies the column or columns to bring to the back.
     *
     * @return Returns a new dataframe with 1 or more columns bought to the back of the column ordering.
     * 
     * @example
     * <pre>
     * const modifiedDf = df.bringToBack("NewLastColumn");
     * </pre>
     * 
     * @example
     * <pre>
     * const modifiedDf = df.bringToBack(["NewSecondLastCollumn, ""NewLastColumn"]);
     * </pre>
     */
    bringToBack (columnOrColumns: string | string[]): IDataFrame<IndexT, ValueT>;

    /**
     * Create a new dataframe with 1 or more columns renamed.
     *
     * @param newColumnNames A column rename spec - a JavaScript hash that maps existing column names to new column names.
     * 
     * @return Returns a new dataframe with specified columns renamed.
     * 
     * @example
     * <pre>
     * 
     * const renamedDf = df.renameSeries({ OldColumnName, NewColumnName });
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const renamedDf = df.renameSeries({ 
     *      Column1: ColumnA,
     *      Column2: ColumnB
     * });
     * </pre>
     */
    renameSeries<NewValueT = ValueT> (newColumnNames: IColumnRenameSpec): IDataFrame<IndexT, NewValueT>;

    /**
    * Extract rows from the dataframe as an array.
    * Each element of the array is one row of the dataframe represented as
    * a JavaScript object with the fields as the dataframe's columns.
    * This forces lazy evaluation to complete.
    * 
    * @return Returns an array of the rows contained within the dataframe. 
    * 
    * @example
    * <pre>
    * const values = df.toArray();
    * </pre>
    */
   toArray (): ValueT[];

    /**
     * Retreive the index, row pairs from the dataframe as an array.
     * Each pair is [index, row].
     * This forces lazy evaluation to complete.
     * 
     * @return Returns an array of pairs that contains the dataframe's rows. Each pair is a two element array that contains an index and a row.
     * 
     * @example
     * <pre>
     * const pairs = df.toPairs();
     * </pre>
     */
    toPairs (): ([IndexT, ValueT])[];

    /**
     * Convert the dataframe to a JavaScript object.
     *
     * @param keySelector User-defined selector function that selects keys for the resulting object.
     * @param valueSelector User-defined selector function that selects values for the resulting object.
     * 
     * @return Returns a JavaScript object generated from the dataframe by applying the key and value selector functions. 
     * 
     * @example
     * <pre>
     * 
     * const someObject = df.toObject(
     *      row => row.SomeColumn, // Specify the column to use for field names in the output object.
     *      row => row.SomeOtherColumn // Specifi the column to use as the value for each field.
     * );
     * </pre>
     */
    toObject<KeyT = any, FieldT = any, OutT = any> (keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT;

    /**
     * Bake the data frame to an array of rows were each rows is an array of values in column order.
     * 
     * @return Returns an array of rows. Each row is an array of values in column order.
     * 
     * @example
     * <pre>
     * const rows = df.toRows();
     * </pre>
     */
    toRows (): any[][];
 
    /**
     * Generates a new dataframe by repeatedly calling a user-defined selector function on each row in the original dataframe.
     *
     * @param selector A user-defined selector function that transforms each row to create the new dataframe.
     * 
     * @return Returns a new dataframe with each row transformed by the selector function.
     * 
     * @example
     * <pre>
     * 
     * function transformRow (inputRow) {
     *      const outputRow = {
     *          // ... construct output row derived from input row ...
     *      };
     *
     *      return outputRow;
     * }
     *  
     * const transformedDf = df.select(row => transformRow(row));
     * </pre>
     */
    select<ToT> (selector: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT>;

    /**
     * Generates a new dataframe by repeatedly calling a user-defined selector function on each row in the original dataframe.
     * 
     * * Similar to the {@link select} function, but in this case the selector function produces a collection of output rows that are flattened and merged to create the new dataframe.
     *
     * @param selector A user-defined selector function that transforms each row into a collection of output rows.
     * 
     * @return Returns a new dataframe where each row has been transformed into 0 or more new rows by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * function produceOutputRows (inputRow) {
     *      const outputRows = [];
     *      while (someCondition) {
     *          // ... generate zero or more output rows ...
     *          outputRows.push(... some generated row ...);
     *      }
     *      return outputRows;
     * }
     * 
     * const modifiedDf = df.selectMany(row => produceOutputRows(row));
     * </pre>
     */
    selectMany<ToT> (selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): IDataFrame<IndexT, ToT>;

    /**
     * Transform one or more columns. 
     * 
     * This is equivalent to extracting a {@link Series} with {@link getSeries}, then transforming it with {@link Series.select},
     * and finally plugging it back in as the same column using {@link withSeries}.
     *
     * @param columnSelectors Object with field names for each column to be transformed. Each field specifies a selector function that transforms that column.
     * 
     * @return Returns a new dataframe with 1 or more columns transformed.
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.transformSeries({ 
     *      AColumnToTransform: columnValue => transformRow(columnValue) 
     * });
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.transformSeries({ 
     *      ColumnA: columnValue => transformColumnA(columnValue),
     *      ColumnB: columnValue => transformColumnB(columnValue)
     * });
     * </pre>
     */
    transformSeries<NewValueT = ValueT> (columnSelectors: IColumnTransformSpec): IDataFrame<IndexT, NewValueT>;

    /** 
     * Generate new columns based on existing rows.
     * 
     * This is equivalent to calling {@link select} to transform the original dataframe to a new dataframe with different column,
     * then using {@link withSeries} to merge each the of both the new and original dataframes.
     *
     * @param generator Generator function that transforms each row to produce 1 or more new columns.
     * Or use a column spec that has fields for each column, the fields specify a generate function that produces the value for each new column.
     * 
     * @return Returns a new dataframe with 1 or more new columns.
     * 
     * @example
     * <pre>
     * 
     * function produceNewColumns (inputRow) {
     *      const newColumns = {
     *          // ... specify new columns and their values based on the input row ...
     *      };
     * 
     *      return newColumns;
     * };
     * 
     * const dfWithNewSeries = df.generateSeries(row => produceNewColumns(row));
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const dfWithNewSeries = df.generateSeries({ 
     *      NewColumnA: row => produceNewColumnA(row),
     *      NewColumnB: row => produceNewColumnB(row),
     * })
     * </pre>
     */
    generateSeries<NewValueT = ValueT> (generator: SelectorWithIndexFn<any, any> | IColumnTransformSpec): IDataFrame<IndexT, NewValueT>;

    /** 
     * Converts (deflates) a dataframe to a {@link Series}.
     *
     * @param [selector] Optional user-defined selector function that transforms each row to produce the series.
     *
     * @return Returns a series that was created from the original dataframe.
     * 
     * @example
     * <pre>
     * 
     * const series = df.deflate(); // Deflate to a series of object.
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const series = df.deflate(row => row.SomeColumn); // Extract a particular column.
     * </pre>
     */
    deflate<ToT = ValueT> (selector?: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT>;

    /** 
     * Inflate a named {@link Series} in the dataframe to 1 or more new series in the new dataframe.
     * 
     * This is the equivalent of extracting the series using {@link getSeries}, transforming them with {@link Series.select}
     * and then running {@link Series.inflate} to create a new dataframe, then merging each column of the new dataframe
     *  into the original dataframe using {@link withSeries}.
     *
     * @param columnName Name of the series to inflate.
     * @param [selector] Optional selector function that transforms each value in the column to new columns. If not specified it is expected that each value in the column is an object whose fields define the new column names.
     * 
     * @return Returns a new dataframe with a column inflated to 1 or more new columns.
     * 
     * @example
     * <pre>
     * 
     * function newColumnGenerator (row) {
     *      const newColumns = {
     *          // ... create 1 field per new column ...
     *      };
     * 
     *      return row;
     * }
     * 
     * const dfWithNewSeries = df.inflateSeries("SomeColumn", newColumnGenerator);
     * </pre>
     */
    inflateSeries<NewValueT = ValueT> (columnName: string, selector?: SelectorWithIndexFn<IndexT, any>): IDataFrame<IndexT, ValueT>;

    /**
     * Partition a dataframe into a {@link Series} of *data windows*. 
     * Each value in the new series is a chunk of data from the original dataframe.
     *
     * @param period The number of rows to include in each data window.
     * 
     * @return Returns a new series, each value of which is a chunk (data window) of the original dataframe.
     * 
     * @example
     * <pre>
     * 
     * const windows = df.window(2); // Get rows in pairs.
     * const pctIncrease = windows.select(pair => (pair.last().SalesAmount - pair.first().SalesAmount) / pair.first().SalesAmount);
     * console.log(pctIncrease.toString());
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const salesDf = ... // Daily sales data.
     * const weeklySales = salesDf.window(7); // Partition up into weekly data sets.
     * console.log(weeklySales.toString());
     * </pre>
     */
    window (period: number): ISeries<number, IDataFrame<IndexT, ValueT>>;

    /** 
     * Partition a dataframe into a {@link Series} of *rolling data windows*. 
     * Each value in the new series is a rolling chunk of data from the original dataframe.
     *
     * @param period The number of data rows to include in each data window.
     * 
     * @return Returns a new series, each value of which is a rolling chunk of the original dataframe.
     * 
     * @example
     * <pre>
     * 
     * const salesDf = ... // Daily sales data.
     * const rollingWeeklySales = salesDf.rollingWindow(7); // Get rolling window over weekly sales data.
     * console.log(rollingWeeklySales.toString());
     * </pre>
     */
    rollingWindow (period: number): ISeries<number, IDataFrame<IndexT, ValueT>>;

    /**
     * Partition a dataframe into a {@link Series} of variable-length *data windows* 
     * where the divisions between the data chunks are
     * defined by a user-provided *comparer* function.
     * 
     * @param comparer Function that compares two adjacent data rows and returns true if they should be in the same window.
     * 
     * @return Returns a new series, each value of which is a chunk of data from the original dataframe.
     * 
     * @example
     * <pre>
     * 
     * function rowComparer (rowA, rowB) {
     *      if (... rowA should be in the same data window as rowB ...) {
     *          return true;
     *      }
     *      else {
     *          return false;
     *      }
     * };
     * 
     * const variableWindows = df.variableWindow(rowComparer);
     */
    variableWindow (comparer: ComparerFn<ValueT, ValueT>): ISeries<number, IDataFrame<IndexT, ValueT>>;

    /**
     * Eliminates adjacent duplicate rows.
     * 
     * For each group of adjacent values that are equivalent only returns the last index/row for the group, 
     * thus ajacent equivalent rows are collapsed down to the last row.
     *
     * @param [selector] Optional selector function to determine the value used to compare for equivalence.
     * 
     * @return Returns a new dataframe with groups of adjacent duplicate rows collapsed to a single row per group.
     * 
     * @example
     * <pre>
     * 
     * const dfWithDuplicateRowsRemoved = df.sequentialDistinct(row => row.ColumnA);
     * </pre>
     */
    sequentialDistinct<ToT = ValueT> (selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ValueT>;

    /**
     * Aggregate the rows in the dataframe to a single result.
     *
     * @param [seed] Optional seed value for producing the aggregation.
     * @param selector Function that takes the seed and then each row in the dataframe and produces the aggregate value.
     * 
     * @return Returns a new value that has been aggregated from the dataframe using the 'selector' function. 
     * 
     * @example
     * <pre>
     * 
     * const dailySalesDf = ... daily sales figures for the past month ...
     * const totalSalesForthisMonth = dailySalesDf.aggregate(
     *      0, // Seed - the starting value.
     *      (accumulator, row) => accumulator + row.SalesAmount // Aggregation function.
     * );
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const totalSalesAllTime = 500; // We'll seed the aggregation with this value.
     * const dailySalesDf = ... daily sales figures for the past month ...
     * const updatedTotalSalesAllTime = dailySalesDf.aggregate(
     *      totalSalesAllTime, 
     *      (accumulator, row) => accumulator + row.SalesAmount
     * );
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * var salesDataSummary = salesDataDf.aggregate({
     *      TotalSales: df => df.count(),
     *      AveragePrice: df => df.deflate(row => row.Price).average(),
     *      TotalRevenue: df => df.deflate(row => row.Revenue).sum(), 
     * });
     * </pre>
    */
   aggregate<ToT = ValueT> (seedOrSelector: AggregateFn<ValueT, ToT> | ToT | IColumnAggregateSpec, selector?: AggregateFn<ValueT, ToT>): ToT;
    
    /**
     * Skip a number of rows in the dataframe.
     *
     * @param numValues Number of rows to skip.
     * 
     * @return Returns a new dataframe with the specified number of rows skipped. 
     * 
     * @example
     * <pre>
     * 
     * const dfWithRowsSkipped = df.skip(10); // Skip 10 rows in the original dataframe.
     * </pre>
     */
    skip (numValues: number): IDataFrame<IndexT, ValueT>;

    /**
     * Skips values in the dataframe while a condition evaluates to true or truthy.
     *
     * @param predicate Returns true/truthy to continue to skip rows in the original dataframe.
     * 
     * @return Returns a new dataframe with all initial sequential rows removed while the predicate returned true/truthy.
     * 
     * @example
     * <pre>
     * 
     * const dfWithRowsSkipped = df.skipWhile(row => row.CustomerName === "Fred"); // Skip initial customers named Fred.
     * </pre>
     */
    skipWhile (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Skips values in the dataframe untils a condition evaluates to true or truthy.
     *
     * @param predicate Return true/truthy to stop skipping rows in the original dataframe.
     * 
     * @return Returns a new dataframe with all initial sequential rows removed until the predicate returned true/truthy.
     * 
     * @example
     * <pre>
     * 
     * const dfWithRowsSkipped = df.skipUntil(row => row.CustomerName === "Fred"); // Skip initial customers until we find Fred.
     * </pre>
     */
    skipUntil (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Take a number of rows in the dataframe.
     *
     * @param numValues Number of rows to take.
     * 
     * @return Returns a new dataframe with only the specified number of rows taken from the original dataframe.
     * 
     * @example
     * <pre>
     * 
     * const dfWithRowsTaken = df.take(15); // Take only the first 15 rows from the original dataframe.
     * </pre>
     */
    take (numRows: number): IDataFrame<IndexT, ValueT>;

    /**
     * Takes values from the dataframe while a condition evaluates to true or truthy.
     *
     * @param predicate Returns true/truthy to continue to take rows from the original dataframe.
     * 
     * @return Returns a new dataframe with only the initial sequential rows that were taken while the predicate returned true/truthy.
     * 
     * @example
     * <pre>
     * 
     * const dfWithRowsTaken = df.takeWhile(row => row.CustomerName === "Fred"); // Take only initial customers named Fred.
     * </pre>
     */
    takeWhile (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Takes values from the dataframe untils a condition evaluates to true or truthy.
     *
     * @param predicate Return true/truthy to stop taking rows in the original dataframe.
     * 
     * @return Returns a new dataframe with only the initial sequential rows taken until the predicate returned true/truthy.
     * 
     * @example
     * <pre>
     * 
     * const dfWithRowsTaken = df.takeUntil(row => row.CustomerName === "Fred"); // Take all initial customers until we find Fred.
     * </pre>
     */
    takeUntil (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Count the number of rows in the dataframe
     *
     * @return Returns the count of all rows.
     * 
     * @example
     * <pre>
     * 
     * const numRows = df.count();
     * </pre>
     */
    count (): number;

    /**
     * Get the first row of the dataframe.
     *
     * @return Returns the first row of the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const firstRow = df.first();
     * </pre>
     */
    first (): ValueT;

    /**
     * Get the last row of the dataframe.
     *
     * @return Returns the last row of the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const lastRow = df.last();
     * </pre>
     */
    last (): ValueT;
    
    /**
     * Get the row, if there is one, with the specified index.
     *
     * @param index Index to for which to retreive the row.
     *
     * @return Returns the row from the specified index in the dataframe or undefined if there is no such index in the present in the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const row = df.at(5); // Get the row at index 5 (with a default 0-based index).
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const date = ... some date ...
     * // Retreive the row with specified date from a time-series dataframe (assuming date indexed has been applied).
     * const row = df.at(date); 
     * </pre>
     */
    at (index: IndexT): ValueT | undefined;
    
    /** 
     * Get X rows from the start of the dataframe.
     * Pass in a negative value to get all rows at the head except for X rows at the tail.
     *
     * @param numValues Number of rows to take.
     * 
     * @return Returns a new dataframe that has only the specified number of rows taken from the start of the original dataframe.  
     * 
     * @examples
     * <pre>
     * 
     * const sample = df.head(10); // Take a sample of 10 rows from the start of the dataframe.
     * </pre>
     */
    head (numValues: number): IDataFrame<IndexT, ValueT>;

    /** 
     * Get X rows from the end of the dataframe.
     * Pass in a negative value to get all rows at the tail except X rows at the head.
     *
     * @param numValues Number of rows to take.
     * 
     * @return Returns a new dataframe that has only the specified number of rows taken from the end of the original dataframe.  
     * 
     * @examples
     * <pre>
     * 
     * const sample = df.tail(12); // Take a sample of 12 rows from the end of the dataframe.
     * </pre>
     */
    tail (numValues: number): IDataFrame<IndexT, ValueT>;

    /**
     * Filter the dataframe using user-defined predicate function.
     *
     * @param predicate Predicte function to filter rows from the dataframe. Returns true/truthy to keep rows, or false/falsy to omit rows.
     * 
     * @return Returns a new dataframe containing only the rows from the original dataframe that matched the predicate. 
     * 
     * @example
     * <pre>
     * 
     * const filteredDf = df.where(row => row.CustomerName === "Fred"); // Filter so we only have customers named Fred.
     * </pre>
     */
    where (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Invoke a callback function for each roew in the dataframe.
     *
     * @param callback The calback function to invoke for each row.
     * 
     * @return Returns the original dataframe with no modifications.
     * 
     * @example
     * <pre>
     * 
     * df.forEach(row => {
     *      // ... do something with the row ...
     * });
     * </pre>
     */
    forEach (callback: CallbackFn<ValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Evaluates a predicate function for every row in the dataframe to determine 
     * if some condition is true/truthy for **all** rows in the dataframe.
     * 
     * @param predicate Predicate function that receives each row. It should returns true/truthy for a match, otherwise false/falsy.
     *
     * @return Returns true if the predicate has returned true or truthy for every row in the dataframe, otherwise returns false. Returns false for an empty dataframe. 
     * 
     * @example
     * <pre>
     * 
     * const everyoneIsNamedFred = df.all(row => row.CustomerName === "Fred"); // Check if all customers are named Fred.
     * </pre>
     */
    all (predicate: PredicateFn<ValueT>): boolean;

    /**
     * Evaluates a predicate function for every row in the dataframe to determine 
     * if some condition is true/truthy for **any** of rows in the dataframe.
     * 
     * If no predicate is specified then it simply checks if the dataframe contains more than zero rows.
     *
     * @param [predicate] Optional predicate function that receives each row. It should return true/truthy for a match, otherwise false/falsy.
     *
     * @return Returns true if the predicate has returned truthy for any row in the sequence, otherwise returns false. 
     * If no predicate is passed it returns true if the dataframe contains any rows at all. 
     * Returns false for an empty dataframe.
     * 
     * @example
     * <pre>
     * 
     * const anyFreds = df.any(row => row.CustomerName === "Fred"); // Do we have any customers named Fred?
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const anyCustomers = df.any(); // Do we have any customers at all?
     * </pre>
     */
    any (predicate?: PredicateFn<ValueT>): boolean;

    /**
     * Evaluates a predicate function for every row in the dataframe to determine 
     * if some condition is true/truthy for **none** of rows in the dataframe.
     * 
     * If no predicate is specified then it simply checks if the dataframe contains zero rows.
     *
     * @param [predicate] Optional predicate function that receives each row. It should return true/truthy for a match, otherwise false/falsy.
     *
     * @return Returns true if the predicate has returned truthy for zero rows in the dataframe, otherwise returns false. Returns false for an empty dataframe.
     * 
     * @example
     * <pre>
     * 
     * const noFreds = df.none(row => row.CustomerName === "Fred"); // Do we have zero customers named Fred?
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const noCustomers = df.none(); // Do we have zero customers?
     * </pre>
     */
    none (predicate?: PredicateFn<ValueT>): boolean;

        /**
     * Gets a new dataframe containing all rows starting at and after the specified index value.
     * 
     * @param indexValue The index value at which to start the new dataframe.
     * 
     * @return Returns a new dataframe containing all rows starting at and after the specified index value. 
     * 
     * @example
     * <pre>
     * 
     * const df = new DataFrame({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const lastHalf = df.startAt(2);
     * expect(lastHalf.toArray()).to.eql([30, 40]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeriesDf = ... a dataframe indexed by date/time ...
     * 
     * // Get all rows starting at (or after) a particular date.
     * const allRowsFromStartDate = df.startAt(new Date(2016, 5, 4)); 
     * </pre>
     */
    startAt (indexValue: IndexT): IDataFrame<IndexT, ValueT>;

    /**
     * Gets a new dataframe containing all rows up until and including the specified index value (inclusive).
     * 
     * @param indexValue The index value at which to end the new dataframe.
     * 
     * @return Returns a new dataframe containing all rows up until and including the specified index value.
     * 
     * @example
     * <pre>
     * 
     * const df = new DataFrame({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const firstHalf = df.endAt(1);
     * expect(firstHalf.toArray()).to.eql([10, 20]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeriesDf = ... a dataframe indexed by date/time ...
     * 
     * // Get all rows ending at a particular date.
     * const allRowsUpToAndIncludingTheExactEndDate = df.endAt(new Date(2016, 5, 4)); 
     * </pre>
     */
    endAt (indexValue: IndexT): IDataFrame<IndexT, ValueT>;

    /**
     * Gets a new dataframe containing all rows up to the specified index value (exclusive).
     * 
     * @param indexValue The index value at which to end the new dataframe.
     * 
     * @return Returns a new dataframe containing all rows up to (but not including) the specified index value. 
     * 
     * @example
     * <pre>
     * 
     * const df = new DataFrame({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const firstHalf = df.before(2);
     * expect(firstHalf.toArray()).to.eql([10, 20]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeriesDf = ... a dataframe indexed by date/time ...
     * 
     * // Get all rows before the specified date.
     * const allRowsBeforeEndDate = df.before(new Date(2016, 5, 4)); 
     * </pre>
     */
    before (indexValue: IndexT): IDataFrame<IndexT, ValueT>;

    /**
     * Gets a new dataframe containing all rows after the specified index value (exclusive).
     * 
     * @param indexValue The index value after which to start the new dataframe.
     * 
     * @return Returns a new dataframe containing all rows after the specified index value.
     * 
     * @example
     * <pre>
     * 
     * const df = new DataFrame({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const lastHalf = df.before(1);
     * expect(lastHalf.toArray()).to.eql([30, 40]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeriesDf = ... a dataframe indexed by date/time ...
     * 
     * // Get all rows after the specified date.
     * const allRowsAfterStartDate = df.after(new Date(2016, 5, 4)); 
     * </pre>
     */
    after (indexValue: IndexT): IDataFrame<IndexT, ValueT>;

    /**
     * Gets a new dataframe containing all rows between the specified index values (inclusive).
     * 
     * @param startIndexValue The index at which to start the new dataframe.
     * @param endIndexValue The index at which to end the new dataframe.
     * 
     * @return Returns a new dataframe containing all values between the specified index values (inclusive).
     * 
     * @example
     * <pre>
     * 
     * const df = new DataFrame({ 
     *      index: [0, 1, 2, 3, 4, 6], // This is the default index.
     *      values: [10, 20, 30, 40, 50, 60],
     * });
     * 
     * const middleSection = df.between(1, 4);
     * expect(middleSection.toArray()).to.eql([20, 30, 40, 50]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeriesDf = ... a dataframe indexed by date/time ...
     * 
     * // Get all rows between the start and end dates (inclusive).
     * const allRowsBetweenDates = df.after(new Date(2016, 5, 4), new Date(2016, 5, 22)); 
     * </pre>
     */
    between (startIndexValue: IndexT, endIndexValue: IndexT): IDataFrame<IndexT, ValueT>;

    /** 
     * Format the dataframe for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @return Generates and returns a string representation of the dataframe or dataframe.
     * 
     * @example
     * <pre>
     * 
     * console.log(df.toString());
     * </pre>
     */
    toString (): string;

    /**
     * Parse a column with string values and convert it to a column with int values.
     *
     * @param columnNameOrNames Specifies the column name or array of column names to parse.
     * 
     * @return Returns a new dataframe with a particular named column parsed as ints.  
     * 
     * @example
     * <pre>
     * 
     * const withParsedColumn = df.parseInts("MyIntColumn");
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const withParsedColumns = df.parseInts(["MyIntColumnA", "MyIntColumnA"]);
     * </pre>
     */
    parseInts (columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT>;

    /**
     * Parse a column with string values and convert it to a column with float values.
     *
     * @param columnNameOrNames Specifies the column name or array of column names to parse.
     * 
     * @return  Returns a new dataframe with a particular named column parsed as floats.  
     * 
     * @example
     * <pre>
     * 
     * const withParsedColumn = df.parseFloats("MyFloatColumn");
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const withParsedColumns = df.parseFloats(["MyFloatColumnA", "MyFloatColumnA"]);
     * </pre>
     */
    parseFloats (columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT>;

    /**
     * Parse a column with string values and convert it to a column with date values.
     *
     * @param columnNameOrNames -Specifies the column name or array of column names to parse.
     * @param [formatString] Optional formatting string for dates.
     * 
     * @return Returns a new dataframe with a particular named column parsed as dates.
     * 
     * @example
     * <pre>
     * 
     * const withParsedColumn = df.parseDates("MyDateColumn");
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const withParsedColumns = df.parseDates(["MyDateColumnA", "MyDateColumnA"]);
     * </pre>
     */
    parseDates (columnNameOrNames: string | string[], formatString?: string): IDataFrame<IndexT, ValueT>;

    /**
     * Convert a column of values of different types to a column of string values.
     *
     * @param columnNames Specifies the column name or array of column names to convert to strings. Can also be a format spec that specifies which columns to convert and what their format should be. 
     * @param [formatString] Optional formatting string for dates.
     * 
     * Numeral.js is used for number formatting.
     * http://numeraljs.com/
     * 
     * Moment is used for date formatting.
     * https://momentjs.com/docs/#/parsing/string-format/
     * 
     * @return Returns a new dataframe with a particular named column convert to strings.
     * 
     * @example
     * <pre>
     * 
     * const withStringColumn = df.toStrings("MyDateColumn", "YYYY-MM-DD");
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const withStringColumn = df.toStrings("MyFloatColumn", "0.00");
     * </pre>
     */
    toStrings (columnNames: string | string[] | IFormatSpec, formatString?: string): IDataFrame<IndexT, ValueT>;    

    /**
     * Produces a new dataframe with all string values truncated to the requested maximum length.
     *
     * @param maxLength The maximum length of the string values after truncation.
     * 
     * @return Returns a new dataframe with all strings truncated to the specified maximum length.
     * 
     * @example
     * <pre>
     * 
     * // Truncate all string columns to 100 characters maximum.
     * const truncatedDf = df.truncateString(100);
     * </pre>
     */
    truncateStrings (maxLength: number): IDataFrame<IndexT, ValueT>;

    /**
     * Produces a new dataframe with all number values rounded to the specified number of places.
     *
     * @param [numDecimalPlaces] The number of decimal places, defaults to 2.
     * 
     * @returns Returns a new dataframe with all number values rounded to the specified number of places.
     * 
     * @example
     * <pre>
     * 
     * const df = ... your data frame ...
     * const rounded = df.round(); // Round numbers to two decimal places.
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const df = ... your data frame ...
     * const rounded = df.round(3); // Round numbers to three decimal places.
     * </pre>
     */
    round (numDecimalPlaces?: number): IDataFrame<IndexT, ValueT>;

    /**
     * Forces lazy evaluation to complete and 'bakes' the dataframe into memory.
     * 
     * @return Returns a dataframe that has been 'baked', all lazy evaluation has completed.  
     * 
     * @example
     * <pre>
     * 
     * const bakedDf = df.bake();
     * </pre>
     */
    bake (): IDataFrame<IndexT, ValueT>;

    /** 
     * Gets a new dataframe in reverse order.
     * 
     * @return Returns a new dataframe that is the reverse of the original.
     * 
     * @example
     * <pre>
     * 
     * const reversed = df.reverse();
     * </pre>
     */
    reverse (): IDataFrame<IndexT, ValueT>;

    /**
     * Returns only the set of rows in the dataframe that are distinct according to some criteria.
     * This can be used to remove duplicate rows from the dataframe.
     *
     * @param selector User-defined selector function that specifies the criteria used to make comparisons for duplicate rows.
     * 
     * @return Returns a dataframe containing only unique values as determined by the 'selector' function. 
     * 
     * @example
     * <pre>
     * 
     * // Remove duplicate rows by customer id. Will return only a single row per customer.
     * const distinctCustomers = salesDf.distinct(sale => sale.CustomerId);
     * </pre>
     */
    distinct<ToT> (selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ValueT>;

    /**
     * Collects rows in the dataframe into a {@link Series} of groups according to a user-defined selector function.
     *
     * @param selector User-defined selector function that specifies the criteriay to group by.
     *
     * @return Returns a {@link Series} of groups. Each group is a dataframe with rows that have been grouped by the 'selector' function.
     * 
     * @example
     * <pre>
     * 
     * const salesDf = ... product sales ...
     * const salesByProduct = salesDf.groupBy(sale => sale.ProductId);
     * for (const productSalesGroup of salesByProduct) {
     *      // ... do something with each product group ...
     *      const productId = productSalesGroup.first().ProductId;
     *      const totalSalesForProduct = productSalesGroup.deflate(sale => sale.Amount).sum();
     *      console.log(totalSalesForProduct);
     * }
     * </pre>
     */
    groupBy<GroupT> (selector: SelectorWithIndexFn<ValueT, GroupT>): ISeries<number, IDataFrame<IndexT, ValueT>>;
    
    /**
     * Collects values in the series into a new series of groups based on if the values are the same or according to a user-defined selector function.
     *
     * @param [selector] Optional selector that specifies the criteria for grouping.
     *
     * @return Returns a {@link Series} of groups. Each group is a dataframe with rows that are the same or have been grouped by the 'selector' function.
     * 
     * @example
     * <pre>
     * 
     * // Some ultra simple stock trading strategy backtesting...
     * const dailyStockPriceDf = ... daily stock price for a company ...
     * const priceGroups  = dailyStockPriceDf.groupBy(day => day.close > day.movingAverage);
     * for (const priceGroup of priceGroups) {
     *      // ... do something with each stock price group ...
     * 
     *      const firstDay = priceGroup.first();
     *      if (firstDay.close > movingAverage) {
     *          // This group of days has the stock price above its moving average.
     *          // ... maybe enter a long trade here ...
     *      }
     *      else {
     *          // This group of days has the stock price below its moving average.
     *          // ... maybe enter a short trade here ...
     *      }
     * }
     * </pre>
     */
    groupSequentialBy<GroupT> (selector?: SelectorFn<ValueT, GroupT>): ISeries<number, IDataFrame<IndexT, ValueT>>;
    
    /**
     * Concatenate multiple other dataframes onto this dataframe.
     * 
     * @param dataframes Multiple arguments. Each can be either a dataframe or an array of dataframes.
     * 
     * @return Returns a single dataframe concatenated from multiple input dataframes. 
     * 
     * @example
     * <pre>
     * 
     * const concatenated = a.concat(b);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const concatenated = a.concat(b, c);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const concatenated = a.concat([b, c]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const concatenated = a.concat(b, [c, d]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const otherDfs = [... array of dataframes...];
     * const concatenated = a.concat(otherDfs);
     * </pre>
     */    
    concat (...dataframes: (IDataFrame<IndexT, ValueT>[] | IDataFrame<IndexT, ValueT>)[]): IDataFrame<IndexT, ValueT>;
    
    /**
    * Merge together multiple dataframes to create a new dataframe.
    * Preserves the index of the first dataframe.
    * 
    * @param s2, s3, s4, s4 Multiple dataframes to zip.
    * @param zipper User-defined zipper function that merges rows. It produces rows for the new dataframe based-on rows from the input dataframes.
    * 
    * @return Returns a single dataframe merged from multiple input dataframes. 
    * 
    * @example
    * <pre>
    * 
    * function produceNewRow (rowA, rowB) {
    *       const outputRow = {
    *           ValueA: rowA.Value,
    *           ValueB: rowB.Value,
    *       };
    *       return outputRow;
    * }
    * 
    * const dfA = new DataFrame([ { Value: 10 }, { Value: 20 }, { Value: 30 }]);
    * const dfB = new DataFrame([ { Value: 100 }, { Value: 200 }, { Value: 300 }]);
    * const zippedDf = dfA.zip(dfB, produceNewRow);
    * </pre>
    */    
    zip<Index2T, Value2T, ResultT>  (s2: IDataFrame<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, ResultT>  (s2: IDataFrame<Index2T, Value2T>, s3: IDataFrame<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>  (s2: IDataFrame<Index2T, Value2T>, s3: IDataFrame<Index3T, Value3T>, s4: IDataFrame<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<ResultT>  (...args: any[]): IDataFrame<IndexT, ResultT>;

    /**
     * Sorts the dataframe in ascending order by a value defined by the user-defined selector function. 
     * 
     * @param selector User-defined selector function that selects the value to sort by.
     * 
     * @return Returns a new dataframe that has been ordered accorrding to the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by amount from least to most.
     * const orderedDf = salesDf.orderBy(sale => sale.Amount); 
     * </pre>
     */
    orderBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT>;

    /**
     * Sorts the dataframe in descending order by a value defined by the user-defined selector function. 
     * 
     * @param selector User-defined selector function that selects the value to sort by.
     * 
     * @return Returns a new dataframe that has been ordered accorrding to the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by amount from most to least
     * const orderedDf = salesDf.orderByDescending(sale => sale.Amount); 
     * </pre>
     */
    orderByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT>;
        
    /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains the union of rows from the two input dataframes.
     * These are the unique combination of rows in both dataframe.
     * This is basically a concatenation and then elimination of duplicates.
     *
     * @param other The other dataframes to merge.
     * @param [selector] Optional user-defined selector function that selects the value to compare to determine distinctness.
     * 
     * @return Returns the union of the two dataframes.
     * 
     * @example
     * <pre>
     *
     * const dfA = ...
     * const dfB = ...
     * const merged = dfA.union(dfB);
     * </pre>
     * 
     * @example
     * <pre>
     *
     * // Merge two sets of customer records that may contain the same
     * // customer record in each set. This is basically a concatenation
     * // of the dataframes and then an elimination of any duplicate records
     * // that result.
     * const customerRecordsA = ...
     * const customerRecordsB = ...
     * const mergedCustomerRecords = customerRecordsA.union(
     *      customerRecordsB, 
     *      customerRecord => customerRecord.CustomerId
     * );
     * </pre>
     * 
     * 
     * @example
     * <pre>
     *
     * // Note that you can achieve the exact same result as the previous
     * // example by doing a {@link DataFrame.concat) and {@link DataFrame.distinct}
     * // of the dataframes and then an elimination of any duplicate records
     * // that result.
     * const customerRecordsA = ...
     * const customerRecordsB = ...
     * const mergedCustomerRecords = customerRecordsA
     *      .concat(customerRecordsB)
     *      .distinct(customerRecord => customerRecord.CustomerId);
     * </pre>
     * 
     */
    union<KeyT = ValueT> (
        other: IDataFrame<IndexT, ValueT>, 
        selector?: SelectorFn<ValueT, KeyT>): 
            IDataFrame<IndexT, ValueT>;

    /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains the intersection of rows from the two input dataframes.
     * These are only the rows that appear in both dataframes.
     *
     * @param inner The inner dataframe to merge (the dataframe you call the function on is the 'outer' dataframe).
     * @param [outerSelector] Optional user-defined selector function that selects the key from the outer dataframe that is used to match the two dataframes.
     * @param [innerSelector] Optional user-defined selector function that selects the key from the inner dataframe that is used to match the two dataframes.
     * 
     * @return Returns a new dataframe that contains the intersection of rows from the two input dataframes.
     * 
     * @example
     * <pre>
     * 
     * const dfA = ...
     * const dfB = ...
     * const mergedDf = dfA.intersection(dfB);
     * </pre>
     * 
     * @example
     * <pre>
     *
     * // Merge two sets of customer records to find only the
     * // customers that appears in both.
     * const customerRecordsA = ...
     * const customerRecordsB = ...
     * const intersectionOfCustomerRecords = customerRecordsA.intersection(
     *      customerRecordsB, 
     *      customerRecord => customerRecord.CustomerId
     * );
     * </pre>     
     * */
    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            IDataFrame<IndexT, ValueT>;
    
    /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains only the rows from the 1st dataframe that don't appear in the 2nd dataframe.
     * This is essentially subtracting the rows from the 2nd dataframe from the 1st and creating a new dataframe with the remaining rows.
     *
     * @param inner The inner dataframe to merge (the dataframe you call the function on is the 'outer' dataframe).
     * @param [outerSelector] Optional user-defined selector function that selects the key from the outer dataframe that is used to match the two dataframes.
     * @param [innerSelector] Optional user-defined selector function that selects the key from the inner dataframe that is used to match the two dataframes.
     * 
     * @return Returns a new dataframe that contains only the rows from the 1st dataframe that don't appear in the 2nd dataframe.
     * 
     * @example
     * <pre>
     * 
     * const dfA = ...
     * const dfB = ...
     * const remainingDf = dfA.except(dfB);
     * </pre>
     * 
     * @example
     * <pre>
     *
     * // Find the list of customers haven't bought anything recently.
     * const allCustomers = ... list of all customers ...
     * const recentCustomers = ... list of customers who have purchased recently ...
     * const remainingCustomers = allCustomers.except(
     *      recentCustomers, 
     *      customerRecord => customerRecord.CustomerId
     * );
     * </pre>
     */
    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            IDataFrame<IndexT, ValueT>;

   /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains only those rows that have matching keys in both input dataframes.
     *
     * @param inner The 'inner' dataframe to join (the dataframe you are callling the function on is the 'outer' dataframe).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer dataframe.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner dataframe.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * @return Returns the new merged dataframe.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought both product A and product B.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const customersWhoBoughtBothProductsDf = customerWhoBoughtProductA.join(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */
    join<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>):
            IDataFrame<number, ResultValueT>;

    /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains only those rows that are only present in one or the other of the dataframes, not both.
     *
     * @param inner The 'inner' dataframe to join (the dataframe you are callling the function on is the 'outer' dataframe).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer dataframe.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner dataframe.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @return Returns the new merged dataframe.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought either product A or product B, not not both.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const customersWhoBoughtEitherProductButNotBothDf = customerWhoBoughtProductA.joinOuter(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */
    joinOuter<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            IDataFrame<number, ResultValueT>;
    
    /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains only those rows that are present either in both dataframes or only in the outer (left) dataframe.
     * 
     * @param inner The 'inner' dataframe to join (the dataframe you are callling the function on is the 'outer' dataframe).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer dataframe.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner dataframe.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @return Returns the new merged dataframe.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought either just product A or both product A and product B.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const boughtJustAorAandB = customerWhoBoughtProductA.joinOuterLeft(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */
    joinOuterLeft<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            IDataFrame<number, ResultValueT>;

    /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains only those rows that are present either in both dataframes or only in the inner (right) dataframe.
     *
     * @param inner The 'inner' dataframe to join (the dataframe you are callling the function on is the 'outer' dataframe).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer dataframe.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner dataframe.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @return Returns the new merged dataframe.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought either just product B or both product A and product B.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const boughtJustAorAandB = customerWhoBoughtProductA.joinOuterRight(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */
    joinOuterRight<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            IDataFrame<number, ResultValueT>;

    /**
     * Produces a summary of dataframe. A bit like the 'aggregate' function but much simpler.
     * 
     * @param [spec] Optional parameter that specifies which columns to aggregate and how to aggregate them. Leave this out to produce a default summary of all columns.
     * 
     * @returns A object with fields that summary the values in the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const summary = df.summarize();
     * console.log(summary);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const summary = df.summarize({ // Summarize using pre-defined functions.
     *      Column1: Series.sum,
     *      Column2: Series.average,
     *      Column3: Series.count,
     * });
     * console.log(summary);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const summary = df.summarize({ // Summarize using custom functions.
     *      Column1: series => series.sum(),
     *      Column2: series => series.std(),
     *      ColumnN: whateverFunctionYouWant,
     * });
     * console.log(summary);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const summary = df.summarize({ // Multiple output fields per column.
     *      Column1: {
     *          OutputField1: Series.sum,
     *          OutputField2: Series.average,
     *      },
     *      Column2: {
     *          OutputField3: series => series.sum(),
     *          OutputFieldN: whateverFunctionYouWant,
     *      },
     * });
     * console.log(summary);
     * </pre>
     */
    summarize<OutputValueT = any> (
        spec?: IMultiColumnAggregatorSpec
            ): OutputValueT;

    /**
     * Reshape (or pivot) a dataframe based on column values.
     * This is a powerful function that combines grouping, aggregation and sorting.
     *
     * @param columnOrColumns Column name whose values make the new DataFrame's columns.
     * @param valueColumnNameOrSpec Column name or column spec that defines the columns whose values should be aggregated.
     * @param [aggregator] Optional function used to aggregate pivotted vales. 
     *
     * @return Returns a new dataframe that has been pivoted based on a particular column's values. 
     * 
     * @example
     * <pre>
     * 
     * // Simplest example.
     * // Group by the values in 'PivotColumn'.
     * // The column 'ValueColumn' is aggregated for each group and this becomes the 
     * // values in the output column.
     * const pivottedDf = df.pivot("PivotColumn", "ValueColumn", values => values.average());
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * // Multiple input column example.
     * // Similar to the previous example except now we are aggregating multiple input columns.
     * // Each group has the average computed for 'ValueColumnA' and the sum for 'ValueColumnB'.
     * const pivottedDf = df.pivot("PivotColumn", { 
     *      ValueColumnA: aValues => aValues.average(),
     *      ValueColumnB:  bValues => bValues.sum(),
     * });
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * // Multiple output column example.
     * // Similar to the previous example except now we are aggregating multiple outputs for each input column.
     * // This example produces an output dataframe with columns OutputColumnA, B, C and D.
     * // OutputColumnA/B are the sum and average of ValueColumnA across each group as defined by PivotColumn.
     * // OutputColumnC/D are the sum and average of ValueColumnB across each group as defined by PivotColumn.
     * const pivottedDf = df.pivot("PivotColumn", { 
     *      ValueColumnA: {
     *          OutputColumnA: aValues => aValues.sum(),
     *          OutputColumnB: aValues => aValues.average(),
     *      },
     *      ValueColumnB: {
     *          OutputColumnC: bValues => bValues.sum(),
     *          OutputColumnD: bValues => bValues.average(),
     *      },
     * });
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * // Full multi-column example.
     * // Similar to the previous example, but now we are pivotting on multiple columns.
     * // We now group by 'PivotColumnA' and then by 'PivotColumnB', effectively creating a 
     * // multi-level nested group.
     * const pivottedDf = df.pivot(["PivotColumnA", "PivotColumnB" ], { 
     *      ValueColumnA: aValues => aValues.average(),
     *      ValueColumnB:  bValues => bValues.sum(),
     * });
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * // To help understand the pivot function, let's expand it out and look at what it does internally.
     * // Take the simplest example:
     * const pivottedDf = df.pivot("PivotColumn", "ValueColumn", values => values.average());
     * 
     * // If we expand out the internals of the pivot function, it will look something like this:
     * const pivottedDf = df.groupBy(row => row.PivotColumn)
     *          .select(group => ({
     *              PivotColumn: group.first().PivotColumn,
     *              ValueColumn: group.deflate(row => row.ValueColumn).average()
     *          }))
     *          .orderBy(row  => row.PivotColumn);
     * 
     * // You can see that pivoting a dataframe is the same as grouping, aggregating and sorting it.
     * // Does pivoting seem simpler now?
     * 
     * // It gets more complicated than that of course, because the pivot function supports multi-level nested 
     * // grouping and aggregation of multiple columns. So a full expansion of the pivot function is rather complex.
     * </pre>
     */
    pivot<NewValueT = ValueT> (
        columnOrColumns: string | Iterable<string>, 
        valueColumnNameOrSpec: string | IMultiColumnAggregatorSpec, 
        aggregator?: (values: ISeries<number, any>) => any
            ): IDataFrame<number, NewValueT>;

    /**
     * Insert a pair at the start of the dataframe.
     * Doesn't modify the original dataframe! The returned dataframe is entirely new and contains rows from the original dataframe plus the inserted pair.
     *
     * @param pair The index/value pair to insert.
     * 
     * @return Returns a new dataframe with the specified pair inserted.
     * 
     * @example
     * <pre>
     * 
     * const newIndex = ... index of the new row ...
     * const newRow = ... the new data row to insert ...
     * const insertedDf = df.insertPair([newIndex, newRows]);
     * </pre>
     */
    insertPair (pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT>;

    /**
     * Append a pair to the end of a dataframe.
     * Doesn't modify the original dataframe! The returned dataframe is entirely new and contains rows from the original dataframe plus the appended pair.
     *
     * @param pair The index/value pair to append.
     *  
     * @return Returns a new dataframe with the specified pair appended.
     * 
     * @example
     * <pre>
     * 
     * const newIndex = ... index of the new row ...
     * const newRow = ... the new data row to append ...
     * const appendedDf = df.appendPair([newIndex, newRows]);
     * </pre>
     */
    appendPair (pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT>;

    /**
     * Fill gaps in a dataframe.
     *
     * @param comparer User-defined comparer function that is passed pairA and pairB, two consecutive rows, return truthy if there is a gap between the rows, or falsey if there is no gap.
     * @param generator User-defined generator function that is passed pairA and pairB, two consecutive rows, returns an array of pairs that fills the gap between the rows.
     *
     * @return Returns a new dataframe with gaps filled in.
     * 
     * @example
     * <pre>
     * 
     *   var sequenceWithGaps = ...
     *
     *  // Predicate that determines if there is a gap.
     *  var gapExists = (pairA, pairB) => {
     *      // Returns true if there is a gap.
     *      return true;
     *  };
     *
     *  // Generator function that produces new rows to fill the game.
     *  var gapFiller = (pairA, pairB) => {
     *      // Create an array of index, value pairs that fill the gaps between pairA and pairB.
     *      return [
     *          newPair1,
     *          newPair2,
     *          newPair3,
     *      ];
     *  };
     *
     *  var sequenceWithoutGaps = sequenceWithGaps.fillGaps(gapExists, gapFiller);
     * </pre>
     */
    fillGaps (comparer: ComparerFn<[IndexT, ValueT], [IndexT, ValueT]>, generator: GapFillFn<[IndexT, ValueT], [IndexT, ValueT]>): IDataFrame<IndexT, ValueT>;

    /**
     * Returns the specified default dataframe if the input dataframe is empty. 
     *
     * @param defaultSequence Default dataframe to return if the input dataframe is empty.
     * 
     * @return Returns 'defaultSequence' if the input dataframe is empty. 
     * 
     * @example
     * <pre>
     * 
     * const emptyDataFrame = new DataFrame();
     * const defaultDataFrame = new DataFrame([ { A: 1 }, { A: 2 }, { A: 3 } ]);
     * expect(emptyDataFrame.defaultIfEmpty(defaultDataFrame)).to.eql(defaultDataFrame);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const nonEmptyDataFrame = new DataFrame([ { A: 100 }]);
     * const defaultDataFrame = new DataFrame([ { A: 1 }, { A: 2 }, { A: 3 } ]);
     * expect(nonEmptyDataFrame.defaultIfEmpty(defaultDataFrame)).to.eql(nonEmptyDataFrame);
     * </pre>
     */
    defaultIfEmpty (defaultSequence: ValueT[] | IDataFrame<IndexT, ValueT>): IDataFrame<IndexT, ValueT>;

    /**
     * Detect the the frequency of the types of the values in the dataframe.
     * This is a good way to understand the shape of your data.
     *
     * @return Returns a dataframe with rows that confirm to {@link ITypeFrequency} that describes the data types contained in the original dataframe.
     * 
     * @example
     * <pre>
     * 
     * const df = dataForge.readFileSync("./my-data.json").parseJSON();
     * const dataTypes = df.detectTypes();
     * console.log(dataTypes.toString());
     * </pre>
     */
    detectTypes (): IDataFrame<number, ITypeFrequency>;

    /**
     * Detect the frequency of the values in the dataframe.
     * This is a good way to understand the shape of your data.
     *
     * @return Returns a dataframe with rows that conform to {@link IValueFrequency} that describes the values contained in the original dataframe.
     * 
     * @example
     * <pre>
     * 
     * const df = dataForge.readFileSync("./my-data.json").parseJSON();
     * const dataValues = df.detectValues();
     * console.log(dataValues.toString());
     * </pre>
     */
    detectValues (): IDataFrame<number, IValueFrequency>;

    /**
     * Serialize the dataframe to the JSON data format.
     * 
     * @return Returns a string in the JSON data format that represents the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const jsonData = df.toJSON();
     * console.log(jsonData);
     * </pre>
     */
    toJSON (): string;

    /**
     * Serialize the dataframe to the JSON5 data format.
     * 
     * @return Returns a string in the JSON5 data format that represents the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const jsonData = df.toJSON5();
     * console.log(jsonData);
     * </pre>
     */
    toJSON5 (): string;

    /**
     * Serialize the dataframe to the CSV data format.
     * 
     * @return Returns a string in the CSV data format that represents the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const csvData = df.toCSV();
     * console.log(csvData);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const csvData = df.toCSV({ header: false });
     * console.log(csvData);
     * </pre>
     */
    toCSV (options?: ICSVOutputOptions): string;

    /**
     * Serialize the dataframe to HTML.
     * 
     * @return Returns a string in HTML format that represents the dataframe.
     */
    toHTML (): string;
    
    /**
     * Serialize the dataframe to an ordinary JavaScript data structure.
     * The resulting data structure is suitable for further serialization to JSON and can be used to 
     * transmit a DataFrame and its internal structure over the wire.
     * Use the {@link deserialize} function to later reconstitute the serialized dataframe.
     * 
     * @return Returns a JavaScript data structure conforming to {@link ISerializedDataFrame} that represents the dataframe and its internal structure.
     * 
     * @example
     * <pre>
     * 
     * const jsDataStructure = df.serialize();
     * const jsonData = JSON.stringify(jsDataStructure);
     * console.log(jsonData);
     * const deserializedJsDataStructure = JSON.parse(jsonData);
     * const deserializedDf = DataFrame.deserialize(deserializedJsDataStructure); // Reconsituted.
     * </pre>
     */
    serialize (): any;
}

/**
 * Interface to a dataframe that has been sorted.
 */
export interface IOrderedDataFrame<IndexT = number, ValueT = any, SortT = any> extends IDataFrame<IndexT, ValueT> {

    /** 
     * Applys additional sorting (ascending) to an already sorted dataframe.
     * 
     * @param selector User-defined selector that selects the additional value to sort by.
     * 
     * @return Returns a new dataframe has been additionally sorted by the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by salesperson and then by amount (from least to most).
     * const orderedDf = salesDf.orderBy(sale => sale.SalesPerson).thenBy(sale => sale.Amount);
     * </pre>
     */
    thenBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT>;

    /** 
     * Applys additional sorting (descending) to an already sorted dataframe.
     * 
     * @param selector User-defined selector that selects the additional value to sort by.
     * 
     * @return Returns a new dataframe has been additionally sorted by the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by salesperson and then by amount (from most to least).
     * const orderedDf = salesDf.orderBy(sale => sale.SalesPerson).thenByDescending(sale => sale.Amount);
     * </pre>
     */
    thenByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT>;
}

//
// Represents the contents of a dataframe.
//
interface IDataFrameContent<IndexT, ValueT> {
    index: Iterable<IndexT>;
    values: Iterable<ValueT>;
    pairs: Iterable<[IndexT, ValueT]>;

    columnNames: string[] | Iterable<string>,
    isBaked: boolean,
}

/**
 * Class that represents a dataframe.
 * A dataframe contains an indexed sequence of data records.
 * Think of it as a spreadsheet or CSV file in memory.
 * 
 * Each data record contains multiple named fields, the value of each field represents one row in a column of data.
 * Each column of data is a named {@link Series}.
 * You think of a dataframe a collection of named data series.
 * 
 * @typeparam IndexT The type to use for the index.
 * @typeparam ValueT The type to use for each row/data record.
 */
export class DataFrame<IndexT = number, ValueT = any> implements IDataFrame<IndexT, ValueT> {

    //
    // Function to lazy evaluate the configuration of the dataframe.
    //
    private configFn: DataFrameConfigFn<IndexT, ValueT> | null = null;
    
    //
    // The content of the dataframe.
    // When this is null it means the dataframe is yet to be lazy initialised.
    //
    private content: IDataFrameContent<IndexT, ValueT> | null = null;
    
    private static readonly defaultCountIterable = new CountIterable();
    private static readonly defaultEmptyIterable = new EmptyIterable();
    
    //
    // Initialise dataframe content from an iterable of values.
    //
    private static initFromArray<IndexT, ValueT>(arr: Iterable<ValueT>): IDataFrameContent<IndexT, ValueT> {
        const firstResult = arr[Symbol.iterator]().next();
        const columnNames = !firstResult.done ? Object.keys(firstResult.value) : [];
        return {
            index: DataFrame.defaultCountIterable,
            values: arr,
            pairs: new MultiIterable([DataFrame.defaultCountIterable, arr]),
            isBaked: true,
            columnNames: columnNames,
        };
    }

    //
    // Initialise an empty dataframe.
    //
    private static initEmpty<IndexT, ValueT>(): IDataFrameContent<IndexT, ValueT> {
        return {
            index: DataFrame.defaultEmptyIterable,
            values: DataFrame.defaultEmptyIterable,
            pairs: DataFrame.defaultEmptyIterable,
            isBaked: true,
            columnNames: [],
        };
    }

    //
    // Initialise dataframe column names.
    //
    private static initColumnNames(inputColumnNames: Iterable<string>): Iterable<string> {
        const outputColumnNames: string[] = [];
        const columnNamesMap: any = {};
    
        // Search for duplicate column names.
        for (const columnName of inputColumnNames) {
            const columnNameLwr = columnName.toLowerCase();
            if (columnNamesMap[columnNameLwr] === undefined) {
                columnNamesMap[columnNameLwr] = 1;
            }
            else {
                columnNamesMap[columnNameLwr] += 1;
            }
        }

        const columnNoMap: any = {};

        for (const columnName of inputColumnNames) {
            const columnNameLwr = columnName.toLowerCase();
            if (columnNamesMap[columnNameLwr] > 1) {
                let curColumnNo = 1;

                // There are duplicates of this column.
                if (columnNoMap[columnNameLwr] !== undefined) {
                    curColumnNo = columnNoMap[columnNameLwr];
                }

                outputColumnNames.push(columnName + "." + curColumnNo);
                columnNoMap[columnNameLwr] = curColumnNo + 1;
            }
            else {
                // No duplicates.
                outputColumnNames.push(columnName);
            }
        }

        return outputColumnNames;
    }

    //
    // Check that a value is an interable.
    //
    private static checkIterable<T>(input: T[] | Iterable<T>, fieldName: string): void {
        if (isArray(input)) {
            // Ok
        }
        else if (isFunction(input[Symbol.iterator])) {
            // Assume it's an iterable.
            // Ok
        }
        else {
            // Not ok
            throw new Error("Expected '" + fieldName + "' field of DataFrame config object to be an array of values or an iterable of values.");
        }
    };

    //
    // Initialise dataframe content from a config object.
    //
    private static initFromConfig<IndexT, ValueT>(config: IDataFrameConfig<IndexT, ValueT>): IDataFrameContent<IndexT, ValueT> {

        let index: Iterable<IndexT>;
        let values: Iterable<ValueT>;
        let pairs: Iterable<[IndexT, ValueT]> | undefined;
        let isBaked = false;
        let columnNames: Iterable<string>;

        if (config.pairs) {
            DataFrame.checkIterable<[IndexT, ValueT]>(config.pairs, "pairs");
            pairs = config.pairs;
        }
        
        if (config.columns) {
            let columnsConfig: any = config.columns;

            if (isArray(columnsConfig) ||
                isFunction((columnsConfig as any)[Symbol.iterator])) {

                const iterableColumnsConfig = columnsConfig as Iterable<IColumnConfig>;
                columnNames = Array.from(iterableColumnsConfig).map(column => column.name);
                columnsConfig = toMap(iterableColumnsConfig, column => column.name, column => column.series);
            }
            else {
                if (!isObject(columnsConfig)) throw new Error("Expected 'columns' member of 'config' parameter to DataFrame constructor to be an object with fields that define columns.");

                columnNames = Object.keys(columnsConfig);
            }

            let columnIterables: any[] = [];
            for (let columnName of columnNames) {
                DataFrame.checkIterable(columnsConfig[columnName], columnName);
                columnIterables.push(columnsConfig[columnName]);
            }

            values = new CsvRowsIterable(columnNames, new MultiIterable(columnIterables));
        }
        else {
            if (config.columnNames) {
                columnNames = this.initColumnNames(config.columnNames);
            }

            if (config.rows) {
                if (!config.columnNames) {
                    columnNames = new SelectIterable(new CountIterable(), c => "Column." + c.toString());
                }

                DataFrame.checkIterable<any[][]>(config.rows, 'rows')
                values = new CsvRowsIterable(columnNames!, config.rows); // Convert data from rows to columns.
            }
            else if (config.values) {
                DataFrame.checkIterable<ValueT>(config.values, 'values')
                values = config.values;
                if (!config.columnNames) {
                    columnNames = new ColumnNamesIterable(values, config.considerAllRows || false);
                }
            }
            else if (pairs) {
                values = new ExtractElementIterable(pairs, 1);
                if (!config.columnNames) {
                    columnNames = new ColumnNamesIterable(values, config.considerAllRows || false);
                }
            }
            else {
                values = DataFrame.defaultEmptyIterable;
                if (!config.columnNames) {
                    columnNames = DataFrame.defaultEmptyIterable;
                }
            }
        }

        if (config.index) {
            DataFrame.checkIterable<IndexT>(config.index, 'index');
            index = config.index;
        }
        else if (pairs) {
            index = new ExtractElementIterable(pairs, 0);
        }
        else {
            index = DataFrame.defaultCountIterable;
        }

        if (!pairs) {
            pairs = new MultiIterable([index, values]);
        }

        if (config.baked !== undefined) {
            isBaked = config.baked;
        }

        return {
            index: index,
            values: values,
            pairs: pairs,
            isBaked: isBaked,
            columnNames: columnNames!,
        };
    }

    /**
     * Create a dataframe.
     * 
     * @param config This can be an array, a configuration object or a function that lazily produces a configuration object. 
     * 
     * It can be an array that specifies the data records that the dataframe contains.
     * 
     * It can be a {@link IDataFrameConfig} that defines the data and configuration of the dataframe.
     * 
     * Or it can be a function that lazily produces a {@link IDataFrameConfig}.
     * 
     * @example
     * <pre>
     * 
     * const df = new DataFrame();
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const df = new DataFrame([ { A: 10 }, { A: 20 }, { A: 30 }, { A: 40 }]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const df = new DataFrame({ index: [1, 2, 3, 4], values: [ { A: 10 }, { A: 20 }, { A: 30 }, { A: 40 }] });
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const lazyInit = () => ({ index: [1, 2, 3, 4], values: [ { A: 10 }, { A: 20 }, { A: 30 }, { A: 40 }] });
     * const df = new DataFrame(lazyInit);
     * </pre>
     */
    constructor(config?: Iterable<ValueT> | IDataFrameConfig<IndexT, ValueT> | DataFrameConfigFn<IndexT, ValueT>) {
        if (config) {
            if (isFunction(config)) {
                this.configFn = config;
            }
            else if (isArray(config) || 
                     isFunction((config as any)[Symbol.iterator])) {
                this.content = DataFrame.initFromArray(config as Iterable<ValueT>);
            }
            else {
                this.content = DataFrame.initFromConfig(config as IDataFrameConfig<IndexT, ValueT>);
            }
        }
        else {
            this.content = DataFrame.initEmpty();
        }
    }

    //
    // Ensure the dataframe content has been initialised.
    //
    private lazyInit() {
        if (this.content === null && this.configFn !== null) {
            this.content = DataFrame.initFromConfig(this.configFn());
        }
    }

    //
    // Ensure the dataframe content is lazy initalised and return it.
    //
    private getContent(): IDataFrameContent<IndexT, ValueT> { 
        this.lazyInit();
        return this.content!;
    }
    
    /**
     * Get an iterator to enumerate the rows of the dataframe.
     * Enumerating the iterator forces lazy evaluation to complete.
     * This function is automatically called by `for...of`.
     * 
     * @return An iterator for the dataframe.
     * 
     * @example
     * <pre>
     * 
     * for (const row of df) {
     *     // ... do something with the row ...
     * }
     * </pre>
     */
    [Symbol.iterator](): Iterator<any> {
        return this.getContent().values[Symbol.iterator]();
    }

    /**
     * Get the names of the columns in the dataframe.
     * 
     * @return Returns an array of the column names in the dataframe.  
     * 
     * @example
     * <pre>
     * 
     * console.log(df.getColumnNames());
     * </pre>
     */
    getColumnNames (): string[] {
        return Array.from(this.getContent().columnNames);
    }

    /** 
     * Retreive the collection of all columns in the dataframe.
     * 
     * @return Returns a {@link Series} containing the names of the columns in the dataframe.
     * 
     * @example
     * <pre>
     * 
     * for (const column in df.getColummns()) {
     *      console.log("Column name: ");
     *      console.log(column.name);
     * 
     *      console.log("Data:");
     *      console.log(column.series.toArray());
     * }
     * </pre>
     */
    getColumns (): ISeries<number, IColumn> {
        return new Series<number, IColumn>(() => {
            const columnNames = this.getColumnNames();
            return {
                values: columnNames.map(columnName => {
                    const series = this.getSeries(columnName).skipWhile(value => value === undefined || value === null);
                    const firstValue = series.any() ? series.first() : undefined;
                    return {
                        name: columnName,
                        type: determineType(firstValue), //TODO: Should cache the type.
                        series: series,
                    };
                }),
            };
        });
    }    

    /**
     * Cast the value of the dataframe to a new type.
     * This operation has no effect but to retype the value that the dataframe contains.
     * 
     * @return The same dataframe, but with the type changed.
     * 
     * @example
     * <pre>
     * 
     * const castDf = df.cast<SomeOtherType>();
     * </pre>
     */
    cast<NewValueT> (): IDataFrame<IndexT, NewValueT> {
        return this as any as IDataFrame<IndexT, NewValueT>;
    }
    
    /**
     * Get the index for the dataframe.
     * 
     * @return The {@link Index} for the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const index = df.getIndex();
     * </pre>
     */
    getIndex (): IIndex<IndexT> {
        return new Index<IndexT>(() => ({ values: this.getContent().index }));
    }

    /**
     * Set a named column as the {@link Index} of the dataframe.
     *
     * @param columnName Name of the column to use as the new {@link Index} of the returned dataframe.
     *
     * @return Returns a new dataframe with the values of the specified column as the new {@link Index}.
     * 
     * @example
     * <pre>
     * 
     * const indexedDf = df.setIndex("SomeColumn");
     * </pre>
     */
    setIndex<NewIndexT = any> (columnName: string): IDataFrame<NewIndexT, ValueT> {
        if (!isString(columnName)) throw new Error("Expected 'columnName' parameter to 'DataFrame.setIndex' to be a string that specifies the name of the column to set as the index for the dataframe.");

        return this.withIndex<NewIndexT>(this.getSeries(columnName));
    }
    
    /**
     * Apply a new {@link Index} to the dataframe.
     * 
     * @param newIndex The new array or iterable to be the new {@link Index} of the dataframe. Can also be a selector to choose the {@link Index} for each row in the dataframe.
     * 
     * @return Returns a new dataframe or dataframe with the specified {@link Index} attached.
     * 
     * @example
     * <pre>
     * 
     * const indexedDf = df.withIndex([10, 20, 30]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const indexedDf = df.withIndex(df.getSeries("SomeColumn"));
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const indexedDf = df.withIndex(row => row.SomeColumn);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const indexedDf = df.withIndex(row => row.SomeColumn + 20);
     * </pre>
     */
    withIndex<NewIndexT> (newIndex: Iterable<NewIndexT> | SelectorFn<ValueT, NewIndexT>): IDataFrame<NewIndexT, ValueT> {

        if (isFunction(newIndex)) {
            return new DataFrame<NewIndexT, ValueT>(() => {
                const content = this.getContent();
                return {
                    columnNames: content.columnNames,
                    values: content.values,
                    index: this.deflate(newIndex),
                };
            });
        }
        else {
            DataFrame.checkIterable(newIndex as Iterable<NewIndexT>, 'newIndex');

            return new DataFrame<NewIndexT, ValueT>(() => {
                const content = this.getContent();
                return {
                    columnNames: content.columnNames,
                    values: content.values,
                    index: newIndex as Iterable<NewIndexT>,
                };
            });
        }
    }

    /**
     * Resets the {@link Index} of the dataframe back to the default zero-based sequential integer index.
     * 
     * @return Returns a new dataframe with the {@link Index} reset to the default zero-based index. 
     * 
     * @example
     * <pre>
     * 
     * const dfWithResetIndex = df.resetIndex();
     * </pre>
     */
    resetIndex (): IDataFrame<number, ValueT> {
        return new DataFrame<number, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: content.values,
                // Strip the index.
            };
        });
    }
    
    /**
     * Extract a {@link Series} from a named column in the dataframe.
     *
     * @param columnName Specifies the name of the column that contains the {@link Series} to retreive.
     * 
     * @return Returns the {@link Series} extracted from the named column in the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const series = df.getSeries("SomeColumn");
     * </pre>
     */
    getSeries<SeriesValueT = any> (columnName: string): ISeries<IndexT, SeriesValueT> {

        if (!isString(columnName)) throw new Error("Expected 'columnName' parameter to 'DataFrame.getSeries' function to be a string that specifies the name of the column to retreive.");

        return new Series<IndexT, SeriesValueT>(() => ({
            values: new SelectIterable<ValueT, SeriesValueT>(
                this.getContent().values, 
                (row: any) => row[columnName],
            ),
            index: this.getContent().index,
        }));
    }

    /**
     * Determine if the dataframe contains a {@link Series} the specified named column.
     *
     * @param columnName Name of the column to check for.
     * 
     * @return Returns true if the dataframe contains the requested {@link Series}, otherwise returns false.
     * 
     * @example
     * <pre>
     * 
     * if (df.hasSeries("SomeColumn")) {
     *      // ... the dataframe contains a series with the specified column name ...
     * }
     * </pre>
     */
    hasSeries (columnName: string): boolean {
        const columnNameLwr = columnName.toLowerCase();
        for (let existingColumnName of this.getColumnNames()) {
            if (existingColumnName.toLowerCase() === columnNameLwr) {
                return true;
            }
        }

        return false;
    }
    
    /**
     * Verify the existence of a name column and extracts the {@link Series} for it.
     * Throws an exception if the requested column doesn't exist.
     *
     * @param columnName Name of the column to extract.
     * 
     * @return Returns the {@link Series} for the column if it exists, otherwise it throws an exception.
     * 
     * @example
     * <pre>
     * 
     * try {
     *      const series = df.expectSeries("SomeColumn");
     *      // ... do something with the series ...
     * }
     * catch (err) {
     *      // ... the dataframe doesn't contain the column "SomeColumn" ...
     * }
     * </pre>
     */
    expectSeries<SeriesValueT> (columnName: string): ISeries<IndexT, SeriesValueT> {
        if (!this.hasSeries(columnName)) {
            throw new Error("Expected dataframe to contain series with column name: '" + columnName + "'.");
        }

        return this.getSeries(columnName);
    }

    /**
     * Create a new dataframe with a replaced or additional column specified by the passed-in series.
     *
     * @param columnNameOrSpec The name of the column to add or replace or a {@link IColumnGenSpec} that defines the columns to add.
     * @param [series] When columnNameOrSpec is a string that identifies the column to add, this specifies the {@link Series} to add to the dataframe or a function that produces a series (given a dataframe).
     *
     * @return Returns a new dataframe replacing or adding a particular named column.
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.withSeries("ANewColumn", new Series([1, 2, 3]));
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.withSeries("ANewColumn", df => 
     *      df.getSeries("SourceData").select(aTransformation)
     * );
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.withSeries({
     *      ANewColumn: new Series([1, 2, 3]),
     *      SomeOtherColumn: new Series([10, 20, 30])
     * });
     * <pre>
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.withSeries({
     *      ANewColumn: df => df.getSeries("SourceData").select(aTransformation))
     * });
     * <pre>
     */
    withSeries<OutputValueT = any, SeriesValueT = any> (columnNameOrSpec: string | IColumnGenSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, OutputValueT> {

        if (!isObject(columnNameOrSpec)) {
            if (!isString(columnNameOrSpec)) throw new Error("Expected 'columnNameOrSpec' parameter to 'DataFrame.withSeries' function to be a string that specifies the column to set or replace.");
            if (!isFunction(series as Object)) {
                if (!isObject(series)) throw new Error("Expected 'series' parameter to 'DataFrame.withSeries' to be a Series object or a function that takes a dataframe and produces a Series.");
            }
        }
        else {
            if (!isUndefined(series)) throw new Error("Expected 'series' parameter to 'DataFrame.withSeries' to not be set when 'columnNameOrSpec is an object.");
        }

        if (isObject(columnNameOrSpec)) {
            const columnSpec: IColumnGenSpec = <IColumnGenSpec> columnNameOrSpec;
            const columnNames = Object.keys(columnSpec);
            let workingDataFrame: IDataFrame<IndexT, ValueT> = this;
            for (const columnName of columnNames) {
                workingDataFrame = workingDataFrame.withSeries(columnName, columnSpec[columnName]);
            }

            return workingDataFrame.cast<OutputValueT>();
        }

        const columnName: string = <string> columnNameOrSpec;

        if (this.none()) { // We have an empty data frame.
            let importSeries: ISeries<IndexT, SeriesValueT>;
    
            if (isFunction(series as Object)) {
                importSeries = (series! as SeriesSelectorFn<IndexT, ValueT, SeriesValueT>)(this);
            }
            else { 
                importSeries = series! as ISeries<IndexT, SeriesValueT>;
            }
                
            
            return importSeries.inflate<ValueT>(value => {
                    var row: any = {};
                    row[columnName] = value;
                    return row;
                })
                .cast<OutputValueT>();
        }

        return new DataFrame<IndexT, OutputValueT>(() => {    
            let importSeries: ISeries<IndexT, SeriesValueT>;
    
            if (isFunction(series as Object)) {
                importSeries = (series! as SeriesSelectorFn<IndexT, ValueT, SeriesValueT>)(this);
            }
            else { 
                importSeries = series! as ISeries<IndexT, SeriesValueT>;
            }

            const seriesValueMap = toMap2(importSeries.toPairs(), pair => pair[0], pair => pair[1]);
            const newColumnNames =  makeDistinct(this.getColumnNames().concat([columnName]));
    
            return {
                columnNames: newColumnNames,
                index: this.getContent().index,
                pairs: new SelectIterable<[IndexT, ValueT], [IndexT, OutputValueT]>(this.getContent().pairs, pair => {
                    const index = pair[0];
                    const value = pair[1];
                    const modified: any = Object.assign({}, value);
                    modified[columnName] = seriesValueMap.get(index);
                    return [
                        index,
                        modified
                    ];
                }),
            };
        });
    }

    /**
     * Merge multiple dataframes into a single dataframe.
     * Rows are merged by indexed. 
     * Same named columns in subsequent dataframes override columns earlier dataframes.
     * 
     * @param dataFrames An array or series of dataframes to merge.
     * 
     * @returns The merged data frame.
     * 
     * @example
     * <pre>
     * 
     * const mergedDF = DataFrame.merge([df1, df2, etc]);
     * </pre>
     */
    static merge<MergedValueT = any, IndexT = any, ValueT = any>(dataFrames: Iterable<IDataFrame<IndexT, ValueT>>): IDataFrame<IndexT, MergedValueT> {

        const rowMap = new Map<IndexT, any>();
        for (const dataFrame of dataFrames) {
            for (const pair of dataFrame.toPairs()) {
                const index = pair[0];
                if (!rowMap.has(index)) {
                    const clone = Object.assign({}, pair[1]);
                    rowMap.set(index, clone);
                }
                else {
                    rowMap.set(index, Object.assign(rowMap.get(index), pair[1]));
                }
            }
        }

        const allColumnNames = Array.from(dataFrames)
            .map(dataFrame => dataFrame.getColumnNames())
            .reduce((prev, next) => prev.concat(next), []);
        const newColumnNames =  makeDistinct(allColumnNames);
        const mergedPairs = Array.from(rowMap.keys()).map(index => [index, rowMap.get(index)]);

        mergedPairs.sort((a, b) => { // Sort by index, ascending.
            if (a[0] === b[0]) {
                return 0;
            }
            else if (a[0] > b[0]) {
                return 1;
            }
            else {
                return -1;
            }
        });

        return new DataFrame<IndexT, MergedValueT>({
            columnNames: newColumnNames,
            pairs: mergedPairs as [IndexT, MergedValueT][],
        });
    }  

    /**
     * Merge one or more dataframes into this dataframe.
     * Rows are merged by indexed. 
     * Same named columns in subsequent dataframes override columns in earlier dataframes.
     * 
     * @param otherDataFrames... One or more dataframes to merge into this dataframe.
     * 
     * @returns The merged data frame.
     * 
     * @example
     * <pre>
     * 
     * const mergedDF = df1.merge(df2);
     * </pre>
     * 
     * <pre>
     * 
     * const mergedDF = df1.merge(df2, df3, etc);
     * </pre>
     */
    merge<MergedValueT = ValueT>(...otherDataFrames: IDataFrame<IndexT, any>[]): IDataFrame<IndexT, MergedValueT> {
        return DataFrame.merge<MergedValueT, IndexT, any>([this as IDataFrame<IndexT, ValueT>].concat(otherDataFrames));
    }
    
    /**
     * Add a series to the dataframe, but only if it doesn't already exist.
     * 
     * @param columnNameOrSpec The name of the series to add or a {@link IColumnGenSpec} that specifies the columns to add.
     * @param [series] If columnNameOrSpec is a string that specifies the name of the series to add, this specifies the actual {@link Series} to add or a selector that generates the series given the dataframe.
     * 
     * @return Returns a new dataframe with the specified series added, if the series didn't already exist. Otherwise if the requested series already exists the same dataframe is returned.
     * 
     * @example
     * <pre>
     * 
     * const updatedDf = df.ensureSeries("ANewColumn", new Series([1, 2, 3]));
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const updatedDf = df.ensureSeries("ANewColumn", df => 
     *      df.getSeries("AnExistingSeries").select(aTransformation)
     * );
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.ensureSeries({
     *      ANewColumn: new Series([1, 2, 3]),
     *      SomeOtherColumn: new Series([10, 20, 30])
     * });
     * <pre>
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.ensureSeries({
     *      ANewColumn: df => df.getSeries("SourceData").select(aTransformation))
     * });
     * <pre>
     */
    ensureSeries<SeriesValueT> (columnNameOrSpec: string | IColumnGenSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, ValueT> {

        if (!isObject(columnNameOrSpec)) {
            if (!isString(columnNameOrSpec)) throw new Error("Expected 'columnNameOrSpec' parameter to 'DataFrame.ensureSeries' function to be a string that specifies the column to set or replace.");
            if (!isFunction(series as Object)) {
                if (!isObject(series)) throw new Error("Expected 'series' parameter to 'DataFrame.ensureSeries' to be a Series object or a function that takes a dataframe and produces a Series.");
            }
        }
        else {
            if (!isUndefined(series)) throw new Error("Expected 'series' parameter to 'DataFrame.ensureSeries' to not be set when 'columnNameOrSpec is an object.");
        }

        if (isObject(columnNameOrSpec)) {
            const columnSpec: IColumnGenSpec = <IColumnGenSpec> columnNameOrSpec;
            const columnNames = Object.keys(columnNameOrSpec);
            let workingDataFrame = <IDataFrame<IndexT,any>> this;
            for (const columnName of columnNames) {
                workingDataFrame = workingDataFrame.ensureSeries(columnName, columnSpec[columnName]);
            }

            return workingDataFrame;
        }

        const columnName: string = <string> columnNameOrSpec;
        if (this.hasSeries(columnName)) {
            return this; // Already have the series.
        }
        else {
            return this.withSeries(columnName, series);
        }
    }    

    /**
     * Create a new dataframe with just a subset of columns.
     *
     * @param columnNames Array of column names to include in the new dataframe.
     * 
     * @return Returns a dataframe with a subset of columns from the original dataframe.
     * 
     * @example
     * <pre>
     * const subsetDf = df.subset(["ColumnA", "ColumnB"]);
     * </pre>
     */
    subset<NewValueT = ValueT> (columnNames: string[]): IDataFrame<IndexT, NewValueT> {
        if (!isArray(columnNames)) throw new Error("Expected 'columnNames' parameter to 'DataFrame.subset' to be an array of column names to keep.");	

        return new DataFrame<IndexT, NewValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: columnNames,
                index: content.index,
                values: new SelectIterable<ValueT, NewValueT>(content.values, (value: any) => {
                    const output: any = {};
                    for (const columnName of columnNames) {
                        output[columnName] = value[columnName];
                    }
                    return output;
                }),
                pairs: new SelectIterable<[IndexT, ValueT], [IndexT, NewValueT]>(content.pairs, (pair: any) => {
                    const output: any = {};
                    const value = pair[1];
                    for (const columnName of columnNames) {
                        output[columnName] = value[columnName];
                    }
                    return [pair[0], output];
                }),
            }
        });
    };
    
    /**
     * Create a new dataframe with the requested column or columns dropped.
     *
     * @param columnOrColumns Specifies the column name (a string) or columns (array of strings) to drop.
     * 
     * @return Returns a new dataframe with a particular named column or columns removed.
     * 
     * @example
     * <pre>
     * const modifiedDf = df.dropSeries("SomeColumn");
     * </pre>
     * 
     * @example
     * <pre>
     * const modifiedDf = df.dropSeries(["ColumnA", "ColumnB"]);
     * </pre>
     */
    dropSeries<NewValueT = ValueT> (columnOrColumns: string | string[]): IDataFrame<IndexT, NewValueT> {

        if (!isArray(columnOrColumns)) {
            if (!isString(columnOrColumns)) throw new Error("'DataFrame.dropSeries' expected either a string or an array or strings.");

            columnOrColumns = [columnOrColumns]; // Convert to array for coding convenience.
        }

        return new DataFrame<IndexT, NewValueT>(() => {
            const content = this.getContent();
            const newColumnNames = [];
            for (const columnName of content.columnNames) {
                if (columnOrColumns.indexOf(columnName) === -1) {
                    newColumnNames.push(columnName); // This column is not being dropped.
                }
            }

            return {
                columnNames: newColumnNames,
                index: content.index,
                values: new SelectIterable<ValueT, NewValueT>(content.values, value => {
                    const clone: any = Object.assign({}, value);
                    for (const droppedColumnName of columnOrColumns) {
                        delete clone[droppedColumnName];
                    }
                    return clone;
                }),
                pairs: new SelectIterable<[IndexT, ValueT], [IndexT, NewValueT]>(content.pairs, pair => {
                    const clone: any = Object.assign({}, pair[1]);
                    for (const droppedColumnName of columnOrColumns) {
                        delete clone[droppedColumnName];
                    }
                    return [pair[0], clone];
                }),
            };
        });
    }
        
    /**
     * Create a new dataframe with columns reordered.
     * New column names create new columns (with undefined values), omitting existing column names causes those columns to be dropped.
     * 
     * @param columnNames Specifies the new order for columns.
     * 
     * @return Returns a new dataframe with columns reodered according to the order of the array of column names that is passed in.
     * 
     * @example
     * <pre>
     * const reorderedDf = df.reorderSeries(["FirstColumn", "SecondColumn", "etc"]);
     * </pre>
     */
    reorderSeries<NewValueT = ValueT> (columnNames: string[]): IDataFrame<IndexT, NewValueT> {

        if (!isArray(columnNames)) throw new Error("Expected parameter 'columnNames' to 'DataFrame.reorderSeries' to be an array with column names.");

        for (const columnName of columnNames) {
            if (!isString(columnName)) throw new Error("Expected parameter 'columnNames' to 'DataFrame.reorderSeries' to be an array with column names.");
        }

        return new DataFrame<IndexT, NewValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: columnNames,
                index: content.index,
                values: new SelectIterable<ValueT, NewValueT>(content.values, (value: any) => {
                    const output: any = {};
                    for (const columnName of columnNames) {
                        output[columnName] = value[columnName];
                    }

                    return <NewValueT> output;
                }),
                pairs:  new SelectIterable<[IndexT, ValueT], [IndexT, NewValueT]>(content.pairs, (pair: [IndexT, ValueT]) => {
                    const value: any = <any> pair[1];
                    const output: any = {};
                    for (const columnName of columnNames) {
                        output[columnName] = value[columnName];
                    }

                    return [pair[0], <NewValueT> output];
                }),
            };
        });
    }   

    /**
     * Bring the column(s) with specified name(s) to the front of the column order, making it (or them) the first column(s) in the output dataframe.
     *
     * @param columnOrColumns Specifies the column or columns to bring to the front.
     *
     * @return Returns a new dataframe with 1 or more columns bought to the front of the column ordering.
     * 
     * @example
     * <pre>
     * const modifiedDf = df.bringToFront("NewFirstColumn");
     * </pre>
     * 
     * @example
     * <pre>
     * const modifiedDf = df.bringToFront(["NewFirstColumn", "NewSecondColumn"]);
     * </pre>
     */
    bringToFront (columnOrColumns: string | string[]): IDataFrame<IndexT, ValueT> {

        if (isArray(columnOrColumns)) {
            for (const columnName of columnOrColumns) {
                if (!isString(columnName)) {
                    throw new Error("Expect 'columnOrColumns' parameter to 'DataFrame.bringToFront' function to specify a column or columns via a string or an array of strings.");	
                }
            }
        }
        else {
            if (!isString(columnOrColumns)) {
                throw new Error("Expect 'columnOrColumns' parameter to 'DataFrame.bringToFront' function to specify a column or columns via a string or an array of strings.");
            }

            columnOrColumns = [columnOrColumns]; // Convert to array for coding convenience.
        }

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            const existingColumns = Array.from(content.columnNames);
            const columnsToMove: string[] = [];
            for (const columnToMove of columnOrColumns) {
                if (existingColumns.indexOf(columnToMove) !== -1) {
                    // The request column actually exists, so we will move it.
                    columnsToMove.push(columnToMove);
                }
            }

            const untouchedColumnNames: string[] = [];
            for (const existingColumnName of existingColumns) {
                if (columnOrColumns.indexOf(existingColumnName) === -1) {
                    untouchedColumnNames.push(existingColumnName);
                }
            }
            
            return {
                columnNames: columnsToMove.concat(untouchedColumnNames),
                index: content.index,
                values: content.values,
                pairs: content.pairs,
            };
        })
    }

    /**
     * Bring the column(s) with specified name(s) to the back of the column order, making it (or them) the last column(s) in the output dataframe.
     *
     * @param columnOrColumns Specifies the column or columns to bring to the back.
     *
     * @return Returns a new dataframe with 1 or more columns bought to the back of the column ordering.
     * 
     * @example
     * <pre>
     * const modifiedDf = df.bringToBack("NewLastColumn");
     * </pre>
     * 
     * @example
     * <pre>
     * const modifiedDf = df.bringToBack(["NewSecondLastCollumn, ""NewLastColumn"]);
     * </pre>
     */
    bringToBack (columnOrColumns: string | string[]): IDataFrame<IndexT, ValueT> {

        if (isArray(columnOrColumns)) {
            for (const columnName of columnOrColumns) {
                if (!isString(columnName)) {
                    throw new Error("Expect 'columnOrColumns' parameter to 'DataFrame.bringToBack' function to specify a column or columns via a string or an array of strings.");	
                }
            }
        }
        else {
            if (!isString(columnOrColumns)) {
                throw new Error("Expect 'columnOrColumns' parameter to 'DataFrame.bringToBack' function to specify a column or columns via a string or an array of strings.");
            }

            columnOrColumns = [columnOrColumns]; // Convert to array for coding convenience.
        }

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            const existingColumns = Array.from(content.columnNames);
            const columnsToMove: string[] = [];
            for (const columnToMove of columnOrColumns) {
                if (existingColumns.indexOf(columnToMove) !== -1) {
                    // The request column actually exists, so we will move it.
                    columnsToMove.push(columnToMove);
                }
            }

            const untouchedColumnNames: string[] = [];
            for (const existingColumnName of existingColumns) {
                if (columnOrColumns.indexOf(existingColumnName) === -1) {
                    untouchedColumnNames.push(existingColumnName);
                }
            }
            
            return {
                columnNames: untouchedColumnNames.concat(columnsToMove),
                index: content.index,
                values: content.values,
                pairs: content.pairs,
            };
        })
    }
    
    /**
     * Create a new dataframe with 1 or more columns renamed.
     *
     * @param newColumnNames A column rename spec - a JavaScript hash that maps existing column names to new column names.
     * 
     * @return Returns a new dataframe with specified columns renamed.
     * 
     * @example
     * <pre>
     * 
     * const renamedDf = df.renameSeries({ OldColumnName, NewColumnName });
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const renamedDf = df.renameSeries({ 
     *      Column1: ColumnA,
     *      Column2: ColumnB
     * });
     * </pre>
     */
    renameSeries<NewValueT = ValueT> (newColumnNames: IColumnRenameSpec): IDataFrame<IndexT, NewValueT> {

        if (!isObject(newColumnNames)) throw new Error("Expected parameter 'newColumnNames' to 'DataFrame.renameSeries' to be an array with column names.");

        const existingColumnsToRename = Object.keys(newColumnNames);
        for (const existingColumnName of existingColumnsToRename) {
            if (!isString(existingColumnName)) throw new Error("Expected existing column name '" + existingColumnName + "' of 'newColumnNames' parameter to 'DataFrame.renameSeries' to be a string.");
            if (!isString(newColumnNames[existingColumnName])) throw new Error("Expected new column name '" + newColumnNames[existingColumnName] + "' for existing column '" + existingColumnName + "' of 'newColumnNames' parameter to 'DataFrame.renameSeries' to be a string.");
        }

        return new DataFrame<IndexT, NewValueT>(() => {
            const content = this.getContent();
            const renamedColumns: string[] = [];

            for (const existingColumnName of content.columnNames) { // Convert the column rename spec to array of new column names.
                const columnIndex = existingColumnsToRename.indexOf(existingColumnName);
                if (columnIndex === -1) {
                    renamedColumns.push(existingColumnName); // This column is not renamed.                    
                }
                else {
                    renamedColumns.push(newColumnNames[existingColumnName]); // This column is renamed.
                }
            }
    
            //
            // Remap each row of the data frame to the new column names.
            //
            function remapValue (value: any): any {
                const clone = Object.assign({}, value);
    
                for (const existingColumName of existingColumnsToRename) {
                    clone[newColumnNames[existingColumName]] = clone[existingColumName];
                    delete clone[existingColumName];
                }
    
                return clone;
            }
    
            return {
                columnNames: renamedColumns,
                index: content.index,
                values: new SelectIterable<ValueT, NewValueT>(content.values, remapValue),
                pairs: new SelectIterable<[IndexT, ValueT], [IndexT, NewValueT]>(content.pairs, pair => {
                    return [pair[0], remapValue(pair[1])];
                }),
            };
        });
    };
    
    /**
    * Extract values from the dataframe as an array.
    * This forces lazy evaluation to complete.
    * 
    * @return Returns an array of the values contained within the dataframe. 
    * 
    * @example
    * <pre>
    * const values = df.toArray();
    * </pre>
    */
    toArray (): any[] {
        const values = [];
        for (const value of this.getContent().values) {
            if (value !== undefined && value !== null) {
                values.push(value);
            }
        }
        return values;
    }

    /**
     * Retreive the index and values pairs from the dataframe as an array.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     * 
     * @return Returns an array of pairs that contains the dataframe content. Each pair is a two element array that contains an index and a value.  
     * 
     * @example
     * <pre>
     * const pairs = df.toPairs();
     * </pre>
     */
    toPairs (): ([IndexT, ValueT])[] {
        const pairs = [];
        for (const pair of this.getContent().pairs) {
            if (pair[1] != undefined && pair[1] !== null) {
                pairs.push(pair);
            }
        }
        return pairs;
    }

    /**
     * Convert the dataframe to a JavaScript object.
     *
     * @param keySelector Function that selects keys for the resulting object.
     * @param valueSelector Function that selects values for the resulting object.
     * 
     * @return Returns a JavaScript object generated from the dataframe by applying the key and value selector functions. 
     * 
     * @example
     * <pre>
     * 
     * const someObject = df.toObject(
     *      row => row.SomeColumn, // Specify the column to use for fields in the object.
     *      row => row.SomeOtherColumn // Specifi the column to use as the value for each field.
     * );
     * </pre>
     */
    toObject<KeyT = any, FieldT = any, OutT = any> (keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT {

        if (!isFunction(keySelector)) throw new Error("Expected 'keySelector' parameter to DataFrame.toObject to be a function.");
        if (!isFunction(valueSelector)) throw new Error("Expected 'valueSelector' parameter to DataFrame.toObject to be a function.");

        return toMap(this, keySelector, valueSelector);
    }
    
    /**
     * Bake the data frame to an array of rows were each rows is an array of values in column order.
     * 
     * @return Returns an array of rows. Each row is an array of values in column order.
     * 
     * @example
     * <pre>
     * const rows = df.toRows();
     * </pre>
     */
    toRows (): any[][] {
        const columnNames = this.getColumnNames();
        const rows = [];
        for (const value of this.getContent().values) {
            const row = [];
            for (let columnIndex = 0; columnIndex < columnNames.length; ++columnIndex) {
                row.push((<any>value)[columnNames[columnIndex]]);
            }

            rows.push(row);
        }
        
        return rows;
    }

    /**
     * Generates a new dataframe by repeatedly calling a selector function on each row in the original dataframe.
     *
     * @param selector Selector function that transforms each row to create the new dataframe.
     * 
     * @return Returns a new dataframe that has been transformed by the selector function.
     * 
     * @example
     * <pre>
     * 
     * function transformRow (inputRow) {
     *      const outputRow = {
     *          // ... construct output row derived from input row ...
     *      };
     *
     *      return outputRow;
     * }
     *  
     * const modifiedDf = df.select(row => transformRow(row));
     * </pre>
     */
    select<ToT> (selector: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT> {
        if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to 'DataFrame.select' function to be a function.");

        return new DataFrame(() => {
            const content = this.getContent();
            return {
                values: new SelectIterable<ValueT, ToT>(content.values, selector),
                index: content.index,    
            };
        });
    }

    /**
     * Generates a new dataframe by repeatedly calling a selector function on each row in the original dataframe.
     * 
     * In this case the selector function produces a collection of output rows that are flattened to create the new dataframe.
     *
     * @param selector Selector function that transforms each row into a collection of output rows.
     * 
     * @return  Returns a new dataframe with rows that have been produced by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * function produceOutputRows (inputRow) {
     *      const outputRows = [];
     *      while (someCondition) {     *      
     *          // ... generate zero or more output rows ...
     *          outputRows.push(... some generated row ...);
     *      }
     *      return outputRows;
     * }
     * 
     * const modifiedDf = df.selectMany(row => produceOutputRows(row));
     * </pre>
     */
    selectMany<ToT> (selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): IDataFrame<IndexT, ToT> {
        if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to 'DataFrame.selectMany' to be a function.");

        return new DataFrame(() => ({
            pairs: new SelectManyIterable(
                this.getContent().pairs, 
                (pair: [IndexT, ValueT], index: number): Iterable<[IndexT, ToT]> => {
                    const outputPairs: [IndexT, ToT][] = [];
                    for (const transformed of selector(pair[1], index)) {
                        outputPairs.push([
                            pair[0],
                            transformed
                        ]);
                    }
                    return outputPairs;
                }
            )
        }));
    }

    /**
     * Transform one or more columns. 
     * 
     * This is equivalent to extracting a {@link Series} with {@link getSeries}, then transforming it with {@link Series.select},
     * and finally plugging it back in as the same column using {@link withSeries}.
     *
     * @param columnSelectors Object with field names for each column to be transformed. Each field specifies a selector function that transforms that column.
     * 
     * @return Returns a new dataframe with 1 or more columns transformed.
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.transformSeries({ 
     *      AColumnToTransform: columnValue => transformRow(columnValue) 
     * });
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const modifiedDf = df.transformSeries({ 
     *      ColumnA: columnValue => transformColumnA(columnValue),
     *      ColumnB: columnValue => transformColumnB(columnValue)
     * });
     * </pre>
     */
    transformSeries<NewValueT = ValueT> (columnSelectors: IColumnTransformSpec): IDataFrame<IndexT, NewValueT> {

        if (!isObject(columnSelectors)) throw new Error("Expected 'columnSelectors' parameter of 'DataFrame.transformSeries' function to be an object. Field names should specify columns to transform. Field values should be selector functions that specify the transformation for each column.");

        let working: IDataFrame<IndexT, any> = this;

        for (const columnName of Object.keys(columnSelectors)) {
            if (working.hasSeries(columnName)) {
                working = working.withSeries(
                    columnName, 
                    working.getSeries(columnName)
                        .select(columnSelectors[columnName])
                );
            }
        }

        return working;
    }

    /** 
     * Generate new columns based on existing rows.
     * 
     * This is equivalent to calling {@link select} to transform the original dataframe to a new dataframe with different column,
     * then using {@link withSeries} to merge each the of both the new and original dataframes.
     *
     * @param generator Generator function that transforms each row to produce 1 or more new columns.
     * Or use a column spec that has fields for each column, the fields specify a generate function that produces the value for each new column.
     * 
     * @return Returns a new dataframe with 1 or more new columns.
     * 
     * @example
     * <pre>
     * 
     * function produceNewColumns (inputRow) {
     *      const newColumns = {
     *          // ... specify new columns and their values based on the input row ...
     *      };
     * 
     *      return newColumns;
     * };
     * 
     * const dfWithNewSeries = df.generateSeries(row => produceNewColumns(row));
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const dfWithNewSeries = df.generateSeries({ 
     *      NewColumnA: row => produceNewColumnA(row),
     *      NewColumnB: row => produceNewColumnB(row),
     * })
     * </pre>
     */
    generateSeries<NewValueT = ValueT> (generator: SelectorWithIndexFn<any, any> | IColumnTransformSpec): IDataFrame<IndexT, NewValueT> {

        if (!isObject(generator)) {
            if (!isFunction(generator)) {
                throw new Error("Expected 'generator' parameter to 'DataFrame.generateSeries' function to be a function or an object.");
            }

            const selector = generator as SelectorWithIndexFn<any, any>;
            const newColumns = this.select(selector) // Build a new dataframe.
                .bake(); //TODO: Bake should be needed here, but it causes problems if not.
            const newColumnNames = newColumns.getColumnNames(); 

            let working: IDataFrame<IndexT, any> = this;
 
            //TODO: There must be a cheaper implementation!
            for (const newColumnName of newColumnNames) {
                working = working.withSeries(newColumnName, newColumns.getSeries(newColumnName));
            }

            return working;
        }
        else {
            const columnTransformSpec = generator as IColumnTransformSpec;
            const newColumnNames = Object.keys(columnTransformSpec);
            
            let working: IDataFrame<IndexT, any> = this;

            for (const newColumnName of newColumnNames) {
                working = working.withSeries(newColumnName, working.select(columnTransformSpec[newColumnName]).deflate());
            }

            return working;
        }
    }    

    /** 
     * Converts (deflates) a dataframe to a {@link Series}.
     *
     * @param [selector] Optional selector function that transforms each row to produce the series.
     *
     * @return Returns a series that was created from the deflated from  the original dataframe.
     * 
     * @example
     * <pre>
     * 
     * const series = df.deflate(); // Deflate to a series of object.
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const series = df.deflate(row => row.SomeColumn); // Extract a particular column.
     * </pre>
     */
    deflate<ToT = ValueT> (selector?: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT> {

        if (selector) {
            if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to 'DataFrame.deflate' function to be a selector function.");
        }

        return new Series<IndexT, ToT>(() => { 
            const content = this.getContent();
            if (selector) {
                return {
                    index: content.index,
                    values: new SelectIterable<ValueT, ToT>(content.values, selector),
                    pairs: new SelectIterable<[IndexT, ValueT], [IndexT, ToT]>(content.pairs, (pair, index) => {
                        return [
                            pair[0],
                            selector(pair[1], index)
                        ];
                    }),    
                };
            }
            else {
                return {
                    index: content.index,
                    values: content.values as any as Iterable<ToT>,
                    pairs: content.pairs as any as Iterable<[IndexT, ToT]>,
                };
            }
        });
    };

    /** 
     * Inflate a named {@link Series} in the dataframe to 1 or more new series in the new dataframe.
     * 
     * This is the equivalent of extracting the series using {@link getSeries}, transforming them with {@link Series.select}
     * and then running {@link Series.inflate} to create a new dataframe, then merging each column of the new dataframe
     *  into the original dataframe using {@link withSeries}.
     *
     * @param columnName Name of the series to inflate.
     * @param [selector] Optional selector function that transforms each value in the column to new columns. If not specified it is expected that each value in the column is an object whose fields define the new column names.
     * 
     * @return Returns a new dataframe with a column inflated to 1 or more new columns.
     * 
     * @example
     * <pre>
     * 
     * function newColumnGenerator (row) {
     *      const newColumns = {
     *          // ... create 1 field per new column ...
     *      };
     * 
     *      return row;
     * }
     * 
     * const dfWithNewSeries = df.inflateSeries("SomeColumn", newColumnGenerator);
     * </pre>
     */
    inflateSeries<NewValueT = ValueT> (columnName: string, selector?: SelectorWithIndexFn<IndexT, any>): IDataFrame<IndexT, ValueT> {

        if (!isString(columnName)) throw new Error("Expected 'columnName' parameter to 'DataFrame.inflateSeries' to be a string that is the name of the column to inflate.");

        if (selector) {
            if (!isFunction(selector)) throw new Error("Expected optional 'selector' parameter to 'DataFrame.inflateSeries' to be a selector function, if it is specified.");
        }

        return this.zip(
            this.getSeries(columnName).inflate(selector),
            (row1, row2) => Object.assign({}, row1, row2) //todo: this be should zip's default operation.
        );
    }

    /**
     * Partition a dataframe into a {@link Series} of *data windows*. 
     * Each value in the new series is a rolling chunk of data from the original dataframe.
     *
     * @param period The number of data rows to include in each data window.
     * 
     * @return Returns a new series, each value of which is a chunk of the original dataframe.
     * 
     * @example
     * <pre>
     * 
     * const windows = df.window(2); // Get values in pairs.
     * const pctIncrease = windows.select(pair => (pair.last() - pair.first()) / pair.first());
     * console.log(pctIncrease.toString());
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const salesDf = ... // Daily sales data.
     * const weeklySales = salesDf.window(7); // Partition up into weekly data sets.
     * console.log(weeklySales.toString());
     * </pre>
     */
    window (period: number): ISeries<number, IDataFrame<IndexT, ValueT>> {

        if (!isNumber(period)) throw new Error("Expected 'period' parameter to 'DataFrame.window' to be a number.");

        return new Series<number, IDataFrame<IndexT, ValueT>>(() => {
            const content = this.getContent();
            return {
                values: new DataFrameWindowIterable<IndexT, ValueT>(content.columnNames, content.pairs, period)
            };            
        });
    }

    /** 
     * Partition a dataframe into a {@link Series} of *rolling data windows*. 
     * Each value in the new series is a rolling chunk of data from the original dataframe.
     *
     * @param period The number of data rows to include in each data window.
     * 
     * @return Returns a new series, each value of which is a rolling chunk of the original dataframe.
     * 
     * @example
     * <pre>
     * 
     * const salesDf = ... // Daily sales data.
     * const rollingWeeklySales = salesDf.rollingWindow(7); // Get rolling window over weekly sales data.
     * console.log(rollingWeeklySales.toString());
     * </pre>
     */
    rollingWindow (period: number): ISeries<number, IDataFrame<IndexT, ValueT>> {

        if (!isNumber(period)) throw new Error("Expected 'period' parameter to 'DataFrame.rollingWindow' to be a number.");

        return new Series<number, IDataFrame<IndexT, ValueT>>(() => {
            const content = this.getContent();
            return {
                values: new DataFrameRollingWindowIterable<IndexT, ValueT>(content.columnNames, content.pairs, period)
            };            
        });
    }

    /**
     * Partition a dataframe into a {@link Series} of variable-length *data windows* 
     * where the divisions between the data chunks are
     * defined by a user-provided *comparer* function.
     * 
     * @param comparer Function that compares two adjacent data rows and returns true if they should be in the same window.
     * 
     * @return Returns a new series, each value of which is a chunk of data from the original dataframe.
     * 
     * @example
     * <pre>
     * 
     * function rowComparer (rowA, rowB) {
     *      if (... rowA should be in the same data window as rowB ...) {
     *          return true;
     *      }
     *      else {
     *          return false;
     *      }
     * };
     * 
     * const variableWindows = df.variableWindow(rowComparer);
     */
    variableWindow (comparer: ComparerFn<ValueT, ValueT>): ISeries<number, IDataFrame<IndexT, ValueT>> {
        
        if (!isFunction(comparer)) throw new Error("Expected 'comparer' parameter to 'DataFrame.variableWindow' to be a function.")

        return new Series<number, IDataFrame<IndexT, ValueT>>(() => {
            const content = this.getContent();
            return {
                values: new DataFrameVariableWindowIterable<IndexT, ValueT>(content.columnNames, content.pairs, comparer)
            };            
        });
    }

    /**
     * Eliminates adjacent duplicate rows.
     * 
     * For each group of adjacent rows that are equivalent only returns the last index/row for the group, 
     * thus ajacent equivalent rows are collapsed down to the last row.
     *
     * @param [selector] Optional selector function to determine the value used to compare for equivalence.
     * 
     * @return Returns a new dataframe with groups of adjacent duplicate rows collapsed to a single row per group.
     * 
     * @example
     * <pre>
     * 
     * const dfWithDuplicateRowsRemoved = df.sequentialDistinct(row => row.ColumnA);
     * </pre>
     */
    sequentialDistinct<ToT = ValueT> (selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ValueT> {
        
        if (selector) {
            if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to 'DataFrame.sequentialDistinct' to be a selector function that determines the value to compare for duplicates.")
        }
        else {
            selector = (value: ValueT): ToT => <ToT> <any> value;
        }

        return this.variableWindow((a, b) => selector!(a) === selector!(b))
            .select((window): [IndexT, ValueT] => {
                return [window.getIndex().first(), window.first()];
            })
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1]); //TODO: Should this be select?
    }

    /**
     * Aggregate the rows in the dataframe to a single result.
     *
     * @param [seed] Optional seed value for producing the aggregation.
     * @param selector Function that takes the seed and then each row in the dataframe and produces the aggregated value.
     * 
     * @return Returns a new value that has been aggregated from the dataframe using the 'selector' function. 
     * 
     * @example
     * <pre>
     * 
     * const dailySalesDf = ... daily sales figures for the past month ...
     * const totalSalesForthisMonth = dailySalesDf.aggregate(
     *      0, // Seed - the starting value.
     *      (accumulator, row) => accumulator + row.SalesAmount // Aggregation function.
     * );
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const totalSalesAllTime = 500; // We'll seed the aggregation with this value.
     * const dailySalesDf = ... daily sales figures for the past month ...
     * const updatedTotalSalesAllTime = dailySalesDf.aggregate(
     *      totalSalesAllTime, 
     *      (accumulator, row) => accumulator + row.SalesAmount
     * );
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * var salesDataSummary = salesDataDf.aggregate({
     *      TotalSales: df => df.count(),
     *      AveragePrice: df => df.deflate(row => row.Price).average(),
     *      TotalRevenue: df => df.deflate(row => row.Revenue).sum(), 
     * });
     * </pre>
    */
    aggregate<ToT = ValueT> (seedOrSelector: AggregateFn<ValueT, ToT> | ToT | IColumnAggregateSpec, selector?: AggregateFn<ValueT, ToT>): ToT {

        if (isFunction(seedOrSelector) && !selector) {
            return this.skip(1).aggregate(<ToT> <any> this.first(), seedOrSelector);
        }
        else if (selector) {
            if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to aggregate to be a function.");

            let accum = <ToT> seedOrSelector;

            for (const value of this) {
                accum = selector!(accum, value);                
            }

            return accum;
        }
        else {
            //
            //TODO:
            // This approach is fairly limited because I can't provide a seed.
            // Consider removing this and replacing it with a 'summarize' function.
            //
            if (!isObject(seedOrSelector)) throw new Error("Expected 'seed' parameter to aggregate to be an object.");

            const columnAggregateSpec = seedOrSelector as IColumnAggregateSpec;
            const columnNames = Object.keys(columnAggregateSpec);
            const aggregatedColumns = columnNames.map(columnName => {
                var columnSelector = columnAggregateSpec[columnName];
                if (!isFunction(columnSelector)) throw new Error("Expected column/selector pairs in 'seed' parameter to aggregate.");
                return [columnName, this.getSeries(columnName).aggregate(columnSelector)];
            });

            return toMap(aggregatedColumns, pair => pair[0], pair => pair[1]);
        }
    }
    
    /**
     * Skip a number of rows in the dataframe.
     *
     * @param numValues Number of rows to skip.
     * 
     * @return Returns a new dataframe with the specified number of rows skipped. 
     * 
     * @example
     * <pre>
     * 
     * const dfWithRowsSkipped = df.skip(10); // Skip 10 rows in the original dataframe.
     * </pre>
     */
    skip (numValues: number): IDataFrame<IndexT, ValueT> {
        if (!isNumber(numValues)) throw new Error("Expected 'numValues' parameter to 'DataFrame.skip' to be a number.");

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: new SkipIterable(content.values, numValues),
                index: new SkipIterable(content.index, numValues),
                pairs: new SkipIterable(content.pairs, numValues),
            };
        });
    }

    /**
     * Skips rows in the dataframe while a condition evaluates to true or truthy.
     *
     * @param predicate Returns true/truthy to continue to skip rows in the original dataframe.
     * 
     * @return Returns a new dataframe with all initial sequential rows removed while the predicate returned true/truthy.
     * 
     * @example
     * <pre>
     * 
     * const dfWithRowsSkipped = df.skipWhile(row => row.CustomerName === "Fred"); // Skip initial customers named Fred.
     * </pre>
     */
    skipWhile (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'DataFrame.skipWhile' function to be a predicate function that returns true/false.");

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: new SkipWhileIterable(content.values, predicate),
                pairs: new SkipWhileIterable(content.pairs, pair => predicate(pair[1])),
            };
        });
    }

    /**
     * Skips rows in the dataframe untils a condition evaluates to true or truthy.
     *
     * @param predicate Return true/truthy to stop skipping rows in the original dataframe.
     * 
     * @return Returns a new dataframe with all initial sequential rows removed until the predicate returned true/truthy.
     * 
     * @example
     * <pre>
     * 
     * const dfWithRowsSkipped = df.skipUntil(row => row.CustomerName === "Fred"); // Skip initial customers until we find Fred.
     * </pre>
     */
    skipUntil (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'DataFrame.skipUntil' function to be a predicate function that returns true/false.");

        return this.skipWhile(value => !predicate(value)); 
    }

    /**
     * Take a number of rows from the dataframe.
     *
     * @param numValues Number of rows to take.
     * 
     * @return Returns a new dataframe with only the specified number of rows taken from the original dataframe.
     * 
     * @example
     * <pre>
     * 
     * const dfWithRowsTaken = df.take(15); // Take only the first 15 rows from the original dataframe.
     * </pre>
     */
    take (numRows: number): IDataFrame<IndexT, ValueT> {
        if (!isNumber(numRows)) throw new Error("Expected 'numRows' parameter to 'DataFrame.take' function to be a number.");

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                index: new TakeIterable(content.index, numRows),
                values: new TakeIterable(content.values, numRows),
                pairs: new TakeIterable(content.pairs, numRows)
            };
        });
    };

    /**
     * Takes rows from the dataframe while a condition evaluates to true or truthy.
     *
     * @param predicate Returns true/truthy to continue to take rows from the original dataframe.
     * 
     * @return Returns a new dataframe with only the initial sequential rows that were taken while the predicate returned true/truthy.
     * 
     * @example
     * <pre>
     * 
     * const dfWithRowsTaken = df.takeWhile(row => row.CustomerName === "Fred"); // Take only initial customers named Fred.
     * </pre>
     */
    takeWhile (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'DataFrame.takeWhile' function to be a predicate function that returns true/false.");

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: new TakeWhileIterable(content.values, predicate),
                pairs: new TakeWhileIterable(content.pairs, pair => predicate(pair[1]))
            };
        });
    }

    /**
     * Takes rows from the dataframe untils a condition evaluates to true or truthy.
     *
     * @param predicate Return true/truthy to stop taking rows in the original dataframe.
     * 
     * @return Returns a new dataframe with only the initial sequential rows taken until the predicate returned true/truthy.
     * 
     * @example
     * <pre>
     * 
     * const dfWithRowsTaken = df.takeUntil(row => row.CustomerName === "Fred"); // Take all initial customers until we find Fred.
     * </pre>
     */
    takeUntil (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'DataFrame.takeUntil' function to be a predicate function that returns true/false.");

        return this.takeWhile(value => !predicate(value));
    }

    /**
     * Count the number of rows in the dataframe
     *
     * @return Returns the count of all rows.
     * 
     * @example
     * <pre>
     * 
     * const numRows = df.count();
     * </pre>
     */
    count (): number {

        let total = 0;
        for (const value of this.getContent().values) {
            ++total;
        }
        return total;
    }

    /**
     * Get the first row of the dataframe.
     *
     * @return Returns the first row of the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const firstRow = df.first();
     * </pre>
     */
    first (): ValueT {

        for (const value of this) {
            return value; // Only need the first value.
        }

        throw new Error("DataFrame.first: No values in DataFrame.");
    }

    /**
     * Get the last row of the dataframe.
     *
     * @return Returns the last row of the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const lastRow = df.last();
     * </pre>
     */
    last (): ValueT {

        let lastValue = null;

        for (const value of this) {
            lastValue = value; // Throw away all values until we get to the last one.
        }

        if (lastValue === null) {
            throw new Error("DataFrame.last: No values in DataFrame.");
        }

        return lastValue;
    }    
    
    /**
     * Get the row, if there is one, with the specified index.
     *
     * @param index Index to for which to retreive the row.
     *
     * @return Returns the row from the specified index in the dataframe or undefined if there is no such index in the present in the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const row = df.at(5); // Get the row at index 5 (with a default 0-based index).
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const date = ... some date ...
     * // Retreive the row with specified date from a time-series dataframe (assuming date indexed has been applied).
     * const row = df.at(date); 
     * </pre>
     */
    at (index: IndexT): ValueT | undefined {

        if (this.none()) {
            return undefined;
        }

        //
        // This is pretty expensive.
        // A specialised index could improve this.
        //

        for (const pair of this.getContent().pairs) {
            if (pair[0] === index) {
                return pair[1];
            }
        }

        return undefined;
    }
    
    /** 
     * Get X rows from the start of the dataframe.
     * Pass in a negative value to get all rows at the head except for X rows at the tail.
     *
     * @param numValues Number of rows to take.
     * 
     * @return Returns a new dataframe that has only the specified number of rows taken from the start of the original dataframe.  
     * 
     * @examples
     * <pre>
     * 
     * const sample = df.head(10); // Take a sample of 10 rows from the start of the dataframe.
     * </pre>
     */
    head (numValues: number): IDataFrame<IndexT, ValueT> {

        if (!isNumber(numValues)) throw new Error("Expected 'numValues' parameter to 'DataFrame.head' function to be a number.");

        if (numValues === 0) {
            return new DataFrame<IndexT, ValueT>(); // Empty dataframe.
        }

        const toTake = numValues < 0 ? this.count() - Math.abs(numValues) : numValues;
        return this.take(toTake);
    }

    /** 
     * Get X rows from the end of the dataframe.
     * Pass in a negative value to get all rows at the tail except X rows at the head.
     *
     * @param numValues Number of rows to take.
     * 
     * @return Returns a new dataframe that has only the specified number of rows taken from the end of the original dataframe.  
     * 
     * @examples
     * <pre>
     * 
     * const sample = df.tail(12); // Take a sample of 12 rows from the end of the dataframe.
     * </pre>
     */
    tail (numValues: number): IDataFrame<IndexT, ValueT> {

        if (!isNumber(numValues)) throw new Error("Expected 'numValues' parameter to 'DataFrame.tail' function to be a number.");

        if (numValues === 0) {
            return new DataFrame<IndexT, ValueT>(); // Empty dataframe.
        }

        const toSkip = numValues > 0 ? this.count() - numValues : Math.abs(numValues);
        return this.skip(toSkip);
    }

    /**
     * Filter the dataframe using user-defined predicate function.
     *
     * @param predicate Predicte function to filter rows from the dataframe. Returns true/truthy to keep rows, or false/falsy to omit rows.
     * 
     * @return Returns a new dataframe containing only the rows from the original dataframe that matched the predicate. 
     * 
     * @example
     * <pre>
     * 
     * const filteredDf = df.where(row => row.CustomerName === "Fred"); // Filter so we only have customers named Fred.
     * </pre>
     */
    where (predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT> {

        if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'DataFrame.where' function to be a function.");

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: new WhereIterable(content.values, predicate),
                pairs: new WhereIterable(content.pairs, pair => predicate(pair[1]))
            };
        });
    }

    /**
     * Invoke a callback function for each row in the dataframe.
     *
     * @param callback The calback function to invoke for each row.
     * 
     * @return Returns the original dataframe with no modifications.
     * 
     * @example
     * <pre>
     * 
     * df.forEach(row => {
     *      // ... do something with the row ...
     * });
     * </pre>
     */
    forEach (callback: CallbackFn<ValueT>): IDataFrame<IndexT, ValueT> {
        if (!isFunction(callback)) throw new Error("Expected 'callback' parameter to 'DataFrame.forEach' to be a function.");

        let index = 0;
        for (const value of this) {
            callback(value, index++);
        }

        return this;
    }

    /**
     * Evaluates a predicate function for every row in the dataframe to determine 
     * if some condition is true/truthy for **all** rows in the dataframe.
     * 
     * @param predicate Predicate function that receives each row. It should returns true/truthy for a match, otherwise false/falsy.
     *
     * @return Returns true if the predicate has returned true or truthy for every row in the dataframe, otherwise returns false. Returns false for an empty dataframe. 
     * 
     * @example
     * <pre>
     * 
     * const everyoneIsNamedFred = df.all(row => row.CustomerName === "Fred"); // Check if all customers are named Fred.
     * </pre>
     */
    all (predicate: PredicateFn<ValueT>): boolean {
        if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'DataFrame.all' to be a function.")

        let count = 0;

        for (const value of this) {
            if (!predicate(value)) {
                return false;
            }

            ++count;
        }

        return count > 0;
    }

    /**
     * Evaluates a predicate function for every row in the dataframe to determine 
     * if some condition is true/truthy for **any** of rows in the dataframe.
     * 
     * If no predicate is specified then it simply checks if the dataframe contains more than zero rows.
     *
     * @param [predicate] Optional predicate function that receives each row. It should return true/truthy for a match, otherwise false/falsy.
     *
     * @return Returns true if the predicate has returned truthy for any row in the dataframe, otherwise returns false. 
     * If no predicate is passed it returns true if the dataframe contains any rows at all. 
     * Returns false for an empty dataframe.
     * 
     * @example
     * <pre>
     * 
     * const anyFreds = df.any(row => row.CustomerName === "Fred"); // Do we have any customers named Fred?
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const anyCustomers = df.any(); // Do we have any customers at all?
     * </pre>
     */
    any (predicate?: PredicateFn<ValueT>): boolean {
        if (predicate) {
            if (!isFunction(predicate)) throw new Error("Expected optional 'predicate' parameter to 'DataFrame.any' to be a function.")
        }

        if (predicate) {
            // Use the predicate to check each value.
            for (const value of this) {
                if (predicate(value)) {
                    return true;
                }
            }
        }
        else {
            // Just check if there is at least one item.
            const iterator = this[Symbol.iterator]()
            return !iterator.next().done;
        }

        return false; // Nothing passed.
    }

    /**
     * Evaluates a predicate function for every row in the dataframe to determine 
     * if some condition is true/truthy for **none** of rows in the dataframe.
     * 
     * If no predicate is specified then it simply checks if the dataframe contains zero rows.
     *
     * @param [predicate] Optional predicate function that receives each row. It should return true/truthy for a match, otherwise false/falsy.
     *
     * @return Returns true if the predicate has returned truthy for zero rows in the dataframe, otherwise returns false. Returns false for an empty dataframe.
     * 
     * @example
     * <pre>
     * 
     * const noFreds = df.none(row => row.CustomerName === "Fred"); // Do we have zero customers named Fred?
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const noCustomers = df.none(); // Do we have zero customers?
     * </pre>
     */
    none (predicate?: PredicateFn<ValueT>): boolean {

        if (predicate) {
            if (!isFunction(predicate)) throw new Error("Expected 'predicate' parameter to 'DataFrame.none' to be a function.")
        }

        if (predicate) {
            // Use the predicate to check each value.
            for (const value of this) {
                if (predicate(value)) {
                    return false;
                }
            }
        }
        else {
            // Just check if empty.
            const iterator = this[Symbol.iterator]()
            return iterator.next().done;
        }

        return true; // Nothing failed the predicate.
    }

    //TODO: Improve this example (and subsequent examples, they look like series setup rather than dataframe)..
    /**
     * Gets a new dataframe containing all rows starting at or after the specified index value.
     * 
     * @param indexValue The index value at which to start the new dataframe.
     * 
     * @return Returns a new dataframe containing all rows starting at or after the specified index value. 
     * 
     * @example
     * <pre>
     * 
     * const df = new DataFrame({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const lastHalf = df.startAt(2);
     * expect(lastHalf.toArray()).to.eql([30, 40]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeriesDf = ... a dataframe indexed by date/time ...
     * 
     * // Get all rows starting at (or after) a particular date.
     * const result = timeSeriesDf.startAt(new Date(2016, 5, 4)); 
     * </pre>
     */
    startAt (indexValue: IndexT): IDataFrame<IndexT, ValueT> {

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            const lessThan = this.getIndex().getLessThan();
            return {                
                columnNames: content.columnNames,
                index: new SkipWhileIterable(content.index, index => lessThan(index, indexValue)),
                pairs: new SkipWhileIterable(content.pairs, pair => lessThan(pair[0], indexValue)),
            };
        });
    }

    /**
     * Gets a new dataframe containing all rows up until and including the specified index value (inclusive).
     * 
     * @param indexValue The index value at which to end the new dataframe.
     * 
     * @return Returns a new dataframe containing all rows up until and including the specified index value.
     * 
     * @example
     * <pre>
     * 
     * const df = new DataFrame({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const firstHalf = df.endAt(1);
     * expect(firstHalf.toArray()).to.eql([10, 20]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeriesDf = ... a dataframe indexed by date/time ...
     * 
     * // Get all rows ending at a particular date.
     * const result = timeSeriesDf.endAt(new Date(2016, 5, 4)); 
     * </pre>
     */
    endAt (indexValue: IndexT): IDataFrame<IndexT, ValueT> {

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            const lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo();
            return {
                columnNames: content.columnNames,
                index: new TakeWhileIterable(content.index, index => lessThanOrEqualTo(index, indexValue)),
                pairs: new TakeWhileIterable(content.pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
            };
        });
    }

    /**
     * Gets a new dataframe containing all rows up to the specified index value (exclusive).
     * 
     * @param indexValue The index value at which to end the new dataframe.
     * 
     * @return Returns a new dataframe containing all rows up to (but not including) the specified index value. 
     * 
     * @example
     * <pre>
     * 
     * const df = new DataFrame({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const firstHalf = df.before(2);
     * expect(firstHalf.toArray()).to.eql([10, 20]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeriesDf = ... a dataframe indexed by date/time ...
     * 
     * // Get all rows before the specified date.
     * const result = timeSeriesDf.before(new Date(2016, 5, 4)); 
     * </pre>
     */
    before (indexValue: IndexT): IDataFrame<IndexT, ValueT> {

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            const lessThan = this.getIndex().getLessThan();
            return {
                columnNames: content.columnNames,
                index: new TakeWhileIterable(content.index, index => lessThan(index, indexValue)),
                pairs: new TakeWhileIterable(content.pairs, pair => lessThan(pair[0], indexValue)),
            };
        });
    }

    /**
     * Gets a new dataframe containing all rows after the specified index value (exclusive).
     * 
     * @param indexValue The index value after which to start the new dataframe.
     * 
     * @return Returns a new dataframe containing all rows after the specified index value.
     * 
     * @example
     * <pre>
     * 
     * const df = new DataFrame({ 
     *      index: [0, 1, 2, 3], // This is the default index.
     *      values: [10, 20, 30, 40],
     * });
     * 
     * const lastHalf = df.before(1);
     * expect(lastHalf.toArray()).to.eql([30, 40]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeriesDf = ... a dataframe indexed by date/time ...
     * 
     * // Get all rows after the specified date.
     * const result = timeSeriesDf.after(new Date(2016, 5, 4)); 
     * </pre>
     */
    after (indexValue: IndexT): IDataFrame<IndexT, ValueT> {
        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            const lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo();
            return {
                columnNames: content.columnNames,
                index: new SkipWhileIterable(content.index, index => lessThanOrEqualTo(index, indexValue)),
                pairs: new SkipWhileIterable(content.pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
            };
        });
    }

    /**
     * Gets a new dataframe containing all rows between the specified index values (inclusive).
     * 
     * @param startIndexValue The index at which to start the new dataframe.
     * @param endIndexValue The index at which to end the new dataframe.
     * 
     * @return Returns a new dataframe containing all values between the specified index values (inclusive).
     * 
     * @example
     * <pre>
     * 
     * const df = new DataFrame({ 
     *      index: [0, 1, 2, 3, 4, 6], // This is the default index.
     *      values: [10, 20, 30, 40, 50, 60],
     * });
     * 
     * const middleSection = df.between(1, 4);
     * expect(middleSection.toArray()).to.eql([20, 30, 40, 50]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const timeSeriesDf = ... a dataframe indexed by date/time ...
     * 
     * // Get all rows between the start and end dates (inclusive).
     * const result = timeSeriesDf.after(new Date(2016, 5, 4), new Date(2016, 5, 22)); 
     * </pre>
     */
    between (startIndexValue: IndexT, endIndexValue: IndexT): IDataFrame<IndexT, ValueT> {
        return this.startAt(startIndexValue).endAt(endIndexValue); 
    }

    /** 
     * Format the dataframe for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @return Generates and returns a string representation of the dataframe.
     * 
     * @example
     * <pre>
     * 
     * console.log(df.toString());
     * </pre>
     */
    toString (): string {

        const columnNames = this.getColumnNames();
        const header = ["__index__"].concat(columnNames);

        const table = new Table();
        //TODO: for (const pair of this.asPairs()) {
        for (const pair of this.toPairs()) {
            const index = pair[0];
            const value = pair[1] as any;
            table.cell(header[0], index);
            for (let columnIndex = 0; columnIndex < columnNames.length; ++columnIndex) {
                const columnName = columnNames[columnIndex];
                table.cell(header[columnIndex+1], value[columnName]);
            }
            table.newRow();
        }

        return table.toString();
    }

    /**
     * Parse a column with string values and convert it to a column with int values.
     *
     * @param columnNameOrNames Specifies the column name or array of column names to parse.
     * 
     * @return Returns a new dataframe with values of particular named column(s) parsed from strings to ints.
     * 
     * @example
     * <pre>
     * 
     * const parsed = df.parseInts("MyIntColumn");
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const parsed = df.parseInts(["MyIntColumnA", "MyIntColumnA"]);
     * </pre>
     */
    parseInts (columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT> {

        if (isArray(columnNameOrNames)) {
            let working: IDataFrame<IndexT, ValueT> = this;
            for (const columnName of columnNameOrNames) {
                working = working.parseInts(columnName);
            }
            
            return working;
        }
        else {
            return this.withSeries(columnNameOrNames, this.getSeries(columnNameOrNames).parseInts());
        }
    }

    /**
     * Parse a column with string values and convert it to a column with float values.
     *
     * @param columnNameOrNames Specifies the column name or array of column names to parse.
     * 
     * @return Returns a new dataframe with values of particular named column(s) parsed from strings to floats.
     * 
     * @example
     * <pre>
     * 
     * const parsed = df.parseFloats("MyFloatColumn");
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const parsed = df.parseFloats(["MyFloatColumnA", "MyFloatColumnA"]);
     * </pre>
     */
    parseFloats (columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT> {

        if (isArray(columnNameOrNames)) {
            let working: IDataFrame<IndexT, ValueT> = this;
            for (const columnName of columnNameOrNames) {
                working = working.parseFloats(columnName);
            }
            
            return working;
        }
        else {
            return this.withSeries(columnNameOrNames, this.getSeries(columnNameOrNames).parseFloats());
        }
    }

    /**
     * Parse a column with string values and convert it to a column with date values.
     *
     * @param columnNameOrNames Specifies the column name or array of column names to parse.
     * @param [formatString] Optional formatting string for dates.
     * 
     * Moment is used for date parsing.
     * https://momentjs.com
     * 
     * @return Returns a new dataframe with values of particular named column(s) parsed from strings to dates.
     * 
     * @example
     * <pre>
     * 
     * const parsed = df.parseDates("MyDateColumn");
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const parsed = df.parseDates(["MyDateColumnA", "MyDateColumnA"]);
     * </pre>
     */
    parseDates (columnNameOrNames: string | string[], formatString?: string): IDataFrame<IndexT, ValueT> {

        if (formatString) {
            if (!isString(formatString)) throw new Error("Expected optional 'formatString' parameter to 'DataFrame.parseDates' to be a string (if specified).");
        }

        if (isArray(columnNameOrNames)) {
            let working: IDataFrame<IndexT, ValueT> = this;
            for (const columnName of columnNameOrNames) {
                working = working.parseDates(columnName, formatString);
            }
            
            return working;
        }
        else {
            return this.withSeries(columnNameOrNames, this.getSeries(columnNameOrNames).parseDates(formatString));
        }
    }

    /**
     * Convert a column of values of different types to a column of string values.
     *
     * @param columnNames Specifies the column name or array of column names to convert to strings. Can also be a format spec that specifies which columns to convert and what their format should be. 
     * @param [formatString] Optional formatting string for dates.
     * 
     * Numeral.js is used for number formatting.
     * http://numeraljs.com/
     * 
     * Moment is used for date formatting.
     * https://momentjs.com/docs/#/parsing/string-format/
     * 
     * @return Returns a new dataframe with a particular named column converted from values to strings.
     * 
     * @example
     * <pre>
     * 
     * const result = df.toStrings("MyDateColumn", "YYYY-MM-DD");
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const result = df.toStrings("MyFloatColumn", "0.00");
     * </pre>
     */
    toStrings (columnNames: string | string[] | IFormatSpec, formatString?: string): IDataFrame<IndexT, ValueT> {

        if (isObject(columnNames)) {
            for (const columnName of Object.keys(columnNames)) {
                if (!isString((columnNames as any)[columnName])) throw new Error("Expected values of 'columnNames' parameter to be strings when a format spec is passed in.");
            }

            if (!isUndefined(formatString)) throw new Error("Optional 'formatString' parameter to 'DataFrame.toStrings' should not be set when passing in a format spec.");
        }
        else {
            if (!isArray(columnNames)) {
                if (!isString(columnNames)) throw new Error("Expected 'columnNames' parameter to 'DataFrame.toStrings' to be a string, array of strings or format spec that specifes which columns should be converted to strings.");
            }

            if (formatString) {
                if (!isString(formatString)) throw new Error("Expected optional 'formatString' parameter to 'DataFrame.toStrings' to be a string (if specified).");
            }    
        }

        if (isObject(columnNames)) {
            let working: IDataFrame<IndexT, ValueT> = this;
            for (const columnName of Object.keys(columnNames)) {
                working = working.toStrings(columnName, formatString);
            }
            
            return working;
        }
        else if (isArray(columnNames)) {
            let working: IDataFrame<IndexT, ValueT> = this;
            for (const columnName of columnNames) {
                const columnFormatString = (columnNames as any)[columnName];
                working = working.toStrings(columnName, columnFormatString);
            }
            
            return working;
        }
        else {
            const singleColumnName = columnNames as string;
            return this.withSeries(singleColumnName, this.getSeries(singleColumnName).toStrings(formatString));
        }
    }

    /**
     * Produces a new dataframe with all string values truncated to the requested maximum length.
     *
     * @param maxLength The maximum length of the string values after truncation.
     * 
     * @return Returns a new dataframe with all strings truncated to the specified maximum length.
     * 
     * @example
     * <pre>
     * 
     * // Truncate all string columns to 100 characters maximum.
     * const truncatedDf = df.truncateString(100);
     * </pre>
     */
    truncateStrings (maxLength: number): IDataFrame<IndexT, ValueT> {
        if (!isNumber(maxLength)) throw new Error("Expected 'maxLength' parameter to 'truncateStrings' to be an integer.");

        return this.select((row: any) => {
            const output: any = {};
            for (const key of Object.keys(row)) {
                const value = row[key];
                if (isString(value)) {
                    output[key] = value.substring(0, maxLength);
                }
                else {
                    output[key] = value;
                }
            }
           return <ValueT> output;
        });
    }

    /**
     * Produces a new dataframe with all number values rounded to the specified number of places.
     *
     * @param [numDecimalPlaces] The number of decimal places, defaults to 2.
     * 
     * @returns Returns a new dataframe with all number values rounded to the specified number of places.
     * 
     * @example
     * <pre>
     * 
     * const df = ... your data frame ...
     * const rounded = df.round(); // Round numbers to two decimal places.
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const df = ... your data frame ...
     * const rounded = df.round(3); // Round numbers to three decimal places.
     * </pre>
     */
    round (numDecimalPlaces?: number): IDataFrame<IndexT, ValueT> {

        if (numDecimalPlaces !== undefined) {
            if (!isNumber(numDecimalPlaces)) {
                throw new Error("Expected 'numDecimalPlaces' parameter to 'DataFrame.round' to be a number.");
            }
        }
        else {
            numDecimalPlaces = 2; // Default to two decimal places.
        }

        return this.select((row: any) => {
            const output: any = {};
            for (const key of Object.keys(row)) {
                const value = row[key];
                if (isNumber(value)) {
                    output[key] = parseFloat(value.toFixed(numDecimalPlaces));
                }
                else {
                    output[key] = value;
                }
            }
           return <ValueT> output;
        });
    }

    /**
     * Forces lazy evaluation to complete and 'bakes' the dataframe into memory.
     * 
     * @return Returns a dataframe that has been 'baked', all lazy evaluation has completed.  
     * 
     * @example
     * <pre>
     * 
     * const baked = df.bake();
     * </pre>
     */
    bake (): IDataFrame<IndexT, ValueT> {

        if (this.getContent().isBaked) {
            // Already baked.
            return this;
        }

        return new DataFrame({
            columnNames: this.getColumnNames(),
            values: this.toArray(),
            pairs: this.toPairs(),
            baked: true,
        });
    }

    /** 
     * Gets a new dataframe in reverse order.
     * 
     * @return Returns a new dataframe that is the reverse of the input.
     * 
     * @example
     * <pre>
     * 
     * const reversedDf = df.reverse();
     * </pre>
     */
    reverse (): IDataFrame<IndexT, ValueT> {
        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: new ReverseIterable(content.values),
                index: new ReverseIterable(content.index),
                pairs: new ReverseIterable(content.pairs)
            };
        });
    }

    /**
     * Returns only the set of rows in the dataframe that are distinct according to some criteria.
     * This can be used to remove duplicate rows from the dataframe.
     *
     * @param selector User-defined selector function that specifies the criteria used to make comparisons for duplicate rows.
     * 
     * @return Returns a dataframe containing only unique values as determined by the 'selector' function. 
     * 
     * @example
     * <pre>
     * 
     * // Remove duplicate rows by customer id. Will return only a single row per customer.
     * const distinctCustomers = salesDf.distinct(sale => sale.CustomerId);
     * </pre>
     */
    distinct<ToT> (selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ValueT> {
        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent();
            return {
                columnNames: content.columnNames,
                values: new DistinctIterable<ValueT, ToT>(content.values, selector),
                pairs: new DistinctIterable<[IndexT, ValueT],ToT>(content.pairs, (pair: [IndexT, ValueT]): ToT => selector && selector(pair[1]) || <ToT> <any> pair[1])
            };
        });
    }

    /**
     * Collects rows in the dataframe into a series of groups according to the user-defined selector function that defines the group for each row.
     *
     * @param selector User-defined selector function that defines the value to group by.
     *
     * @return Returns a {@link Series} of groups. Each group is a dataframe with values that have been grouped by the 'selector' function.
     * 
     * @example
     * <pre>
     * 
     * const salesDf = ... product sales ...
     * const salesByProduct = salesDf.groupBy(sale => sale.ProductId);
     * for (const productSalesGroup of salesByProduct) {
     *      // ... do something with each product group ...
     *      const productId = productSalesGroup.first().ProductId;
     *      const totalSalesForProduct = productSalesGroup.deflate(sale => sale.Amount).sum();
     *      console.log(totalSalesForProduct);
     * }
     * </pre>
     */
    groupBy<GroupT> (selector: SelectorWithIndexFn<ValueT, GroupT>): ISeries<number, IDataFrame<IndexT, ValueT>> {

        if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to 'DataFrame.groupBy' to be a selector function that determines the value to group the series by.");

        return new Series<number, IDataFrame<IndexT, ValueT>>(() => {
            const groups: any[] = []; // Each group, in order of discovery.
            const groupMap: any = {}; // Group map, records groups by key.
            
            let valueIndex = 0;
    
            for (const pair of this.getContent().pairs) {
                const groupKey = selector(pair[1], valueIndex);
                ++valueIndex;
                const existingGroup = groupMap[groupKey];
                if (existingGroup) {
                    existingGroup.push(pair);
                }
                else {
                    const newGroup: any[] = [];
                    newGroup.push(pair);
                    groups.push(newGroup);
                    groupMap[groupKey] = newGroup;
                }
            }

            return {
                values: groups.map(group => new DataFrame<IndexT, ValueT>({ pairs: group }))
            };
        });
    }
    
    /**
     * Collects rows in the dataframe into a series of groups according to a user-defined selector function that identifies adjacent rows that should be in the same group.
     *
     * @param selector Optional selector that defines the value to group by.
     *
     * @return Returns a {@link Series} of groups. Each group is a dataframe with values that have been grouped by the 'selector' function.
     * 
     * @example
     * <pre>
     * 
     * // Some ultra simple stock trading strategy backtesting...
     * const dailyStockPriceDf = ... daily stock price for a company ...
     * const priceGroups  = dailyStockPriceDf.groupBy(day => day.close > day.movingAverage);
     * for (const priceGroup of priceGroups) {
     *      // ... do something with each stock price group ...
     * 
     *      const firstDay = priceGroup.first();
     *      if (firstDay.close > movingAverage) {
     *          // This group of days has the stock price above its moving average.
     *          // ... maybe enter a long trade here ...
     *      }
     *      else {
     *          // This group of days has the stock price below its moving average.
     *          // ... maybe enter a short trade here ...
     *      }
     * }
     * </pre>
     */
    groupSequentialBy<GroupT> (selector?: SelectorFn<ValueT, GroupT>): ISeries<number, IDataFrame<IndexT, ValueT>> {

        if (selector) {
            if (!isFunction(selector)) throw new Error("Expected 'selector' parameter to 'DataFrame.groupSequentialBy' to be a selector function that determines the value to group the series by.")
        }
        else {
            selector = value => <GroupT> <any> value;
        }
        
        return this.variableWindow((a: ValueT, b: ValueT): boolean => selector!(a) === selector!(b));
    }

    /**
     * Concatenate multiple dataframes into a single dataframe.
     *
     * @param dataframes Array of dataframes to concatenate.
     * 
     * @return Returns a single dataframe concatenated from multiple input dataframes. 
     * 
     * @example
     * <pre>
     * 
     * const df1 = ...
     * const df2 = ...
     * const df3 = ...
     * const concatenatedDf = DataFrame.concat([df1, df2, df3]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const dfs = [... array of dataframes...];
     * const concatenatedDf = DataFrame.concat(dfs);
     * </pre>
     */
    static concat<IndexT = any, ValueT = any> (dataframes: IDataFrame<IndexT, ValueT>[]): IDataFrame<IndexT, ValueT > {
        if (!isArray(dataframes)) throw new Error("Expected 'dataframes' parameter to 'DataFrame.concat' to be an array of dataframes.");

        return new DataFrame(() => {
            const upcast = <DataFrame<IndexT, ValueT>[]> dataframes; // Upcast so that we can access private index, values and pairs.
            const contents = upcast.map(dataframe => dataframe.getContent());

            let columnNames: string[] = [];
            for (const content of contents) {
                for (const columnName of content.columnNames) {
                    columnNames.push(columnName);
                }
            }

            columnNames = makeDistinct(columnNames);

            return {
                columnNames: columnNames,
                values: new ConcatIterable(contents.map(content => content.values)),
                pairs: new ConcatIterable(contents.map(content => content.pairs)),
            };
        });    
    }
    
    /**
     * Concatenate multiple other dataframes onto this dataframe.
     * 
     * @param dataframes Multiple arguments. Each can be either a dataframe or an array of dataframes.
     * 
     * @return Returns a single dataframes concatenated from multiple input dataframes. 
     * 
     * @example
     * <pre>
     * 
     * const concatenatedDf = dfA.concat(dfB);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const concatenatedDf = dfA.concat(dfB, dfC);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const concatenatedDf = dfA.concat([dfB, dfC]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const concatenatedDf = dfA.concat(dfB, [dfC, dfD]);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const otherDfs = [... array of dataframes...];
     * const concatenatedDf = dfA.concat(otherDfs);
     * </pre>
     */    
    concat (...dataframes: (IDataFrame<IndexT, ValueT>[] | IDataFrame<IndexT, ValueT>)[]): IDataFrame<IndexT, ValueT> {
        const concatInput: IDataFrame<IndexT, ValueT>[] = [this];

        for (const input of dataframes) {
            if (isArray(input)) {
                for (const subInput of input) {
                    concatInput.push(subInput);
                }
            }
            else {
                concatInput.push(input);
            }
        }

        return DataFrame.concat<IndexT, ValueT>(concatInput);
    }
   
    /**
    * Zip (or merge) together multiple dataframes to create a new dataframe.
    * Preserves the index of the first dataframe.
    *
    * @param input An iterable of datafames to be zipped.
    * @param zipper User-defined zipper function that merges rows. It produces rows for the new dataframe based-on rows from the input dataframes.
    * 
    * @return Returns a single dataframe zipped (or merged) from multiple input dataframes. 
    * 
    * @example
    * <pre>
    * 
    * function produceNewRow (inputRows) {
    *       const outputRow = {
    *           // Produce output row based on the contents of the input rows.
    *       };
    *       return outputRow;
    * }
    * 
    * const inputDfs = [... array of input dataframes ...];
    * const zippedDf = DataFrame.zip(inputDfs, produceNewRow);
    * 
    * </pre>
    * 
    * @example
    * <pre>
    * 
    * function produceNewRow (inputRows) {
    *       const outputRow = {
    *           // Produce output row based on the contents of the input rows.
    *       };
    *       return outputRow;
    * }
    * 
    * const dfA = new DataFrame([ { Value: 10 }, { Value: 20 }, { Value: 30 }]);
    * const dfB = new DataFrame([ { Value: 100 }, { Value: 200 }, { Value: 300 }]);
    * const zippedDf = DataFrame.zip([dfA, dfB], produceNewRow);
    * </pre>
    */
    static zip<IndexT = any, ValueT = any, ResultT = any> (dataframes: Iterable<IDataFrame<IndexT, ValueT>>, zipper: ZipNFn<ValueT, ResultT>): IDataFrame<IndexT, ResultT> {

        const input = Array.from(dataframes);

        if (input.length === 0) {
            return new DataFrame<IndexT, ResultT>();
        }

        const firstSeries = input[0];
        if (firstSeries.none()) {
            return new DataFrame<IndexT, ResultT>();
        }

        return new DataFrame<IndexT, ResultT>(() => {
            const firstSeriesUpCast = <DataFrame<IndexT, ValueT>> firstSeries;
            const upcast = <DataFrame<IndexT, ValueT>[]> input; // Upcast so that we can access private index, values and pairs.
            
            return {
                index: <Iterable<IndexT>> firstSeriesUpCast.getContent().index,
                values: new ZipIterable<ValueT, ResultT>(upcast.map(s => s.getContent().values), zipper),
            };
        });
    }
    
    /**
    * Zip (or merge) together multiple dataframes to create a new dataframe.
    * Preserves the index of the first dataframe.
    * 
    * @param s2, s3, s4, s4 Multiple dataframes to zip.
    * @param zipper User-defined zipper function that merges rows. It produces rows for the new dataframe based-on rows from the input dataframes.
    * 
    * @return Returns a single dataframe zipped (or merged) from multiple input dataframes. 
    * 
    * @example
    * <pre>
    * 
    * function produceNewRow (rowA, rowB) {
    *       const outputRow = {
    *           ValueA: rowA.Value,
    *           ValueB: rowB.Value,
    *       };
    *       return outputRow;
    * }
    * 
    * const dfA = new DataFrame([ { Value: 10 }, { Value: 20 }, { Value: 30 }]);
    * const dfB = new DataFrame([ { Value: 100 }, { Value: 200 }, { Value: 300 }]);
    * const zippedDf = dfA.zip(dfB, produceNewRow);
    * </pre>
    */    
    zip<Index2T, Value2T, ResultT>  (s2: IDataFrame<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, ResultT>  (s2: IDataFrame<Index2T, Value2T>, s3: IDataFrame<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>  (s2: IDataFrame<Index2T, Value2T>, s3: IDataFrame<Index3T, Value3T>, s4: IDataFrame<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<ResultT>  (...args: any[]): IDataFrame<IndexT, ResultT> {

        const selector: Function = args[args.length-1];
        const input: IDataFrame<IndexT, any>[] = [this].concat(args.slice(0, args.length-1));
        return DataFrame.zip<IndexT, any, ResultT>(input, values => selector(...values));
    }    

    /**
     * Sorts the dataframe in ascending order by a value defined by the user-defined selector function. 
     * 
     * @param selector User-defined selector function that selects the value to sort by.
     * 
     * @return Returns a new dataframe that has been ordered accorrding to the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by amount from least to most.
     * const orderedDf = salesDf.orderBy(sale => sale.Amount); 
     * </pre>
     */
    orderBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT> {
        const content = this.getContent();
        return new OrderedDataFrame<IndexT, ValueT, SortT>({
            columnNames: content.columnNames,
            values: content.values, 
            pairs: content.pairs, 
            selector: selector, 
            direction: Direction.Ascending, 
            parent: null,
        });
    }

    /**
     * Sorts the dataframe in descending order by a value defined by the user-defined selector function. 
     * 
     * @param selector User-defined selector function that selects the value to sort by.
     * 
     * @return Returns a new dataframe that has been ordered accorrding to the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by amount from most to least
     * const orderedDf = salesDf.orderByDescending(sale => sale.Amount); 
     * </pre>
     */
    orderByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT> {
        const content = this.getContent();
        return new OrderedDataFrame<IndexT, ValueT, SortT>({
            columnNames: content.columnNames,
            values: content.values, 
            pairs: content.pairs, 
            selector: selector, 
            direction: Direction.Descending, 
            parent: null,
        });
    }
        
    /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains the union of rows from the two input dataframes.
     * These are the unique combination of rows in both dataframe.
     * This is basically a concatenation and then elimination of duplicates.
     *
     * @param other The other dataframes to merge.
     * @param [selector] Optional user-defined selector function that selects the value to compare to detemrine distinctness.
     * 
     * @return Returns the union of the two dataframes.
     * 
     * @example
     * <pre>
     *
     * const dfA = ...
     * const dfB = ...
     * const merged = dfA.union(dfB);
     * </pre>
     * 
     * @example
     * <pre>
     *
     * // Merge two sets of customer records that may contain the same
     * // customer record in each set. This is basically a concatenation
     * // of the dataframes and then an elimination of any duplicate records
     * // that result.
     * const customerRecordsA = ...
     * const customerRecordsB = ...
     * const mergedCustomerRecords = customerRecordsA.union(
     *      customerRecordsB, 
     *      customerRecord => customerRecord.CustomerId
     * );
     * </pre>
     * 
     * 
     * @example
     * <pre>
     *
     * // Note that you can achieve the exact same result as the previous
     * // example by doing a {@link DataFrame.concat) and {@link DataFrame.distinct}
     * // of the dataframes and then an elimination of any duplicate records
     * // that result.
     * const customerRecordsA = ...
     * const customerRecordsB = ...
     * const mergedCustomerRecords = customerRecordsA
     *      .concat(customerRecordsB)
     *      .distinct(customerRecord => customerRecord.CustomerId);
     * </pre>
     * 
     */
    union<KeyT = ValueT> (
        other: IDataFrame<IndexT, ValueT>, 
        selector?: SelectorFn<ValueT, KeyT>): 
            IDataFrame<IndexT, ValueT> {

        if (selector) {
            if (!isFunction(selector)) throw new Error("Expected optional 'selector' parameter to 'DataFrame.union' to be a selector function.");
        }

        return this.concat(other).distinct(selector);
    };

    /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains the intersection of rows from the two input dataframes.
     * These are only the rows that appear in both dataframes.
     *
     * @param inner The inner dataframe to merge (the dataframe you call the function on is the 'outer' dataframe).
     * @param [outerSelector] Optional user-defined selector function that selects the key from the outer dataframe that is used to match the two dataframes.
     * @param [innerSelector] Optional user-defined selector function that selects the key from the inner dataframe that is used to match the two dataframes.
     * 
     * @return Returns a new dataframe that contains the intersection of rows from the two input dataframes.
     * 
     * @example
     * <pre>
     * 
     * const dfA = ...
     * const dfB = ...
     * const mergedDf = dfA.intersection(dfB);
     * </pre>
     * 
     * @example
     * <pre>
     *
     * // Merge two sets of customer records to find only the
     * // customers that appears in both.
     * const customerRecordsA = ...
     * const customerRecordsB = ...
     * const intersectionOfCustomerRecords = customerRecordsA.intersection(
     *      customerRecordsB, 
     *      customerRecord => customerRecord.CustomerId
     * );
     * </pre>     
     * */
    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            IDataFrame<IndexT, ValueT> {

        if (outerSelector) {
            if (!isFunction(outerSelector)) throw new Error("Expected optional 'outerSelector' parameter to 'DataFrame.intersection' to be a function.");
        }
        else {
            outerSelector = value => <KeyT> <any> value;
        }
        
        if (innerSelector) {
            if (!isFunction(innerSelector)) throw new Error("Expected optional 'innerSelector' parameter to 'DataFrame.intersection' to be a function.");
        }
        else {
            innerSelector = value => <KeyT> <any> value;
        }

        const outer = this;
        return outer.where(outerValue => {
                const outerKey = outerSelector!(outerValue);
                return inner
                    .where(innerValue => outerKey === innerSelector!(innerValue))
                    .any();
            });
    };

    /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains only the rows from the 1st dataframe that don't appear in the 2nd dataframe.
     * This is essentially subtracting the rows from the 2nd dataframe from the 1st and creating a new dataframe with the remaining rows.
     *
     * @param inner The inner dataframe to merge (the dataframe you call the function on is the 'outer' dataframe).
     * @param [outerSelector] Optional user-defined selector function that selects the key from the outer dataframe that is used to match the two dataframes.
     * @param [innerSelector] Optional user-defined selector function that selects the key from the inner dataframe that is used to match the two dataframes.
     * 
     * @return Returns a new dataframe that contains only the rows from the 1st dataframe that don't appear in the 2nd dataframe.
     * 
     * @example
     * <pre>
     * 
     * const dfA = ...
     * const dfB = ...
     * const remainingDf = dfA.except(dfB);
     * </pre>
     * 
     * @example
     * <pre>
     *
     * // Find the list of customers haven't bought anything recently.
     * const allCustomers = ... list of all customers ...
     * const recentCustomers = ... list of customers who have purchased recently ...
     * const remainingCustomers = allCustomers.except(
     *      recentCustomers, 
     *      customerRecord => customerRecord.CustomerId
     * );
     * </pre>
     */
    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            IDataFrame<IndexT, ValueT> {

        if (outerSelector) {
            if (!isFunction(outerSelector)) throw new Error("Expected optional 'outerSelector' parameter to 'DataFrame.except' to be a function.");
        }
        else {
            outerSelector = value => <KeyT> <any> value;
        }

        if (innerSelector) {
            if (!isFunction(innerSelector)) throw new Error("Expected optional 'innerSelector' parameter to 'DataFrame.except' to be a function.");
        }
        else {
            innerSelector = value => <KeyT> <any> value;
        }

        const outer = this;
        return outer.where(outerValue => {
                const outerKey = outerSelector!(outerValue);
                return inner
                    .where(innerValue => outerKey === innerSelector!(innerValue))
                    .none();
            });
    };

   /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains only those rows that have matching keys in both input dataframes.
     *
     * @param inner The 'inner' dataframe to join (the dataframe you are callling the function on is the 'outer' dataframe).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer dataframe.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner dataframe.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * @return Returns the new merged dataframe.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought both product A and product B.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const customersWhoBoughtBothProductsDf = customerWhoBoughtProductA.join(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */
    join<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>):
            IDataFrame<number, ResultValueT> {

        if (!isFunction(outerKeySelector)) throw new Error("Expected 'outerKeySelector' parameter of 'DataFrame.join' to be a selector function.");
        if (!isFunction(innerKeySelector)) throw new Error("Expected 'innerKeySelector' parameter of 'DataFrame.join' to be a selector function.");
        if (!isFunction(resultSelector)) throw new Error("Expected 'resultSelector' parameter of 'DataFrame.join' to be a selector function.");

        const outer = this;

        return new DataFrame<number, ResultValueT>(() => {
            const innerMap = inner
                .groupBy(innerKeySelector)
                .toObject(
                    group => innerKeySelector(group.first()), 
                    group => group
                );

            const outerContent = outer.getContent();

            const output: ResultValueT[] = [];
            
            for (const outerValue of outer) { //TODO: There should be an enumerator that does this.
                const outerKey = outerKeySelector(outerValue);
                const innerGroup = innerMap[outerKey];
                if (innerGroup) {
                    for (const innerValue of innerGroup) {
                        output.push(resultSelector(outerValue, innerValue));
                    }    
                }
            }

            return {
                values: output
            };
        });
    }

    /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains only those rows that are only present in one or the other of the dataframes, not both.
     *
     * @param inner The 'inner' dataframe to join (the dataframe you are callling the function on is the 'outer' dataframe).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer dataframe.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner dataframe.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @return Returns the new merged dataframe.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought either product A or product B, not not both.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const customersWhoBoughtEitherProductButNotBothDf = customerWhoBoughtProductA.joinOuter(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */
    joinOuter<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            IDataFrame<number, ResultValueT> {

        if (!isFunction(outerKeySelector)) throw new Error("Expected 'outerKeySelector' parameter of 'DataFrame.joinOuter' to be a selector function.");
        if (!isFunction(innerKeySelector)) throw new Error("Expected 'innerKeySelector' parameter of 'DataFrame.joinOuter' to be a selector function.");
        if (!isFunction(resultSelector)) throw new Error("Expected 'resultSelector' parameter of 'DataFrame.joinOuter' to be a selector function.");

        // Get the results in the outer that are not in the inner.
        const outer = this;
        const outerResult = outer.except<InnerIndexT, InnerValueT, KeyT>(inner, outerKeySelector, innerKeySelector)
            .select(outer => resultSelector(outer, null))
            .resetIndex();

        // Get the results in the inner that are not in the outer.
        const innerResult = inner.except<IndexT, ValueT, KeyT>(outer, innerKeySelector, outerKeySelector)
            .select(inner => resultSelector(null, inner))
            .resetIndex();

        // Get the intersection of results between inner and outer.
        const intersectionResults = outer.join<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner, outerKeySelector, innerKeySelector, resultSelector);

        return outerResult
            .concat(intersectionResults)
            .concat(innerResult)
            .resetIndex();
    };

    /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains only those rows that present either in both dataframes or only in the outer (left) dataframe.
     * 
     * @param inner The 'inner' dataframe to join (the dataframe you are callling the function on is the 'outer' dataframe).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer dataframe.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner dataframe.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @return Returns the new merged dataframe.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought either just product A or both product A and product B.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const boughtJustAorAandB = customerWhoBoughtProductA.joinOuterLeft(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */
    joinOuterLeft<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            IDataFrame<number, ResultValueT> {

        if (!isFunction(outerKeySelector)) throw new Error("Expected 'outerKeySelector' parameter of 'DataFrame.joinOuterLeft' to be a selector function.");
        if (!isFunction(innerKeySelector)) throw new Error("Expected 'innerKeySelector' parameter of 'DataFrame.joinOuterLeft' to be a selector function.");
        if (!isFunction(resultSelector)) throw new Error("Expected 'resultSelector' parameter of 'DataFrame.joinOuterLeft' to be a selector function.");

        // Get the results in the outer that are not in the inner.
        const outer = this;
        const outerResult = outer.except<InnerIndexT, InnerValueT, KeyT>(inner, outerKeySelector, innerKeySelector)
            .select(outer => resultSelector(outer, null))
            .resetIndex();

        // Get the intersection of results between inner and outer.
        const intersectionResults = outer.join<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner, outerKeySelector, innerKeySelector, resultSelector);

        return outerResult
            .concat(intersectionResults)
            .resetIndex();
    };

    /**
     * Creates a new dataframe by merging two input dataframes.
     * The resulting dataframe contains only those rows that present either in both dataframes or only in the inner (right) dataframe.
     *
     * @param inner The 'inner' dataframe to join (the dataframe you are callling the function on is the 'outer' dataframe).
     * @param outerKeySelector User-defined selector function that chooses the join key from the outer dataframe.
     * @param innerKeySelector User-defined selector function that chooses the join key from the inner dataframe.
     * @param resultSelector User-defined function that merges outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @return Returns the new merged dataframe.
     * 
     * @example
     * <pre>
     * 
     * // Join together two sets of customers to find those
     * // that have bought either just product B or both product A and product B.
     * const customerWhoBoughtProductA = ...
     * const customerWhoBoughtProductB = ...
     * const boughtJustAorAandB = customerWhoBoughtProductA.joinOuterRight(
     *          customerWhoBoughtProductB,
     *          customerA => customerA.CustomerId, // Join key.
     *          customerB => customerB.CustomerId, // Join key.
     *          (customerA, customerB) => {
     *              return {
     *                  // ... merge the results ...
     *              };
     *          }
     *      );
     * </pre>
     */
    joinOuterRight<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            IDataFrame<number, ResultValueT> {

        if (!isFunction(outerKeySelector)) throw new Error("Expected 'outerKeySelector' parameter of 'DataFrame.joinOuterRight' to be a selector function.");
        if (!isFunction(innerKeySelector)) throw new Error("Expected 'innerKeySelector' parameter of 'DataFrame.joinOuterRight' to be a selector function.");
        if (!isFunction(resultSelector)) throw new Error("Expected 'resultSelector' parameter of 'DataFrame.joinOuterRight' to be a selector function.");

        // Get the results in the inner that are not in the outer.
        const outer = this;
        const innerResult = inner.except<IndexT, ValueT, KeyT>(outer, innerKeySelector, outerKeySelector)
            .select(inner => resultSelector(null, inner))
            .resetIndex();

        // Get the intersection of results between inner and outer.
        const intersectionResults = outer.join<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner, outerKeySelector, innerKeySelector, resultSelector);

        return intersectionResults
            .concat(innerResult)
            .resetIndex();
    }    

    /**
     * Produces a summary of dataframe. A bit like the 'aggregate' function but much simpler.
     * 
     * @param [spec] Optional parameter that specifies which columns to aggregate and how to aggregate them. Leave this out to produce a default summary of all columns.
     * 
     * @returns A object with fields that summary the values in the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const summary = df.summarize();
     * console.log(summary);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const summary = df.summarize({ // Summarize using pre-defined functions.
     *      Column1: Series.sum,
     *      Column2: Series.average,
     *      Column3: Series.count,
     * });
     * console.log(summary);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const summary = df.summarize({ // Summarize using custom functions.
     *      Column1: series => series.sum(),
     *      Column2: series => series.std(),
     *      ColumnN: whateverFunctionYouWant,
     * });
     * console.log(summary);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const summary = df.summarize({ // Multiple output fields per column.
     *      Column1: {
     *          OutputField1: Series.sum,
     *          OutputField2: Series.average,
     *      },
     *      Column2: {
     *          OutputField3: series => series.sum(),
     *          OutputFieldN: whateverFunctionYouWant,
     *      },
     * });
     * console.log(summary);
     * </pre>
     */
    summarize<OutputValueT = any> (
        spec?: IMultiColumnAggregatorSpec
            ): OutputValueT {

        if (spec && !isObject(spec)) {
            throw new Error("Expected 'spec' parameter to 'DataFrame.summarize' to be an object that specifies how to summarize the dataframe.");
        }

        if (!spec) {
            spec = {};

            for (const columnName of this.getColumnNames()) {
                const columnSpec: any = {};
                columnSpec[columnName + "_sum"] = Series.sum;
                columnSpec[columnName + "_average"] = Series.average;
                columnSpec[columnName + "_count"] = Series.count;
                spec[columnName] = columnSpec;

            }
        }

        for (const inputColumnName of Object.keys(spec)) {
            const inputSpec = spec[inputColumnName];
            if (isFunction(inputSpec)) {
                spec[inputColumnName] = {}; // Expand the spec.
                (spec[inputColumnName] as IColumnAggregatorSpec) [inputColumnName] = inputSpec;
            }
        }

        const inputColumnNames = Object.keys(spec);
        const outputFieldsMap = toMap(
            inputColumnNames, 
            valueColumnName => valueColumnName, 
            inputColumnName => Object.keys(spec![inputColumnName])
        );

        const output: any = {};
        
        for (const inputColumnName of inputColumnNames) {
            const outputFieldNames = outputFieldsMap[inputColumnName];
            for (const outputFieldName of outputFieldNames) {
                const aggregatorFn = (spec[inputColumnName] as IColumnAggregatorSpec)[outputFieldName];
                output[outputFieldName] = aggregatorFn(this.getSeries(inputColumnName));
            }
        }

        return output;
    }
    
    /**
     * Reshape (or pivot) a dataframe based on column values.
     * This is a powerful function that combines grouping, aggregation and sorting.
     *
     * @param columnOrColumns Column name whose values make the new DataFrame's columns.
     * @param valueColumnNameOrSpec Column name or column spec that defines the columns whose values should be aggregated.
     * @param [aggregator] Optional function used to aggregate pivotted vales. 
     *
     * @return Returns a new dataframe that has been pivoted based on a particular column's values. 
     * 
     * @example
     * <pre>
     * 
     * // Simplest example.
     * // Group by the values in 'PivotColumn'.
     * // The unique set of values in 'PivotColumn' becomes the columns in the resulting dataframe.
     * // The column 'ValueColumn' is aggregated for each group and this becomes the 
     * // values in the new output column.
     * const pivottedDf = df.pivot("PivotColumn", "ValueColumn", values => values.average());
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * // Multiple input column example.
     * // Similar to the previous example except now we are aggregating multiple input columns.
     * // Each group has the average computed for 'ValueColumnA' and the sum for 'ValueColumnB'.
     * const pivottedDf = df.pivot("PivotColumn", { 
     *      ValueColumnA: aValues => aValues.average(),
     *      ValueColumnB:  bValues => bValues.sum(),
     * });
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * // Multiple output column example.
     * // Similar to the previous example except now we are doing multiple aggregations for each input column.
     * // The example produces an output dataframe with columns OutputColumnA, B, C and D.
     * // OutputColumnA/B are the sum and average of ValueColumnA across each group as defined by PivotColumn.
     * // OutputColumnC/D are the sum and average of ValueColumnB across each group as defined by PivotColumn.
     * const pivottedDf = df.pivot("PivotColumn", { 
     *      ValueColumnA: {
     *          OutputColumnA: aValues => aValues.sum(),
     *          OutputColumnB: aValues => aValues.average(),
     *      },
     *      ValueColumnB: {
     *          OutputColumnC: bValues => bValues.sum(),
     *          OutputColumnD: bValues => bValues.average(),
     *      },
     * });
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * // Full multi-column example.
     * // Similar to the previous example now we are pivotting on multiple columns.
     * // We now group by the 'PivotColumnA' and then by 'PivotColumnB', effectively creating a 
     * // multi-level group.
     * const pivottedDf = df.pivot(["PivotColumnA", "PivotColumnB" ], { 
     *      ValueColumnA: aValues => aValues.average(),
     *      ValueColumnB:  bValues => bValues.sum(),
     * });
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * // To help understand the pivot function, let's look at what it does internally.
     * // Take the simplest example:
     * const pivottedDf = df.pivot("PivotColumn", "ValueColumn", values => values.average());
     * 
     * // If we expand out the internals of the pivot function, it will look something like this:
     * const pivottedDf = df.groupBy(row => row.PivotColumn)
     *          .select(group => ({
     *              PivotColumn: group.deflate(row => row.ValueColumn).average()
     *          }))
     *          .orderBy(row  => row.PivotColumn);
     * 
     * // You can see that pivoting a dataframe is the same as grouping, aggregating and sorting it.
     * // Does pivoting seem simpler now?
     * 
     * // It gets more complicated than that of course, because the pivot function supports multi-level nested 
     * // grouping and aggregation of multiple columns. So a full expansion of the pivot function is rather complex.
     * </pre>
     */
    pivot<NewValueT = ValueT> (
        columnOrColumns: string | Iterable<string>, 
        valueColumnNameOrSpec: string | IMultiColumnAggregatorSpec, 
        aggregator?: (values: ISeries<number, any>) => any
            ): IDataFrame<number, NewValueT> {

        let columnNames: string[];

        if (isString(columnOrColumns)) {
            columnNames = [columnOrColumns];
        }
        else {
            if (!isArray(columnOrColumns)) throw new Error("Expected 'columnOrColumns' parameter to 'DataFrame.pivot' to be a string or an array of strings that identifies the column(s) whose values make the new DataFrame's columns.");

            columnNames = Array.from(columnOrColumns);

            if (columnNames.length === 0) throw new Error("Expected 'columnOrColumns' parameter to 'DataFrame.pivot' to contain at least one string.");

            for (const columnName of columnNames) {
                if (!isString(columnName)) throw new Error("Expected 'columnOrColumns' parameter to 'DataFrame.pivot' to be an array of strings, each string identifies a column in the DataFrame on which to pivot.");
            }
        }

        let aggSpec: IMultiColumnAggregatorSpec;

        if (!isObject(valueColumnNameOrSpec)) {
            if (!isString(valueColumnNameOrSpec)) throw new Error("Expected 'value' parameter to 'DataFrame.pivot' to be a string that identifies the column whose values to aggregate or a column spec that defines which column contains the value ot aggregate and the ways to aggregate that value.");
            if (!isFunction(aggregator)) throw new Error("Expected 'aggregator' parameter to 'DataFrame.pivot' to be a function to aggegrate pivoted values.");

            const aggColumnName = valueColumnNameOrSpec as string;

            const outputSpec: IColumnAggregatorSpec = {};
            outputSpec[aggColumnName] = aggregator!;

            aggSpec = {};
            aggSpec[aggColumnName] = outputSpec;
        }
        else {
            aggSpec = valueColumnNameOrSpec as IMultiColumnAggregatorSpec;

            for (const inputColumnName of Object.keys(aggSpec)) {
                const columnAggSpec = aggSpec[inputColumnName];
                if (isFunction(columnAggSpec)) {
                    aggSpec[inputColumnName] = {}; // Expand the pivot spec.
                    (aggSpec[inputColumnName] as IColumnAggregatorSpec) [inputColumnName] = columnAggSpec;
                }
            }
        }

        const firstColumnName = columnNames[0];
        let working = this.groupBy((row: any) => row[firstColumnName])
            .select(group => {
                const output: any = {};
                output[firstColumnName] = (group.first() as any)[firstColumnName];
                output.src = group;
                return output;
            });

        for (let columnNameIndex = 1; columnNameIndex < columnNames.length; ++columnNameIndex) {
            const nextColumnName = columnNames[columnNameIndex];
            working = working.selectMany(parentGroup => {
                    const src: IDataFrame<IndexT, ValueT> = parentGroup.src;
                    return src.groupBy((row: any) => row[nextColumnName])
                        .select(subGroup => {
                            const output = Object.assign({}, parentGroup);
                            output[nextColumnName] = (subGroup.first() as any)[nextColumnName];
                            output.src = subGroup;
                            return output;
                        });
                });
        }

        const valueColumnNames = Object.keys(aggSpec);
        const outputColumnsMap = toMap(
            valueColumnNames, 
            valueColumnName => valueColumnName, 
            valueColumnName => Object.keys(aggSpec[valueColumnName])
        );
        
        const pivotted = working.inflate<NewValueT>((row: any) => {
            for (const valueColumnName of valueColumnNames) {
                const outputColumnNames = outputColumnsMap[valueColumnName];
                for (const outputColumName of outputColumnNames) {
                    const aggregatorFn = (aggSpec[valueColumnName] as IColumnAggregatorSpec)[outputColumName];
                    row[outputColumName] = aggregatorFn(row.src.deflate((srcRow: any) => srcRow[valueColumnName])) 
                }
            }

            delete row.src;
            return row;
        });

        let ordered = pivotted.orderBy((row: any) => row[firstColumnName]);
        for (let columnNameIndex = 1; columnNameIndex < columnNames.length; ++columnNameIndex) {
            const nextColumnName = columnNames[columnNameIndex];
            ordered = ordered.thenBy((row: any) => row[nextColumnName]);
        }

        return ordered;
    }
    
    /**
     * Insert a pair at the start of the dataframe.
     * Doesn't modify the original dataframe! The returned dataframe is entirely new and contains rows from the original dataframe plus the inserted pair.
     *
     * @param pair The pair to insert.
     * 
     * @return Returns a new dataframe with the specified pair inserted.
     * 
     * @example
     * <pre>
     * 
     * const newIndex = ... index of the new row ...
     * const newRow = ... the new data row to insert ...
     * const insertedDf = df.insertPair([newIndex, newRows]);
     * </pre>
     */
    insertPair (pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT> {
        if (!isArray(pair)) throw new Error("Expected 'pair' parameter to 'DataFrame.insertPair' to be an array.");
        if (pair.length !== 2) throw new Error("Expected 'pair' parameter to 'DataFrame.insertPair' to be an array with two elements. The first element is the index, the second is the value.");

        return (new DataFrame<IndexT, ValueT>({ pairs: [pair] })).concat(this);
    }

    /**
     * Append a pair to the end of a dataframe.
     * Doesn't modify the original dataframe! The returned dataframe is entirely new and contains rows from the original dataframe plus the appended pair.
     *
     * @param pair - The pair to append.
     *  
     * @return Returns a new dataframe with the specified pair appended.
     * 
     * @example
     * <pre>
     * 
     * const newIndex = ... index of the new row ...
     * const newRow = ... the new data row to append ...
     * const appendedDf = df.appendPair([newIndex, newRows]);
     * </pre>
     */
    appendPair (pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT> {
        if (!isArray(pair)) throw new Error("Expected 'pair' parameter to 'DataFrame.appendPair' to be an array.");
        if (pair.length !== 2) throw new Error("Expected 'pair' parameter to 'DataFrame.appendPair' to be an array with two elements. The first element is the index, the second is the value.");

        return this.concat(new DataFrame<IndexT, ValueT>({ pairs: [pair] }));
    }

    /**
     * Fill gaps in a dataframe.
     *
     * @param comparer User-defined comparer function that is passed pairA and pairB, two consecutive rows, return truthy if there is a gap between the rows, or falsey if there is no gap.
     * @param generator User-defined generator function that is passed pairA and pairB, two consecutive rows, returns an array of pairs that fills the gap between the rows.
     *
     * @return Returns a new dataframe with gaps filled in.
     * 
     * @example
     * <pre>
     * 
     *   var sequenceWithGaps = ...
     *
     *  // Predicate that determines if there is a gap.
     *  var gapExists = (pairA, pairB) => {
     *      // Returns true if there is a gap.
     *      return true;
     *  };
     *
     *  // Generator function that produces new rows to fill the game.
     *  var gapFiller = (pairA, pairB) => {
     *      // Create an array of index, value pairs that fill the gaps between pairA and pairB.
     *      return [
     *          newPair1,
     *          newPair2,
     *          newPair3,
     *      ];
     *  };
     *
     *  var sequenceWithoutGaps = sequenceWithGaps.fillGaps(gapExists, gapFiller);
     * </pre>
     */
    fillGaps (comparer: ComparerFn<[IndexT, ValueT], [IndexT, ValueT]>, generator: GapFillFn<[IndexT, ValueT], [IndexT, ValueT]>): IDataFrame<IndexT, ValueT> {
        if (!isFunction(comparer)) throw new Error("Expected 'comparer' parameter to 'DataFrame.fillGaps' to be a comparer function that compares two values and returns a boolean.")
        if (!isFunction(generator)) throw new Error("Expected 'generator' parameter to 'DataFrame.fillGaps' to be a generator function that takes two values and returns an array of generated pairs to span the gap.")

        return this.rollingWindow(2)
            .selectMany(window => {
                const pairs = window.toPairs();
                const pairA = pairs[0];
                const pairB = pairs[1];
                if (!comparer(pairA, pairB)) {
                    return [pairA];
                }

                const generatedRows = generator(pairA, pairB);
                if (!isArray(generatedRows)) throw new Error("Expected return from 'generator' parameter to 'DataFrame.fillGaps' to be an array of pairs, instead got a " + typeof(generatedRows));

                return [pairA].concat(generatedRows);
            })
            .withIndex(pair => pair[0])
            .inflate(pair => pair[1])
            .concat(this.tail(1));
            
    }

    /**
     * Returns the specified default dataframe if the dataframe is empty. 
     *
     * @param defaultDataFrame Default dataframe to return if the dataframe is empty.
     * 
     * @return Returns 'defaultDataFrame' if the dataframe is empty. 
     * 
     * @example
     * <pre>
     * 
     * const emptyDataFrame = new DataFrame();
     * const defaultDataFrame = new DataFrame([ { A: 1 }, { A: 2 }, { A: 3 } ]);
     * expect(emptyDataFrame.defaultIfEmpty(defaultDataFrame)).to.eql(defaultDataFrame);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const nonEmptyDataFrame = new DataFrame([ { A: 100 }]);
     * const defaultDataFrame = new DataFrame([ { A: 1 }, { A: 2 }, { A: 3 } ]);
     * expect(nonEmptyDataFrame.defaultIfEmpty(defaultDataFrame)).to.eql(nonEmptyDataFrame);
     * </pre>
     */
    defaultIfEmpty (defaultDataFrame: ValueT[] | IDataFrame<IndexT, ValueT>): IDataFrame<IndexT, ValueT> {

        if (this.none()) {
            if (defaultDataFrame instanceof DataFrame) {
                return <IDataFrame<IndexT, ValueT>> defaultDataFrame;
            }
            else if (isArray(defaultDataFrame)) {
                return new DataFrame<IndexT, ValueT>(defaultDataFrame);
            }
            else {
                throw new Error("Expected 'defaultSequence' parameter to 'DataFrame.defaultIfEmpty' to be an array or a series.");
            }
        } 
        else {
            return this;
        }
    }

    /**
     * Detect the the frequency of the types of the values in the dataframe.
     * This is a good way to understand the shape of your data.
     *
     * @return Returns a dataframe with rows that confirm to {@link ITypeFrequency} that describes the data types contained in the original dataframe.
     * 
     * @example
     * <pre>
     * 
     * const df = dataForge.readFileSync("./my-data.json").parseJSON();
     * const dataTypes = df.detectTypes();
     * console.log(dataTypes.toString());
     * </pre>
     */
    detectTypes (): IDataFrame<number, ITypeFrequency> {
        return new DataFrame<number, ITypeFrequency>(() => {
            const typeFrequencies = this.getColumns()
                .selectMany(column => {
                    return column.series.detectTypes()
                        .select((typeFrequency: any) => {
                            const output = Object.assign({}, typeFrequency);
                            output.Column = column.name;
                            return output;
                        });
                });
            return {
                columnNames: ["Type", "Frequency", "Column"],
                values: typeFrequencies,
            };
        });
    }
    
    /**
     * Detect the frequency of the values in the dataframe.
     * This is a good way to understand the shape of your data.
     *
     * @return Returns a dataframe with rows that conform to {@link IValueFrequency} that describes the values contained in the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const df = dataForge.readFileSync("./my-data.json").parseJSON();
     * const dataValues = df.detectedValues();
     * console.log(dataValues.toString());
     * </pre>
     */
    detectValues (): IDataFrame<number, IValueFrequency> {
        return new DataFrame<number, IValueFrequency>(() => {
            const valueFrequencies = this.getColumns()
                .selectMany(column => {
                    return column.series.detectValues()
                        .select((valueFrequency: any) => {
                            const output = Object.assign({}, valueFrequency);
                            output.Column = column.name;
                            return output;
                        });
                });
            return {
                columnNames: ["Value", "Frequency", "Column"],
                values: valueFrequencies,
            };
        });
    }

    /**
     * Serialize the dataframe to the JSON data format.
     * 
     * @return Returns a string in the JSON data format that represents the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const jsonData = df.toJSON();
     * console.log(jsonData);
     * </pre>
     */
    toJSON (): string {
        return JSON.stringify(this.toArray(), null, 4);
    }

    /**
     * Serialize the dataframe to the JSON5 data format.
     * 
     * @return Returns a string in the JSON5 data format that represents the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const jsonData = df.toJSON5();
     * console.log(jsonData);
     * </pre>
     */
    toJSON5 (): string {
        return JSON5.stringify(this.toArray(), null, 4);
    }

    /**
     * Serialize the dataframe to the CSV data format.
     * 
     * @return Returns a string in the CSV data format that represents the dataframe.
     * 
     * @example
     * <pre>
     * 
     * const csvData = df.toCSV();
     * console.log(csvData);
     * </pre>
     * 
     * @example
     * <pre>
     * 
     * const csvData = df.toCSV({ header: false });
     * console.log(csvData);
     * </pre>
     */
    toCSV (options?: ICSVOutputOptions): string {
        const headerLine = options === undefined || options.header === undefined || options.header
            ? [this.getColumnNames()]
            : []
            ;
        const rows = headerLine.concat(this.toRows());
        return PapaParse.unparse(rows, options);
    }

    /**
     * Serialize the dataframe to HTML.
     * 
     * @return Returns a string in HTML format that represents the dataframe.
     */
    toHTML (): string {

        const columNames = this.getColumnNames();
        const header = columNames.map(columnName => "            <th>" + columnName + "</th>").join("\n");
        const pairs = this.toPairs();

        return '<table border="1" class="dataframe">\n' + 
            '    <thead>\n' +
            '        <tr style="text-align: right;">\n' +
            '            <th></th>\n' +

            header +

            '\n' +
            '       </tr>\n' +
            '    </thead>\n' +
            '    <tbody>\n' +

            pairs.map(pair => {
                const index = pair[0];
                const value: any = pair[1];
                return '        <tr>\n' +
                    '            <th>' + index + '</th>\n' +
                    columNames.map(columName => {
                            return '            <td>' + value[columName] + '</td>';
                        })
                        .join('\n') +
                        '\n' +
                        '        </tr>';
                })
                .join('\n') +

            '\n' +
            '    </tbody>\n' +
            '</table>';
    }    

    /**
     * Serialize the dataframe to an ordinary JavaScript data structure.
     * The resulting data structure is suitable for further serialization to JSON and can be used to 
     * transmit a DataFrame and its internal structure over the wire.
     * Use the {@link deserialize} function to later reconstitute the serialized dataframe.
     * 
     * @return Returns a JavaScript data structure conforming to {@link ISerializedDataFrame} that represents the dataframe and its internal structure.
     * 
     * @example
     * <pre>
     * 
     * const jsDataStructure = df.serialize();
     * const jsonData = JSON.stringify(jsDataStructure);
     * console.log(jsonData);
     * const deserializedJsDataStructure = JSON.parse(jsonData);
     * const deserializedDf = DataFrame.deserialize(deserializedJsDataStructure); // Reconsituted.
     * </pre>
     */
    serialize (): ISerializedDataFrame {
        let rows = this.toArray(); // Bake the dataframe to an array.
        const index = this.getIndex(); // Extract the index.
        let indexValues = index.head(rows.length).toArray() as any[];
        const columns = this.getColumns();
        const serializedColumns = toMap(columns, column => column.name, column => column.type);
        const indexType = index.getType();
        
        if (indexType === "date") {
            indexValues = indexValues.map(index => moment(index).toISOString()); // Manually serialize date value, they aren't supported directly by JSON.
        }

        let cloned = false;

        // Serialize date values.
        for (const column of columns) {
            if (column.type === "date") {
                if (!cloned) {
                    rows = rows.map(row => Object.assign({}, row)); // Clone so we don't modify any original data.
                    cloned = true;
                }

                for (const row of rows) {
                    row[column.name] = moment(row[column.name]).toISOString(); // Manually serialize date value.
                }
            }
        }
        
        return {
            columnOrder: this.getColumnNames(),
            columns: serializedColumns,
            index: {
                type: indexType,
                values: indexValues,
            },
            values: rows,
        };
    }

    /**
     * Deserialize the dataframe from an ordinary JavaScript data structure.
     * Can reconstitute a dataframe that previously serialized with the {@link serialize} function.
     * This can rebuilds the dataframe with the exact same internal structure after it has been transmitted over the wire.
     * 
     * @param input The serialize JavaScript data structure for the dataframe.
     * 
     * @return Returns the deserialized/reconstituted dataframe.    
     * 
     * @example
     * <pre>
     * 
     * const jsDataStructure = df.serialize();
     * const jsonData = JSON.stringify(jsDataStructure);
     * console.log(jsonData);
     * const deserializedJsDataStructure = JSON.parse(jsonData);
     * const deserializedDf = DataFrame.deserialize(deserializedJsDataStructure); // Reconsituted.
     * </pre>
     */
    static deserialize<IndexT = any,  ValueT = any> (input: ISerializedDataFrame): IDataFrame<IndexT, ValueT> {

        let indexValues = input.index && input.index.values || [];
        let rows = input.values && input.values || [];
        let cloned = false;

        // Deserialize dates.
        if (input.columns) {
            for (const columnName of Object.keys(input.columns)) {
                if (input.columns[columnName] !== "date") {
                    continue; // No need to process other types, they are natively supported by JSON.
                }

                if (!cloned) {
                    rows = rows.map(row => Object.assign({}, row)); // Clone so we don't modify any original data.
                    cloned = true;
                }
    
                for (const row of rows) {
                    row[columnName] = moment(row[columnName]).toDate(); // Manually deserialize data value.
                }
            }
        }

        if (input.index && input.index.type === "date") {
            indexValues = indexValues.map(value => moment(value).toDate()); // Manually deserialize data value.
        }

        return new DataFrame<IndexT, ValueT>({
            columnNames: input.columnOrder || [],
            index: indexValues,
            values: rows,
        });
    }

    /***
     * Allows the dataframe to be queried to confirm that it is actually a dataframe.
     * Used from JavaScript to tell the difference between a Series and a DataFrame.
     * 
     * @return Returns the string "dataframe".
     */
    getTypeCode (): string {
        return "dataframe";
    }
}

/**
 * @hidden
 * The configuration for an ordered dataframe.
 */
interface IOrderedDataFrameConfig<IndexT, ValueT, SortT> {
    //
    // The order of columns for the data frame.
    //
    columnNames: string[] | Iterable<string>;

    //
    // The source values for the ordered dataframe.
    //
    values: Iterable<ValueT>;

    //
    // The source pairs (index,value) for the ordered dataframe.
    //
    pairs: Iterable<[IndexT, ValueT]>;

    //
    // The selector used to get the sorting key for the orderby operation.
    //
    selector: SelectorWithIndexFn<ValueT, SortT>;

    //
    // The sort direction, ascending or descending.
    //
    direction: Direction;

    //
    // The parent dataframe in the orderby operation or null if none.
    //
    parent: OrderedDataFrame<IndexT, ValueT, any> | null;
}

/**
 * @hidden
 * Represents a dataframe that has been sorted.
 */
class OrderedDataFrame<IndexT = number, ValueT = any, SortT = any> 
    extends DataFrame<IndexT, ValueT>
    implements IOrderedDataFrame<IndexT, ValueT, SortT> {

    //
    // Configuration for the ordered dataframe.
    //
    private config: IOrderedDataFrameConfig<IndexT, ValueT, SortT>;

    //
    // Helper function to create a sort spec.
    //
    private static makeSortSpec (sortLevel: number, selector: SortSelectorFn, direction: Direction): ISortSpec {
        return { sortLevel: sortLevel, selector: selector, direction: direction };
    }

    //
    // Helper function to make a sort selector for pairs, this captures the parent correct when generating the closure.
    //
    private static makePairsSelector (selector: SortSelectorFn): SortSelectorFn {
        return (pair: any, index: number) => selector(pair[1], index);
    }

    constructor(config: IOrderedDataFrameConfig<IndexT, ValueT, SortT>) {

        const valueSortSpecs: ISortSpec[] = [];
        const pairSortSpecs: ISortSpec[] = [];
        let sortLevel = 0;

        let parent = config.parent;
        const parents = [];
        while (parent !== null) {
            parents.push(parent);
            parent = parent.config.parent;
        }

        parents.reverse();

        for (const parent of parents) {
            const parentConfig = parent.config;
            valueSortSpecs.push(OrderedDataFrame.makeSortSpec(sortLevel, parentConfig.selector, parentConfig.direction));
            pairSortSpecs.push(OrderedDataFrame.makeSortSpec(sortLevel, OrderedDataFrame.makePairsSelector(parentConfig.selector), parentConfig.direction));
            ++sortLevel;
        }

        valueSortSpecs.push(OrderedDataFrame.makeSortSpec(sortLevel, config.selector, config.direction));
        pairSortSpecs.push(OrderedDataFrame.makeSortSpec(sortLevel, OrderedDataFrame.makePairsSelector(config.selector), config.direction));

        super({
            columnNames: config.columnNames,
            values: new OrderedIterable(config.values, valueSortSpecs),
            pairs: new OrderedIterable(config.pairs, pairSortSpecs)
        });

        this.config = config;
    }

    /** 
     * Applys additional sorting (ascending) to an already sorted dataframe.
     * 
     * @param selector User-defined selector that selects the additional value to sort by.
     * 
     * @return Returns a new dataframe has been additionally sorted by the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by salesperson and then by amount (from least to most).
     * const orderedDf = salesDf.orderBy(sale => sale.SalesPerson).thenBy(sale => sale.Amount);
     * </pre>
     */
    thenBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT> {
        return new OrderedDataFrame<IndexT, ValueT, SortT>({
            columnNames: this.config.columnNames,
            values: this.config.values, 
            pairs: this.config.pairs, 
            selector: selector, 
            direction: Direction.Ascending, 
            parent: this,
        });
    }

    /** 
     * Applys additional sorting (descending) to an already sorted dataframe.
     * 
     * @param selector User-defined selector that selects the additional value to sort by.
     * 
     * @return Returns a new dataframe has been additionally sorted by the value chosen by the selector function. 
     * 
     * @example
     * <pre>
     * 
     * // Order sales by salesperson and then by amount (from most to least).
     * const orderedDf = salesDf.orderBy(sale => sale.SalesPerson).thenByDescending(sale => sale.Amount);
     * </pre>
     */
    thenByDescending<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT> {
        return new OrderedDataFrame<IndexT, ValueT, SortT>({
            columnNames: this.config.columnNames,
            values: this.config.values, 
            pairs: this.config.pairs, 
            selector: selector, 
            direction: Direction.Descending, 
            parent: this,
        });
    }
}