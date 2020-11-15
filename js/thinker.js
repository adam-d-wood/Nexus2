class GameNode {
    constructor(move, field, turn, progHist, value=0) {
        this.move = move
        this.field = field
        this.pieceProgressionHistory = progHist
        this.turn = turn
        this.children = []
        this.visits = 0
        this.value = value
        this.principleChild = null
    }
}

class Agent extends Nexus {
    constructor(cols, rows, weights) {
        super(cols, rows)
        this.transpositionTable = {}
        this.legalsTables = {}
        this.killerMoves = []
        this.weights = weights
        this.cuts = 0
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

    orderByElims(field, turn, legals, progHist) {
        var [elims, nonElims] = this.separateElims(field, turn, legals, progHist)
        return elims.map(x=>x[0]).concat(nonElims)
    }

    separateElims(field, turn, legals, progHist) {
        if (legals.length == 0) {
            return [[], []]
        }
        var elims = []
        var nonElims = []
        for (var move of legals) {
            var [_, elimination] = this.getNextBoard(field, move, turn, progHist)
            if (elimination) {
                var elimValue = Math.abs(field[move[0]][move[1]])
                elims = this.insertInOrder([move, elimValue], elims)
            } else {
                nonElims.push(move)
            }
        }
        return [elims.map(x=>x[0]), nonElims]
    }

    isStable(eliminations) {
        return eliminations.length == 0
    }

    orderMoves(field, turn, progHist, legals, depth) {
        var killers = []
        var nonKillers = []
        for (var move of legals) {
            if (JSON.stringify(this.killerMoves).includes(JSON.stringify([move, depth]))) {
                killers.push(move)
            } else {
                nonKillers.push(move)
            }
        }
        return this.orderByElims(field, turn, killers.concat(nonKillers), progHist)
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

    quiescenceSearch(node, depth, alpha, beta, colour) {
        var alphaOrigin = alpha
        var stateHash = this.board.stringifyBoard(node.field) + node.turn.toString().padStart(2, "0")
        var inTable = Object.keys(this.transpositionTable).includes(stateHash)
        if (inTable) {
            var [value, entryDepth, flag] = this.transpositionTable[stateHash]
            if (entryDepth >= depth) {
                if (flag == "exact") {
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
        if (this.gameEnded(node.field) || depth == 0) {
            var evaluation = this.evaluate(node)
            return new GameNode(null, null, null, node.pieceProgressionHistory, colour * evaluation)
        }
        var legals = this.getLegalMoves(node.field, node.turn)
        
        var [elims, nonElims] = this.separateElims(node.field, node.turn, legals, node.pieceProgressionHistory)
        if (this.isStable(elims) == true) {
            var evaluation = this.evaluate(node)
            return new GameNode(null, null, null, node.pieceProgressionHistory, colour * evaluation)
        }
        var value = new GameNode(null, null, null, node.pieceProgressionHistory, -100000)
        if (legals.length == 0) {
            var childNode = new GameNode(null, node.field, -node.turn, node.pieceProgressionHistory)
            childNode.value = -this.negamax(childNode, depth-1, -beta, -alpha, -colour).value
            value = this.maxNode(value, childNode)
        }
        // var orderedLegals = this.orderMoves(node.field, node.turn, node.pieceProgressionHistory legals, depth)
        // console.log(orderedLegals)
        var orderedLegals = elims.concat(nonElims)
        for (var move of orderedLegals) {
            var fieldCopy = JSON.parse(JSON.stringify(node.field))
            var [childField, _] = this.getNextBoard(fieldCopy, move, node.turn, node.pieceProgressionHistory)
            var childNode = new GameNode(move, childField, -node.turn, node.pieceProgressionHistory)
            childNode.value = -this.negamax(childNode, depth-1, -beta, -alpha, -colour).value
            // node.children.push(childNode)
            value = this.maxNode(value, childNode)
            node.principleChild = value
            alpha = Math.max(value.value, alpha)
            if (alpha >= beta) {
                this.killerMoves.push[move, depth]
                this.cuts += 1
                // console.log("cuts:", this.cuts)
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

    negamax(node, depth, alpha, beta, colour) {
        // console.log("call")
        // console.log("depth", depth)
        // console.log("turn", node.turn)
        // console.log("move", node.move)
        // console.log("peiceProg", this.pieceProgression["positive"], this.pieceProgression["negative"])
        // console.log("progHist", JSON.stringify(node.pieceProgressionHistory["positive"]), JSON.stringify(node.pieceProgressionHistory["negative"]))
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
        if (this.gameEnded(node.field)) {
            // console.log("ended")
            // console.log(node.field)
            var evaluation = this.evaluate(node)
            return new GameNode(null, null, null, node.pieceProgressionHistory, colour * evaluation)
        }
        var legals = this.getLegalMoves(node.field, node.turn)
        var [elims, nonElims] = this.separateElims(node.field, node.turn, legals, node.pieceProgressionHistory)
        if (depth == 0) {
            if (this.isStable(elims) == 0) {
                var evaluation = this.evaluate(node)
                return new GameNode(null, null, null, node.pieceProgressionHistory, colour * evaluation)
            } else {
                var value = this.quiescenceSearch(node, 6, -10000, 10000, 1).value
                // console.log("value of ", value, "assigned to")
                // for (var row of node.field) {
                //     console.log(row)
                // }
                return new GameNode(null, null, null, node.pieceProgressionHistory, colour * value)
            }
        }
        var value = new GameNode(null, null, null, node.pieceProgressionHistory, -100000)
        if (legals.length == 0) {
            var childNode = new GameNode(null, node.field, -node.turn, node.pieceProgressionHistory)
            childNode.value = -this.negamax(childNode, depth-1, -beta, -alpha, -colour).value
            value = this.maxNode(value, childNode)
        }
        // var orderedLegals = this.orderMoves(node.field, node.turn, node.pieceProgressionHistory legals, depth)
        // console.log(orderedLegals)
        var orderedLegals = elims.concat(nonElims)
        for (var move of orderedLegals) {
            var fieldCopy = JSON.parse(JSON.stringify(node.field))
            var [childField, _] = this.getNextBoard(fieldCopy, move, node.turn, node.pieceProgressionHistory)
            var childNode = new GameNode(move, childField, -node.turn, node.pieceProgressionHistory)
            childNode.value = -this.negamax(childNode, depth-1, -beta, -alpha, -colour).value
            // node.children.push(childNode)
            value = this.maxNode(value, childNode)
            node.principleChild = value
            alpha = Math.max(value.value, alpha)
            if (alpha >= beta) {
                this.killerMoves.push[move, depth]
                this.cuts += 1
                // console.log("cuts:", this.cuts)
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

    performSearch(field, turn, progHist, depth, iterative=false) {
        var node = new GameNode(null, field, turn, progHist)
        if (iterative) {
            for (var d=4; d <= depth; d++) {
                node = this.negamax2(node, d, -10000 , 10000, turn)
                console.log("--- depth", d)
                console.log("best move", node.principleChild.move)
                console.log("value", node.value)
            }
            console.log("priciple child:", JSON.stringify(node.principleChild))
            console.log(node.principleChild.move, node.principleChild.value)
            return node.principleChild    
        } else {
            node = this.negamax2(node, depth, -10000, 10000, turn)
            return node.principleChild
        }

    }

    negamax2(node, depth, alpha, beta, colour, quiescence=false) {
        // console.log("call")
        // console.log("depth", depth)
        // console.log("turn", node.turn)
        // console.log("move", node.move)
        // console.log("peiceProg", this.pieceProgression["positive"], this.pieceProgression["negative"])
        // console.log("progHist", JSON.stringify(node.pieceProgressionHistory["positive"]), JSON.stringify(node.pieceProgressionHistory["negative"]))
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
        if (this.gameEnded(node.field)) {
            // console.log("ended")
            // console.log(node.field)
            var evaluation = this.evaluate(node)
            node.value = colour * evaluation
            return node
            // return new GameNode(null, null, null, node.pieceProgressionHistory, colour * evaluation)
        }
        var inLegalsTable = Object.keys(this.legalsTables).includes(stateHash)
        if (inLegalsTable) {
            // console.log("in")
            var legals = JSON.parse(this.legalsTables[stateHash])
        } else {
            // console.log("out")
            var legals = this.getLegalMoves(node.field, node.turn)
            this.legalsTables[stateHash] = JSON.stringify(legals)
        }
        // var legals = this.getLegalMoves(node.field, node.turn)
        var [elims, nonElims] = this.separateElims(node.field, node.turn, legals, node.pieceProgressionHistory)
        if (depth == 0 || (quiescence && this.isStable(elims))) {
            if (this.isStable(elims) || quiescence) {
                var evaluation = this.evaluate(node)
                node.value = colour * evaluation
                return node
                // return new GameNode(null, null, null, node.pieceProgressionHistory, colour * evaluation)
            } else {
                // var value = this.negamax2(node, 4, -10000, 10000, 1, true).value
                var value = this.negamax2(node, 4, alpha, beta, colour, true)
                // console.log("value of ", value, "assigned to")
                // for (var row of node.field) {
                //     console.log(row)
                // }
                // value.value = value.value * colour
                return value
                // return new GameNode(null, null, null, node.pieceProgressionHistory, colour * value)
            }
        }
        var value = new GameNode(null, null, null, node.pieceProgressionHistory, -100000)
        if (legals.length == 0) {
            if (node.principleChild != null) {
                var childNode = node.principleChild
            } else {
                var childNode = new GameNode(null, node.field, -node.turn, node.pieceProgressionHistory)
            }
            childNode.value = -this.negamax2(childNode, depth-1, -beta, -alpha, -colour, quiescence).value
            value = this.maxNode(value, childNode)
            node.principleChild = value
            node.value = value.value
            alpha = Math.max(value.value, alpha)
        } else {
            var orderedLegals = elims.concat(nonElims)
            // console.log("pricChild", node.principleChild)
            if (node.principleChild != null) {
                // var index = orderedLegals.indexOf(node.principleChild.move)
                var index = this.moveIndex(orderedLegals, node.principleChild.move)
                // console.log("index", index)
                orderedLegals.splice(index, 1)
                orderedLegals = orderedLegals.map(function(x) {
                    return new GameNode(x, null, -node.turn, node.pieceProgressionHistory)
                })
                orderedLegals.unshift(node.principleChild)
                
            } else {
                orderedLegals = orderedLegals.map(function(x) {
                    return new GameNode(x, null, -node.turn, node.pieceProgressionHistory)
                })
            }
            // console.log("legals", JSON.stringify(orderedLegals))
            for (var move of orderedLegals) {
                var fieldCopy = JSON.parse(JSON.stringify(node.field))
                var [childField, _] = this.getNextBoard(fieldCopy, move.move, node.turn, node.pieceProgressionHistory)
                move.field = childField
                move.value = -this.negamax2(move, depth-1, -beta, -alpha, -colour, quiescence).value
                // console.log("move", JSON.stringify(move))
                // node.children.push(childNode)
                value = this.maxNode(value, move)
                node.principleChild = value
                node.value = value.value
                alpha = Math.max(value.value, alpha)
                if (alpha >= beta) {
                    this.killerMoves.push[move, depth]
                    this.cuts += 1
                    // console.log("cuts:", this.cuts)
                    break;
                }
            }    
        }
        // var orderedLegals = this.orderMoves(node.field, node.turn, node.pieceProgressionHistory legals, depth)
        // console.log(orderedLegals)
        var flag
        if (value.value <= alphaOrigin) {
            flag = "upperbound"
        } else if (value.value >= beta) {
            flag = "lowerbound"
        } else {
            flag = "exact"
        }
        this.transpositionTable[stateHash] = [node, depth, flag]
        return node
    }

    moveIndex(arr, el) {
        for (var i=0; i < arr.length; i++) {
            if (JSON.stringify(arr[i]) == JSON.stringify(el)) {
                return i
            }
        }
        return -1
    }

}
