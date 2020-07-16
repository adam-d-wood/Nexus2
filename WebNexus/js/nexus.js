class Nexus {
    constructor(cols, rows) {
        this.board = new Board(cols, rows)
        this.turn = 1
        this.controlThresholds = [1, 2, 4]
        this.openings = null
        this.loadOpenings(this.callback)
        this.inBook = true
    }

    loadOpenings(callback) {
        // requests the opening book from a text file
    
        var self = this;
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            callback(this, self);
          }
        };
        var fileName = "books/" + this.board.cols.toString() + "x" +
                        this.board.rows.toString() + "openings.txt"
        xhttp.open("GET", fileName, true);
        xhttp.send();
      }
    
      callback(xhttp, self) {
        // is run when the opening book text file is posted
        
        let jsonTree = xhttp.responseText;
        var openingTree = JSON.parse(jsonTree)
        // console.log(openingTree)
        self.openings = openingTree;
      }
    

    onBoard(i, j) {
        var widthValid = 0 <= j && j < this.board.cols
        var heightValid = (0 <= i && i < this.board.rows)
        return widthValid && heightValid
    }

    genDPattern(i, j) {
        var squares = []
        var directions = [
            [0, 1], [1, 0], [0, -1], [-1, 0]
        ]
        for (var direction of directions) {
            var square = [i + direction[0], j + direction[1]]
            if (this.onBoard(square[0], square[1])) {
                squares.push(square)
            }
        }
        return squares
    }

    genRamPattern(i, j) {
        var squares = []
        var n = Math.max(this.board.cols, this.board.rows)
        for (var k = -n; k < n; k++) {
            var square1 = [i+k, j]
            var square2 = [i, j+k]
            for (var square of [square1, square2]) {
                if(this.onBoard(square[0], square[1]) && !JSON.stringify(squares).includes(square)) {
                    if (JSON.stringify(square) != JSON.stringify([i, j])) {
                        squares.push(square)
                    }
                }
            }
        }
        return squares
    }

    genDiagonal(i, j) {
        var squares = []
        var n = Math.max(this.board.cols, this.board.rows)
        for (var k = -n; k < n; k++) {
            var square1 = [i+k, j+k]
            var square2 = [i-k, j+k]
            for (var square of [square1, square2]) {
                if(this.onBoard(square[0], square[1]) && !JSON.stringify(squares).includes(square)) {
                    if (JSON.stringify(square) != JSON.stringify([i, j])) {
                        squares.push(square)
                    }
                }
            }
        }
        return squares
    }

    eliminatePieces(field) {
        var elimination = false
        var newField = JSON.parse(JSON.stringify(field))
        var controlMatrix = this.getControlMatrix(field)
        for (var i = 0; i < this.board.rows; i++) {
            for (var j = 0; j < this.board.cols; j++) {
                var token = field[i][j]
                if (![0, 9, -9].includes(token)) {
                    var control = controlMatrix[i][j]
                    var controlNeeded = this.tokenToControl(token)
                    if (Math.abs(control) < Math.abs(controlNeeded)) {
                        newField[i][j] = 0
                        elimination = true
                    }
                }
            }
        }
        return [newField, elimination]
    }

    getControlMatrix(field) {
        var controlMatrix = [...Array(this.board.rows)].map(x=>Array(this.board.cols).fill(0))
        // console.log("yeet", controlMatrix)
        for (var i = 0; i < this.board.rows; i++) {
            for (var j = 0; j < this.board.cols; j++) {
                var token = field[i][j]
                if ([1, 9].includes(Math.abs(token))) {
                    var affectedCells = this.genDPattern(i, j)
                    for (var cell of affectedCells) {
                        controlMatrix[cell[0]][cell[1]] += token / Math.abs(token)
                    }
                } else if (Math.abs(token) == 2) {
                    var affectedCells = this.genDiagonal(i, j)
                    for (var cell of affectedCells) {
                        controlMatrix[cell[0]][cell[1]] += token / Math.abs(token)
                    }
                } else if (Math.abs(token) == 3) {
                    var affectedCells = this.genRamPattern(i, j)
                    for (var cell of affectedCells) {
                        controlMatrix[cell[0]][cell[1]] += token / Math.abs(token)
                    }
                }
            }
        }
        return controlMatrix
    }

    getCellControl(field, cell) {
        var controlMatrix = this.getControlMatrix(field)
        return controlMatrix[cell[0]][cell[1]]
    }

    controlToToken(control) {
        var thresholdReached
        for (var t of this.controlThresholds) {
            if (Math.abs(control) >= t) {
                thresholdReached = t
            } else {
                break
            }
        }
        var absToken = this.controlThresholds.indexOf(thresholdReached) + 1
        var token = control > 0 ? absToken : -absToken
        return token
    }

    tokenToControl(token) {
        var absControl = this.controlThresholds[Math.abs(token)-1]
        return token > 0 ? absControl : -absControl
    }

    getNextBoard(field, move, turn) {
        var control = this.getCellControl(field, move)
        var token = this.controlToToken(control)
        var [i, j] = move
        var newField = JSON.parse(JSON.stringify(field))
        if (this.onBoard(i, j)) {
            if (field[i][j] == 0) {
                newField[i][j] = token
            }
        }
        // console.log("yeet", this.eliminatePieces(newField))
        var [postElimField, elimination] = this.eliminatePieces(newField)
        return [postElimField, elimination]
    }

    isLegal(field, move, turn) {
        var control = this.getCellControl(field, move)
        var legal = control * turn > 0
        return legal
    }

    insertToken(move) {
        // console.log("bruh", this.getNextBoard(this.board.field, move, this.turn))
        var [newField, _] =  this.getNextBoard(this.board.field, move, this.turn)
        this.board.field = newField
    }

    getLegalMoves(field, turn) {
        var controlMatrix = this.getControlMatrix(field)
        var legalMoves = []
        for (var i = 0; i < controlMatrix.length; i++) {
            for (var j = 0; j < controlMatrix[i].length; j++) {
                if (controlMatrix[i][j] * turn > 0 && field[i][j] == 0) {
                    legalMoves.push([i, j])
                }
            }
        }
        return legalMoves
    }

    getNexusCoords(field) {
        for (var i = 0; i < field.length; i++) {
            for (var j = 0; j < field[i].length; j++) {
                if (field[i][j] == 9) {
                    var positiveCoords = [i, j]
                } else if (field[i][j] == -9) {
                    var negativeCoords = [i, j]
                }
            }
        }
        return [negativeCoords, positiveCoords]
    }

    gameEnded(field) {
        var [negNexus, posNexus] = this.getNexusCoords(field)
        var negNexusControl = this.getCellControl(field, negNexus)
        var posNexusControl = this.getCellControl(field, posNexus)
        var legalMoves = this.getLegalMoves(field, 1).concat(this.getLegalMoves(field, -1))
        return (negNexusControl >=1 || posNexusControl <=-1 || legalMoves.length == 0)
    }

    findWinner(field) {
        var [negNexus, posNexus] = this.getNexusCoords(field)
        var negNexusControl = this.getCellControl(field, negNexus)
        var posNexusControl = this.getCellControl(field, posNexus)
        if (negNexusControl >= 1) {
            return 1
        } else if (posNexusControl <= -1) {
            return -1
        } else {
            return 0
        }
    }

    insertInOrder(x, xs) {
        if (xs.length == 0) {
            return [x]
        } else if (xs.length == 1) {
            if (x[1] > xs[0][1]) {
                return [x].concat(xs)
            } else {
                return xs.concat([x])
            }
        } else {
            var half = Math.floor(xs.length / 2)
            if (x[1] > xs[half][1]) {
                return this.insertInOrder(x, xs.slice(0, half)).concat(xs.slice(half))
            } else {
                return xs.slice(0, half).concat(this.insertInOrder(x, xs.slice(half)))
            }
        }
    }

    orderByElims(field, turn, legals) {
        if (legals.length == 0) {
            return []
        }
        var elims = []
        var nonElims = []
        for (var move of legals) {
            var [_, elimination] = this.getNextBoard(field, move, turn)
            if (elimination) {
                var elimValue = Math.abs(field[move[0]][move[1]])
                elims = this.insertInOrder([move, elimValue], elims)
            } else {
                nonElims.push(move)
            }
        }
        return elims.map(x=>x[0]).concat(nonElims)
    }

}