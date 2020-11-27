class Engine extends Nexus {
    constructor(cols, rows) {
        super(cols, rows)
        this.display = new Display(cols, rows, "gameBoard")
        this.running = true
        this.stepping = false
        // weights: [nexusDiff, mobility, control]
        this.posWeights = [31, 8, 14]
        this.negWeights = [31, 8, 14]
        this.posAgent = this.getPosAgent()
        this.negAgent = this.getNegAgent()
        this.posDepth = this.getPosDepth()
        this.negDepth = this.getNegDepth()
        this.useBook = true
        this.initialiseDepthSelect()
        this.initialisePlayerSelect()
        this.gameHistory = []
        this.positionsReached = [this.board.field]
        this.currentPly = 0
        this.initGameTable()
        this.initPausePlay();
        this.initBackButton();
        this.initForwardButton();
        // this.initKeyControls();
    }

    initKeyControls() {
        var self = this;
        $("#gameBoard").off();
        $("#gameBoard").on("keypress", function() {
            console.log(event.which);
            if (event.keyCode == 32) {
                console.log("ya")
                self.togglePlay();
            }
        })
    }

    pauseGame() {
        var self = this;
        this.running = false;
        var pausePlayButton = $("#pausePlayButton");
        pausePlayButton.text(">");
        // $("#gameBoard").off();
        // $("#gameBoard").one("mousedown", function() {
        //     self.processHumanMove();
        // });
}

    resumeGame() {
        // $("gameBoard").off();
        this.running = true;
        var pausePlayButton = $("#pausePlayButton");
        pausePlayButton.text("||");
        this.handleTurn();
    }

    initBackButton() {
        var self = this
        var backButton = $("#backButton");
        backButton.text("<<");
        backButton.off()
        backButton.on("click", function() {
            self.pauseGame();
            if (self.currentPly > 0) {
                self.currentPly -= 1;
                self.turn *= -1
                self.highlightCurrentMove();
                self.board.field = self.positionsReached[self.currentPly];
                self.draw();
                if (self.gameHistory[self.currentPly] == "--") {
                    console.log("and again")
                    this.click();
                }
            }
        })
    }

    initForwardButton() {
        var self = this;
        var forwardButton = $("#forwardButton");
        forwardButton.text(">>");
        forwardButton.off();
        forwardButton.on("click", function() {
            self.pauseGame();
            if (self.currentPly < self.positionsReached.length-1) {
                self.currentPly += 1;
                self.turn *= 1;
                self.highlightCurrentMove();
                self.board.field = self.positionsReached[self.currentPly];
                self.draw();
            }
        })
    }

    togglePlay() {
        console.log("yeet")
        if(this.running) {
            this.pauseGame();
        } else {
            this.resumeGame();
        }
    }

    initPausePlay() {
        var self = this
        var pausePlayButton = $("#pausePlayButton");
        pausePlayButton.text("||")
        pausePlayButton.off()
        pausePlayButton.on("click", function() {self.togglePlay()})
        // $(window).on("keypress", function() {self.togglePlay()})
        // pausePlayButton.on("click", function() {
        //     if(self.running) {
        //         self.pauseGame();
        //     } else {
        //         self.resumeGame();
        //     }
        // })
    }

    initGameTable() {

        // clears game table ready for new game
        var table = document.getElementById("moveHistory")
        var len = table.rows.length
        for (var i = 0; i < len; i++) {
            table.deleteRow(0)
        }
    }

    humanForm(cell) {
        if (cell == "--") return "--";
        var row = (this.board.rows - cell[0]).toString()
        var col = String.fromCharCode(cell[1] + 97)
        return col + row
    }

    updateGameTable() {
        var table = document.getElementById("moveHistory")
        var self = this
        var len = table.rows.length
        for (var i = 0; i < len; i++) {
            table.deleteRow(0)
        }
        console.log(this.gameHistory)
        var humanHistory = this.gameHistory.map(function(x) {
            return self.humanForm(x)}
        )
        console.log(humanHistory)
        for (var i=0; i < humanHistory.length; i++) {
            var row = Math.floor(i/2)
            var col = i%2
            if (!(table.rows.length > row)) {
                table.insertRow(row)
                for (var k; k < 2; k++) {table.insertCell()}
            }
            if (!(table.rows[row].cells.length > col)) {
                table.rows[row].insertCell(col);
            }
            table.rows[row].cells[col].innerText = humanHistory[i];
        }
        this.highlightCurrentMove();
    }

    highlightCurrentMove() {
        var table = document.getElementById("moveHistory");
        for (var row of table.rows) {
            for (var cell of row.cells) {
                cell.style.color = "gray";
            }
        }
        if (this.currentPly > 0) {
            var i = Math.floor((this.currentPly-1) / 2);
            var j = (this.currentPly-1) % 2;
            var currentMoveCell = table.rows[i].cells[j];
            currentMoveCell.style.color = "white";
        }
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
                    depthSelect.hidden = false;
                } else {
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
        if (this.running) {
            this.pieceProgressionHistory = this.getNextProgressionHistory()
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
        this,this.currentPly += 1
        this.updateGameTable()
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
            depth, fieldCopy, this.turn, this.pieceProgressionHistory, this.board.cols, 
            this.board.rows, JSON.stringify(agent)
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
        if (this.running) {
            console.log("legals,", this.getLegalMoves(this.board.field, this.turn))
            if (this.isLegal(this.board.field, move, this.turn)) {
                console.log("executing", move)
                this.insertToken(move)
                this.draw()
                this.turn *= -1
                if (this.currentPly == this.gameHistory.length) {
                    this.gameHistory.push(move)
                    this.positionsReached.push(this.board.field)    
                } else {
                    this.gameHistory = this.gameHistory.slice(0, this.currentPly);
                    this.gameHistory.push(move);
                    this.positionsReached = this.positionsReached.slice(0, this.currentPly+1);
                    this.positionsReached.push(this.board.field);
                }
                this.currentPly += 1
                this.updateGameTable()  
            }
            this.handleTurn()    
        }
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