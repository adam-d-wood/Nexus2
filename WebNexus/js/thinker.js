class GameNode {
    constructor(move, field, turn, value=0) {
        this.move = move
        this.field = field
        this.turn = turn
        this.children = []
        this.visits = 0
        this.value = value
    }
}

class Agent extends Nexus {
    constructor(cols, rows, weights) {
        super(cols, rows)
        this.transpositionTable = {}
        this.weights = weights
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
                var elimValue = Math.abs(field[move[0][move[1]]])
                elims = this.insertInOrder([move, elimValue], elims)
            } else {
                nonElims.push(move)
            }
        }
        return elims.map(x=>x[0]).concat(nonElims)
    }

    evaluateByControl(node) {
        var controlMatrix = this.getControlMatrix(node.field)
        var total = 0
        for (var i = 0; i < this.board.rows; i++) {
            for (var j = 0; j < this.board.cols; j++) {
                total += controlMatrix[i][j]
            }
        }
        return total
    }

    evaluate(node) {
        var posMoves = this.getLegalMoves(node.field, 1)
        var negMoves = this.getLegalMoves(node.field, -1)
        var mobility = posMoves.length - negMoves.length
        var [negNexus, posNexus] = this.getNexusCoords(node.field)
        var negNexusControl = this.getCellControl(node.field, negNexus)
        var posNexusControl = this.getCellControl(node.field, posNexus)
        const nexusDifference = posNexusControl + negNexusControl
        var control = this.evaluateByControl(node)
        if (this.gameEnded(node.field)) {
            var winner = this.findWinner(node.field)
            // return winner * 20000 + nexusDifference
            return winner * 20000 + control
        }
        // console.log("weights", this.weights)
        var self = this
        // console.log("nexusDiff", nexusDifference)
        // console.log("mobility", mobility)
        // console.log("control", control)
        var evaluations = [nexusDifference, mobility, control].map(function(x, i) {
            return x * self.weights[i]
        })
        // return nexusDifference * 10 + mobility + control
        return evaluations.reduce(function(x, y){return x+y}, 0)
    }

    maxNode(a, b) {
        if (a.value >= b.value) {
            return a
        } else {
            return b
        }
    }

    negamax(node, depth, alpha, beta, colour) {
        // console.log("call")
        // console.log("depth", depth)
        // console.log("turn", node.turn)
        // console.log("move", node.move)
        // console.log("value", node.value)
        // console.log(JSON.parse(JSON.stringify(node.field)))
        var alphaOrigin = alpha
        var stateHash = this.board.stringifyBoard(node.field) + node.turn.toString().padStart(2, "0")
        var inTable = Object.keys(this.transpositionTable).includes(stateHash)
        if (inTable) {
            // console.log(this.transpositionTable)
            // console.log(stateHash)
            // console.log(this.transpositionTable[stateHash])
            var [value, entryDepth, flag] = this.transpositionTable[stateHash]
            // console.log("in table", value, entryDepth, flag)
            if (entryDepth >= depth) {
                // console.log("used")
                // if (entryDepth > depth) {
                //     console.log("we need to go deeper")
                // }
                if (flag == "exact") {
                    // return new GameNode(null, null, null, value.value)
                    return value
                } else if (flag =="lowerbound") {
                    alpha = Math.max(alpha, value.value)
                } else {
                    beta = Math.min(beta, value.value)
                }
                if (alpha >= beta) {
                    return value
                }
            }
        }
        if (depth == 0 || this.gameEnded(node.field)) {
            // console.log("ended")
            // console.log(node.field)
            var evaluation = this.evaluate(node)
            return new GameNode(null, null, null, colour * evaluation)
        
        }
        var value = new GameNode(null, null, null, -100000)
        var legals = this.getLegalMoves(node.field, node.turn)
        if (legals.length == 0) {
            var childNode = new GameNode(null, node.field, -node.turn)
            childNode.value = -this.negamax(childNode, depth-1, -beta, -alpha, -colour).value
            value = this.maxNode(value, childNode)
        }
        var orderedLegals = this.orderByElims(node.field, node.turn, legals)
        for (var move of orderedLegals) {
            var fieldCopy = JSON.parse(JSON.stringify(node.field))
            var [childField, _] = this.getNextBoard(fieldCopy, move, node.turn)
            var childNode = new GameNode(move, childField, -node.turn)
            childNode.value = -this.negamax(childNode, depth-1, -beta, -alpha, -colour).value
            // node.children.push(childNode)
            value = this.maxNode(value, childNode)
            alpha = Math.max(value.value, alpha)
            if (alpha >= beta) {
                break;
            }
        }
        var flag
        if (value.value <= alphaOrigin) {
            flag = "upperbound"
        } else if (value.value >= beta) {
            flag = "lowerbound"
        } else {
            flag = "exact"
        }
        this.transpositionTable[stateHash] = [value, depth, flag]
        return value
    }
}