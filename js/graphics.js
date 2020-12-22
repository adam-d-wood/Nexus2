class Display {
    constructor(cols, rows, canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.style.backgroundColor = "#00000000"
        this.ctx = this.canvas.getContext("2d");
        this.cellSide = this.getCellSideLength(cols, rows)
        this.cols = cols
        this.rows = rows
        this.horizontalMargin = (Math.max(this.rows, this.cols) - this.cols) * this.cellSide / 2
        this.verticalMargin = (Math.max(this.rows, this.cols) - this.rows) * this.cellSide / 2
    }

    getCellSideLength(cols, rows) {
        var maxCellWidth = this.canvas.width / cols
        var maxCellHeight = this.canvas.height / rows
        var cellSide = Math.min(maxCellHeight, maxCellWidth)
        return cellSide
    }

    drawBoard(board) {
        this.drawGrid();
        this.labelSquares();
        this.drawPieces(board)
        this.fillMargin()
    }

    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.strokeStyle = "#A2A3BB";
        for (var i = 0; i < this.cols+1; i++) {
            this.ctx.beginPath()
            this.ctx.moveTo(this.horizontalMargin + this.cellSide * i, 0);
            this.ctx.lineTo(this.horizontalMargin + this.cellSide * i, this.canvas.height);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        for (var i = 0; i < this.rows+1; i++) {
            this.ctx.beginPath()
            this.ctx.moveTo(0, this.verticalMargin + this.cellSide * i);
            this.ctx.lineTo(this.canvas.width, this.verticalMargin + this.cellSide * i);
            this.ctx.stroke();
            this.ctx.closePath()
        }
    }

    floodBoard(charge, duration, interval) {
        var endColour
        var interations = duration/interval
        if (charge == 1) {
            endColour = [110, 0, 0]
        } else if (charge == -1) {
            endColour = [0, 0, 110]
        } else {
            endColour = [84, 0, 84]
        }
        var colour = [0, 0, 0]
        var increments = endColour.map(function(x, i) {
            return (x - colour[i]) * interval/duration
        })
        var counter = 0
        var id = setInterval(frame, interval)
        var self = this
        function frame() {
            if (counter == interations) {
                clearInterval(id)
            } else {
                colour = colour.map(function(x, i) {
                    return x + increments[i]
                })
                counter ++
                self.canvas.style.backgroundColor = self.hexColour(colour)
            }
        }
    }

    hexColour(rbg) {
        return "#" + rbg.map(x=>Math.floor(x).toString(16).padStart(2, "0")).join("")
    }

    labelSquares() {
        // labels the top and left side of the board
        // with the coordinate system
        
        this.ctx.font = "14px Courier New";
        this.ctx.fillStyle = "#ffffff";
        for (let i = 0; i < this.cols + 1; i++) {
          this.ctx.fillText(
            String.fromCharCode(i + 96),
            this.cellSide * i - 14 + this.horizontalMargin,
            this.canvas.height - this.verticalMargin - 5
          );
        }
        for (var i = 1; i < this.rows+1; i++) {
            this.ctx.fillText(this.rows-i+1, 5 + this.horizontalMargin, 
                this.cellSide*(i-1) + 20 + this.verticalMargin);
        }
    }

    fillMargin() {
        this.ctx.fillStyle = "#00000044"
        this.ctx.fillRect(0, 0, this.canvas.width, this.verticalMargin)
        this.ctx.fillRect(0, 0, this.horizontalMargin, this.canvas.height)
        this.ctx.fillRect(0, this.canvas.height - this.verticalMargin, this.canvas.width, this.verticalMargin)
        this.ctx.fillRect(this.canvas.width-this.horizontalMargin, 0, this.horizontalMargin, this.canvas.height)
    }

    drawPieces(board) {
        for (var i = 0; i < board.field.length; i++) {
            for (var j = 0; j < board.field[i].length; j++) {
                var token = board.field[i][j]
                var piece;
                if (token > 0) {
                    var colour = "Red"
                } else {
                    var colour = "Blue"
                }
                if (token != 0) {
                    switch (Math.abs(token)) {
                        case 1:
                            piece = "crystal"
                            break
                        case 2:
                            piece = "druid"
                            break
                        case 3:
                            piece = "ram"
                            break
                        case 4:
                            piece = "nymph"
                            break
                        case 5:
                            piece = "dryad"
                            break
                        case 9:
                            piece = "nexus"
                            break
                    }
                    var filename = piece + colour
                    var img = document.getElementById(filename);
                    var sf = 0.7
                    var x = j * this.cellSide + 0.5 * this.cellSide * (1-sf) + this.horizontalMargin
                    var y = i * this.cellSide + 0.5 * this.cellSide * (1-sf) + this.verticalMargin
                    this.ctx.drawImage(img, x, y, sf * this.cellSide, sf * this.cellSide)
                }
            }
        }
    }
}