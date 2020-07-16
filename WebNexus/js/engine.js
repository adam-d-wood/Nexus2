class Engine extends Nexus {
    constructor(cols, rows) {
        super(cols, rows)
        this.display = new Display(cols, rows)
        this.running = true
        // weights: [nexusDiff, mobility, control]
        this.posWeights = [31, 8, 14]
        this.negWeights = [1, 1, 1]
        this.posAgent = this.getPosAgent()
        this.negAgent = this.getNegAgent()
        this.posDepth = this.getPosDepth()
        this.negDepth = this.getNegDepth()
        this.useBook = true
        this.initialiseDepthSelect()
        this.initialisePlayerSelect()
        this.gameHistory = []
        this.positionsReached = [this.board.field]
    }

    getPosDepth() {
        var depthSelect = document.getElementById("positiveDepth")
        return parseInt(depthSelect.value)
    }

    getNegDepth() {
        var depthSelect = document.getElementById("negativeDepth")
        return parseInt(depthSelect.value)
    }

    getPosAgent() {
        console.log("w", this.posWeights)
        var agentSelect = document.getElementById("posUserSelect")
        if (agentSelect.checked) {
            return "human"
        } else {
            return new Agent(this.board.cols, this.board.rows, this.posWeights)
        }
    }

    getNegAgent() {
        var agentSelect = document.getElementById("negUserSelect")
        if (agentSelect.checked) {
            return "human"
        } else {
            return new Agent(this.board.cols, this.board.rows, this.negWeights)
        }
    }

    initialiseDepthSelect() {
        var self = this
        for (let charge of ["positive", "negative"]) {
            let id = "#" + charge + "Depth"
            $(id).on("change", function() {
                if (charge == "positive") {
                    self.posDepth = parseInt(this.value)
                } else {
                    self.negDepth = parseInt(this.value)
                }
            })
        }
    }

    initialisePlayerSelect() {
        for (let charge of ["positive", "negative"]) {
            var name = charge + "Player"
            var selector = "input[name='" + name + "']"
            var self = this
            $(selector).on("change", function() {
                var id = charge + "DepthSelection"
                var depthSelect = document.getElementById(id)
                if (this.value == "computer") {
                    // console.log("showing ", id)
                    depthSelect.hidden = false;
                } else {
                    // console.log("hiding", id)
                    depthSelect.hidden = true
                }
                if (charge == "positive") {
                    self.posAgent = self.getPosAgent()
                } else {
                    self.negAgent = self.getNegAgent()
                }
            })    
        }
    }
    

    draw() {
        this.display.ctx.clearRect(0, 0, this.display.cols, this.display.rows)
        this.display.drawBoard(this.board)
    }

    handleTurn() {
        var controlMatrix = this.getControlMatrix(this.board.field)
        console.log("legals", this.getLegalMoves(this.board.field, this.turn).length)
        console.log(this.turn)
        for (var i = 0; i < this.board.rows; i++) {
            console.log(this.board.field[i], controlMatrix[i])
        }
        var activeAgent = this.turn == 1 ? this.posAgent : this.negAgent
        if (this.gameEnded(this.board.field)) {
            this.handleEnd()
        } else {
            if(this.getLegalMoves(this.board.field, this.turn).length == 0) {
                console.log("pass")
                this.handlePass()
            } else if (activeAgent == "human") {
                console.log("hooman")
                var self = this
                $("#gameBoard").one("mousedown", function() {
                    self.processHumanMove()
                })
            } else {
                var self = this
                setTimeout(function() {
                    self.processCompMove()
                }, 10)
            }
        }
    }

    handleEnd() {
        var winner = this.findWinner(this.board.field)
        this.display.floodBoard(winner, 1500, 5)
    }

    handlePass() {
        this.draw()
        this.turn *= -1
        this.gameHistory.push("--")
        this.positionsReached.push(this.board.field)
        this.handleTurn()
    }

    processHumanMove() {
        var move = this.getSquare(event)
        if (this.onBoard(move[0], move[1])) {
            this.executeMove(move)
        } else {
            this.handleTurn
        }
    }

    processCompMove() {
        var executed = false
        if (this.inBook && this.useBook) {
            var x
        }
        if (!executed) {
            this.initiateNegamax()
        }
    }

    initiateNegamax() {
        var depth = this.turn == 1 ? this.posDepth : this.negDepth
        var agent = this.turn == 1 ? this.posAgent : this.negAgent
        var fieldCopy = JSON.parse(JSON.stringify(this.board.field))
        var workerMessage = [
            depth, fieldCopy, this.turn, this.board.cols, 
            this.board.rows, agent
        ]
        this.createNegamaxWorker(workerMessage)
    }

    createNegamaxWorker(msg) {
        console.log("negamaxing w/ msg", msg)
        var self = this
        var w = new Worker("js/negamaxWorker.js")
        w.postMessage(msg)
        w.onmessage = function(event) {
            var result = event.data
            var move = result.move
            console.log("result", JSON.stringify(result))
            if (typeof self != "undefined") {
                self.executeMove(move)
            }
            w.terminate()
            w = undefined
        }
    }

    executeMove(move) {
        if (this.isLegal(this.board.field, move, this.turn)) {
            console.log("executing", move)
            this.insertToken(move)
            this.draw()
            this.turn *= -1
            this.gameHistory.push(move)
            this.positionsReached.push(this.board.field)
        }
        this.handleTurn()
    }

    getSquare(event) {
        const bound = this.display.canvas.getBoundingClientRect();
        var x = event.clientX - bound.left - this.display.horizontalMargin
        var y = event.clientY - bound.top - this.display.verticalMargin
        var cellX = Math.floor(x / this.display.cellSide)
        var cellY = Math.floor(y / this.display.cellSide)
        console.log(cellY, cellX)
        return [cellY, cellX]
    }

}