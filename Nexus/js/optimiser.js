class Optimiser {
    constructor(cols, rows, bitsPerRatio, size) {
        this.cols = cols
        this.rows = rows
        this.bitsPerRatio = bitsPerRatio
        this.population = this.genPopulation(bitsPerRatio, size)
        this.crossPoint = 1
        this.muationRate = 1
    }

    evolve(generations) {
        for (var i = 0; i < generations; i++) {
            console.log(i)
            console.log("pop", this.population)
            this.population = this.getNextGeneration()
        }
        var ranking = this.rankPopulation()
        return ranking[0][0]
    }

    genPopulation(bitsPerRatio, size) {
        var maxRatio = 2 ** bitsPerRatio - 1
        var population = []
        for (var i = 0; i < size; i++) {
            var genotype = ""
            for (var j=0; j < 3; j++) {
                var ratio = Math.floor(Math.random() * maxRatio+1)
                var gene = ratio.toString(2).padStart(this.bitsPerRatio, "0")
                genotype += gene
            }
            population.push(genotype)
        }
        return population
    }

    getNextGeneration() {
        var nextGeneration = []
        var ranking = this.rankPopulation()
        console.log("ranking", ranking)
        var k = Math.floor(Math.sqrt(ranking.length))
        var survivors = ranking.slice(0, k).map(x=>x[0])
        nextGeneration = nextGeneration.concat(survivors)
        for (var i = 0; i < survivors.length-1; i++) {
            for (var j = i+1; j < survivors.length; j++) {
                var offspring = this.crossover(survivors[i], survivors[j])
                nextGeneration = nextGeneration.concat(offspring)
            }
        }
        console.log("nextgen", nextGeneration)
        return nextGeneration
    }

    constructRoundRobin() {
        let n = this.population.length
        var table = [...Array(n)].map(x=>Array(n).fill(0))
        for (var i = 0; i < n; i++) {
            var posWeights = this.genotypetoWeights(this.population[i])
            for (var j = 0; j < n; j++) {
                if (i != j) {
                    // console.log(this.population[i], "vs", this.population[j])
                    var negWeights = this.genotypetoWeights(this.population[j])
                    var sim = new Simulator(this.cols, this.rows, 1, 1, posWeights, negWeights)
                    var winner = sim.simGame()
                    // console.log("winner", winner)
                    table[i][j] += winner
                    table[j][i] -= winner    
                }
            }
        }
        return table
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

    rankPopulation() {
        var table = this.constructRoundRobin()
        var rankedSols = []
        for (var i = 0; i < table.length; i++) {
            var score = table[i].reduce(function(x, y) {
                return x + y
            }, 0)
            rankedSols = this.insertInOrder([this.population[i], score], rankedSols)
        }
        return rankedSols
    }

    genotypetoWeights(genotype) {
        var weights = []
        for (var i = 0; i < genotype.length; i += this.bitsPerRatio) {
            var gene = genotype.slice(i, i+this.bitsPerRatio)
            var weight = parseInt(gene, 2)
            weights.push(weight)
        }
        return weights
    }

    crossover(x, y) {
        var crossIndex = this.crossPoint * this.bitsPerRatio
        var xSplit = [x.slice(0, crossIndex), x.slice(crossIndex)]
        var ySplit = [y.slice(0, crossIndex), y.slice(crossIndex)]
        return [xSplit[0].concat(ySplit[1]), ySplit[0].concat(xSplit[1])]
    }

    mutate(genotype) {
        var geneList = genotype.split("")
        var p = this.muationRate / genotype.length
        for (var i = 0; i < genotype.length; i++) {
            var flip = (Math.random() < p)
            if (flip) {
                var newBit = geneList[i] == "1" ? "0" : "1"
                geneList[i] = newBit
            }
        }
        return geneList.join("")
    }
}