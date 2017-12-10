//
// An iterator that iterates the rows of a CSV file.
//

export class CsvRowsIterator implements Iterator<any> {

    columnNames: string[];
    rows: string[][];
    index: number = 0;

    constructor(columnNames: string[], rows: string[][]) {
        this.columnNames = columnNames;
        this.rows = rows;
    }

    next(): IteratorResult<any> {
        if (this.index < this.rows.length) {
            var row = this.rows[this.index++];
            var value: any = {};
            for (var cellIndex = 0; cellIndex < row.length; ++cellIndex) {
                var columnName = this.columnNames[cellIndex];
                value[columnName] = row[cellIndex];
            }

            return {
                done: false, 
                value: value,
            };
        }
        else {
            // https://github.com/Microsoft/TypeScript/issues/8938
            return ({ done: true } as IteratorResult<any>)  // <= explicit cast here!;
        }
    }

}