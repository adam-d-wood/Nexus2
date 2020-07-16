importScripts("board.js", "nexus.js", "thinker.js")

self.onmessage = function(msg) {
    var [depth, fieldCopy, turn, cols, rows, agent] = msg.data
    // var agent = agent
    // console.log("yaa", agent, typeof(agent))
    var negamaxer = new Agent(cols, rows, agent.weights)
    var result = negamaxer.negamax(new GameNode(null, fieldCopy, turn), depth, -10000, 10000, turn)
    delete negamaxer
    self.postMessage(result)
}