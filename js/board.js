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
        if (this.rows % 2 == 0 && this.cols % 2 == 0) {
            var rowMid = this.rows / 2;
            var colMid = this.cols / 2;
            field[rowMid][colMid-1] = 9;
            field[rowMid-1][colMid] = -9;
        } else {
            field[2][3] = -9
            field[3][2] = 9    
        }

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