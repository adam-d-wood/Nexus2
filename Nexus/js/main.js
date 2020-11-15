$(function() {
    // when the page loads
    console.log("ready");
    engine = new Engine(6, 6);
    engine.draw();
    initialiseStartButton()
    initialiseDimSelect()
    // engine.handleTurn()
  });
  
function initialiseStartButton() {
    $("#startButton").on("click", function() {
        console.log("let's go")
        var [cols, rows] = getDims()
        delete engine
        engine = new Engine(cols, rows)
        engine.draw();
        engine.handleTurn()
    })
}

function getDims() {
    var colsSelect = document.getElementById("colsSelect")
    var rowsSelect = document.getElementById("rowsSelect")
    return [Number(colsSelect.value), Number(rowsSelect.value)]
}

function initialiseDimSelect() {
    for (let dim of ["cols", "rows"]) {
        var id = "#" + dim + "Select"
        $(id).on("change", function() {
            var [cols, rows] = getDims()
            engine = new Engine(cols, rows)
            engine.draw()
        })
    }
}