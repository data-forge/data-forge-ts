//
// An iterator that iterates the rows of a CSV file.
//

export class CsvRowsIterator implements Iterator<any> {

    columnNames: string[];
    rowsIterator: Iterator<any>;
    index: number = 0;

    constructor(columnNames: Iterable<string>, rowsIterable: Iterable<any>) {
        this.columnNames = Array.from(columnNames);
        this.rowsIterator = rowsIterable[Symbol.iterator]();
    }

    next(): IteratorResult<any> {

        var result = this.rowsIterator.next();
        if (result.done) {
            // https://github.com/Microsoft/TypeScript/issues/8938
            return ({ done: true } as IteratorResult<any>)  // <= explicit cast here!;
        }

        var row = result.value;
        var value: any = {};
        for (var cellIndex = 0; cellIndex < this.columnNames.length; ++cellIndex) {
            var columnName = this.columnNames[cellIndex];
            value[columnName] = row[cellIndex];
        }

        return {
            done: false, 
            value: value,
        };
   }
}