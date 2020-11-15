class Simulator extends Nexus {
    constructor(cols, rows, posDepth, negDepth, posWeights, negWeights) {
        super(cols, rows)
        this.posDepth = posDepth
        this.negDepth = negDepth
        this.posWeights = posWeights
        this.negWeights = negWeights
    }

    simGame() {
        while (!this.gameEnded(this.board.field)) {
            // console.log(this.board.field)
            if (this.turn == 1) {
                var depth = this.posDepth
                var weights = this.posWeights
            } else {
                var depth = this.negDepth
                var weights = this.negWeights
            }
            if (this.getLegalMoves(this.board.field, this.turn).length == 0) {
                this.turn *= -1
            } else {
                var agent = new Agent(this.board.cols, this.board.rows, weights)
                var node = new GameNode(null, JSON.parse(JSON.stringify(this.board.field)), this.turn)
                var result = agent.negamax(node, depth, -10000, 10000, this.turn)
                var move = result.move
                this.insertToken(move)
                this.turn *= -1
            }
        }
        var winner = this.findWinner(this.board.field)
        return winner
    }
}