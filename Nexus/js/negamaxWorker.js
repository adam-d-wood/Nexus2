importScripts("board.js", "nexus.js", "thinker.js")

self.onmessage = function(msg) {
    var [depth, fieldCopy, turn, progHist, cols, rows, agent] = msg.data
    // var agent = agent
    // console.log("yaa", agent, typeof(agent))
    var agentAttributes = JSON.parse(agent)
    var negamaxer = new Agent(cols, rows, agentAttributes.weights)

    if (turn == -1) {
        var result = negamaxer.performSearch(fieldCopy, turn, progHist, depth)
    } else {
        var result = negamaxer.performSearch(fieldCopy, turn, progHist, depth)
    }
    // var result = negamaxer.negamax(new GameNode(null, fieldCopy, turn, progHist), depth, -10000, 10000, turn)
    // var result = negamaxer.performSearch(fieldCopy, turn, progHist, depth)
    delete negamaxer
    self.postMessage(result)
}