class Board {
    constructor(cols, rows) {
        this.cols = cols
        this.rows = rows
        this.field = this.constructInitialField();
    }

    constructInitialField() {
        var field = []
        for (var i = 0; i < this.rows; i++) {
            field.push([]);
            for (var j = 0; j < this.cols; j++) {
                field[i].push(0)
            }
        }
        field[0][this.cols - 2] = -9
        field[this.rows - 1][1] = 9
        // field[1][3] = -1
        // field[3][1] = 1
        return field
    }

    stringifyBoard(field) {
        var string = ""
        for (var i =0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var substring = field[i][j].toString()
                string += substring
            }
        }
        return string
    }

}