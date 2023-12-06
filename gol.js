const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let aliveCells = [];
let backs = Array(50).fill([]);
let interval;
let viewportOffset = { x: 0, y: 0 };
let startCells = [];
let seenCells = new Set();
let currentIteration = 0;
let gliderCells = [];
let repeatCells = [];

const zoomLevels = [1, 3, 5, 10, 20];
let currentZoomIndex = 3;
let cellSize = zoomLevels[currentZoomIndex];

let isMouseDown = false;
historyDisplay = false;
customtick = false;

canvas.addEventListener('mousedown', (event) => {
    toggleCell(event);
    isMouseDown = true;
});

canvas.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        toggleCell(event);
    }
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

const checkbox = document.getElementById('history');
const tick = document.getElementById('customtick');

checkbox.addEventListener('change', function () {
    if (checkbox.checked) {
        historyDisplay = true;
    } else {
        historyDisplay = false;
    }
    drawGrid();

});


tick.addEventListener('change', function () {
    if (tick.checked) {
        customtick = true;
    } else {
        customtick = false;
    }
    // startGame();
});

function toggleCell(event) {
    const x = Math.floor(event.offsetX / cellSize);
    const y = Math.floor(event.offsetY / cellSize);

    // Toggle the main cell
    toggleSpecificCell(x, y);

    // Toggle its neighbors
    // const neighbors = getNeighbors(x, y);
    // // for (const [nx, ny] of neighbors) {
    // //     toggleSpecificCell(nx, ny);
    // // }

    // drawGrid();
}

function toggleSpecificCell(x, y) {
    seenCells.add(`${x},${y}`);  // Store cell as seen

    const index = aliveCells.findIndex(cell => cell[0] === x && cell[1] === y);
    if (index !== -1) {
        aliveCells.splice(index, 1);
        startCells.splice(index, 1);
    } else {
        aliveCells.push([x, y]);
        startCells.push([x, y]);
    }
    drawGrid()
}

function singleTick() {
    if (customtick) {
        gameTickCustom();
    } else {
        gameTick();
    }
}

function presets() {
    var presetValue = document.getElementById("presets").value;
    switch (presetValue) {
        case 'none':
            resetGrid();
            break
        case 'glider':
            createGlider();
            break;
        case 'morph':
            createMorph();
            break;
    }
}

function skipGenerations() {
    const generationsToSkip = parseInt(document.getElementById('skipGenerations').value, 10);
    for (let i = 0; i < generationsToSkip; i++) {
        gameTickCustom(); // Assuming gameTick is the function that advances the game by one generation
    }
}


function drawGrid() {
    // console.log(aliveCells);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // let rval = 38;
    // let gval = 0;

    // ctx.fillStyle = "rgb(51, 255, 51)";

    if (historyDisplay) {
        // ctx.fillStyle = "rgb(30, 0, 50)"
        // seenCells.forEach(cell => {
        //     const [x, y] = cell.split(',').map(Number);
        //     ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        // });
        let colorVal = 0;
        backs.slice().reverse().forEach(arr => {
            ctx.fillStyle = "rgb(0, " + Math.round(colorVal) + ", 0)";
            arr.forEach(cell => {
                ctx.fillRect(cell[0] * cellSize, cell[1] * cellSize, cellSize, cellSize);
            });
            // if (rval > 15 && gval < 200 && bval > 99) {
            //     rval -= 10;
            // } else if (gval < 240 && bval > 99) {
            //     gval += 10;
            // } else if (bval > 25 && gval > 200) {
            //     bval -= 10;
            // } else if (rval < 230) {
            //     rval += 10;
            // } else if (gval > 15) {
            //     gval -= 10
            // }
            if (colorVal < 255) {
                colorVal += 5;
            }
            // console.log("rgb(" + rval + ", " + gval + ", " + bval + ")")
        });
    }

    // console.log(aliveCells);
    ctx.fillStyle = "rgb(180, 255, 180)"
    aliveCells.forEach(cell => {
        ctx.fillRect(cell[0] * cellSize, cell[1] * cellSize, cellSize, cellSize);
    });



    ctx.fillStyle = "rgb(255, 0, 0)";
    // console.log(gliderCells);
    gliderCells.forEach(cell => {
        ctx.fillRect(cell[0] * cellSize, cell[1] * cellSize, cellSize, cellSize);
    });

    ctx.fillStyle = "rgb(0, 100, 255)";
    // console.log(repeatCells);
    repeatCells.forEach(cell => {
        ctx.fillRect(cell[0] * cellSize, cell[1] * cellSize, cellSize, cellSize);
    });

    // Update coordinates display
    const coordsElement = document.getElementById('coordinates');
    coordsElement.textContent = `x: ${viewportOffset.x}, y: ${viewportOffset.y}`;
}


function getNeighbors(x, y) {
    return [
        [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
        [x - 1, y], [x + 1, y],
        [x - 1, y + 1], [x, y + 1], [x + 1, y + 1]
    ];
}

function countAliveNeighbors(x, y) {
    const neighbors = getNeighbors(x, y);
    return neighbors.filter(neighbor => {
        return aliveCells.some(cell => cell[0] === neighbor[0] && cell[1] === neighbor[1]);
    }).length;
}

function gameTick() {

    currentIteration++;
    document.getElementById('iteration').textContent = 'Generation: ' + currentIteration;

    const newAliveCells = [];
    const cellsToCheck = {};

    // Add all alive cells and their neighbors to cellsToCheck
    aliveCells.forEach(cell => {
        const [x, y] = cell;
        cellsToCheck[`${x},${y}`] = [x, y];
        getNeighbors(x, y).forEach(neighbor => {
            cellsToCheck[`${neighbor[0]},${neighbor[1]}`] = neighbor;
        });
    });

    for (let key in cellsToCheck) {
        const [x, y] = cellsToCheck[key];
        const aliveNeighbors = countAliveNeighbors(x, y);
        const isAlive = aliveCells.some(cell => cell[0] === x && cell[1] === y);
        if (isAlive) {
            if (aliveNeighbors === 2 || aliveNeighbors === 3) {
                newAliveCells.push([x, y]);
            }
        } else {
            if (aliveNeighbors === 3) {
                newAliveCells.push([x, y]);
            }
        }
    }
    newAliveCells.forEach(cell => {
        seenCells.add(`${cell[0]},${cell[1]}`);
    });

    prev = aliveCells;

    backs.forEach(function (part, index) {
        temp = backs[index]
        backs[index] = prev;
        prev = temp;
    }, backs);
    aliveCells = newAliveCells;
    checkForGliders();
    checkRepeats();
    drawGrid();
}

function gameTickCustom() {
    currentIteration++;
    document.getElementById('iteration').textContent = 'Generation: ' + currentIteration;

    let newAliveCells = [];
    let cellsToCheck = new Set();
    let valueOfCells = {};

    // Add all alive cells and their neighbors to cellsToCheck
    aliveCells.forEach(([x, y]) => {
        cellsToCheck.add(`${x},${y}`);
        [-2, -1, 0, 1, 2].forEach(dx => {
            [-2, -1, 0, 1, 2].forEach(dy => {
                let nx = x + dx;
                let ny = y + dy;
                let key = `${nx},${ny}`;
                if (!valueOfCells.hasOwnProperty(key)) {
                    valueOfCells[key] = 0;
                }
                cellsToCheck.add(key);
            });
        });
    });

    cellsToCheck.forEach(cell => {
        let [x, y] = cell.split(',').map(Number);
        [-2, -1, 0, 1, 2].forEach(dx => {
            [-2, -1, 0, 1, 2].forEach(dy => {
                if (dx !== 0 || dy !== 0) {
                    // console.log("heyo");
                    let nx = x + dx;
                    let ny = y + dy;
                    // console.log(aliveCells);
                    // console.log([nx, ny]);
                    a = JSON.stringify(aliveCells);
                    b = JSON.stringify([nx, ny]);
                    var found = a.indexOf(b);
                    if (found != -1) {
                        // console.log("heyeo");

                        let distance = Math.abs(dx) + Math.abs(dy);
                        let key = `${x},${y}`;
                        if (distance === 1) {
                            valueOfCells[key] += 4;
                        } else if (distance === 2) {
                            valueOfCells[key] += 3;
                        } else if (distance === 3) {
                            valueOfCells[key] += 2;
                        } else if (distance === 4) {
                            valueOfCells[key] += 1;
                        }
                    }
                }
            });
        });
    });
    // console.log("valcells");
    // console.log(valueOfCells);
    Object.entries(valueOfCells).forEach(([cell, value]) => {
        let [x, y] = cell.split(',').map(Number);
        a = JSON.stringify(aliveCells);
        b = JSON.stringify([x, y]);
        var foundy = a.indexOf(b);
        if (foundy != -1) {
            if (6 <= value && value <= 7) {
                newAliveCells.push([x, y]);
            }
        } else {
            if (7 <= value && value <= 8) {
                newAliveCells.push([x, y]);
            }
        }
    });

    aliveCells = newAliveCells;
    // checkForGliders();
    // checkRepeats();
    drawGrid();
}

function checkRepeats() {
    cells = new Set();

    aliveCells.forEach(cell => {
        const x = cell[0];
        const y = cell[1];

        patterns = [[[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]], [[x, y], [x + 1, y], [x + 2, y]], [[x, y], [x, y + 1], [x, y + 2]]]

        patterns.forEach(pattern => {
            if (patternMatched(pattern)) {
                pattern.forEach(patternCell => {
                    cells.add(patternCell);
                });
            }
        });
    });

    repeatCells = Array.from(cells);
}



function checkForGliders() {
    cells = new Set();

    aliveCells.forEach(cell => {
        const x = cell[0];
        const y = cell[1];

        const gliderPatterns = [
            [[x, y], [x + 1, y], [x + 2, y], [x + 2, y + 1], [x + 1, y + 2]],
            [[x, y], [x + 2, y], [x + 2, y - 1], [x + 1, y - 1], [x + 1, y - 2]],
            [[x, y], [x + 1, y - 1], [x + 2, y - 1], [x + 2, y], [x + 2, y + 1]],
            [[x, y], [x + 1, y - 1], [x + 2, y - 1], [x + 1, y - 2], [x, y - 2]],

            [[x, y], [x - 1, y - 1], [x - 1, y - 2], [x, y - 2], [x + 1, y - 2]],
            [[x, y], [x - 1, y - 1], [x - 1, y - 2], [x - 2, y], [x - 2, y - 1]],
            [[x, y], [x - 1, y - 1], [x - 2, y - 1], [x - 2, y], [x - 2, y + 1]],
            [[x, y], [x - 1, y - 1], [x - 1, y - 2], [x - 2, y - 1], [x - 2, y]],

            [[x, y], [x - 1, y + 1], [x - 1, y + 2], [x, y + 2], [x + 1, y + 2]],
            [[x, y], [x - 1, y + 1], [x - 1, y + 2], [x - 2, y + 1], [x - 2, y]],
            [[x, y], [x - 1, y + 1], [x - 2, y + 1], [x - 2, y], [x - 2, y - 1]],
            [[x, y], [x - 1, y + 1], [x - 1, y + 2], [x, y + 2], [x - 2, y + 1]],

            [[x, y], [x + 1, y + 1], [x + 1, y + 2], [x, y + 2], [x - 1, y + 2]],
            [[x, y], [x + 1, y + 1], [x + 1, y + 2], [x + 2, y + 1], [x + 2, y]],
            [[x, y], [x + 1, y + 1], [x + 2, y + 1], [x + 2, y], [x + 2, y - 1]],
            [[x, y], [x + 1, y + 1], [x + 1, y + 2], [x, y + 2], [x + 2, y + 1]],

            [[x, y], [x, y - 2], [x - 1, y - 1], [x - 1, y - 2], [x - 2, y - 1]]
        ];
        // console.log("new alive cell");

        gliderPatterns.forEach(pattern => {
            if (patternMatched(pattern)) {
                pattern.forEach(patternCell => {
                    cells.add(patternCell);
                });
            }
            // console.log("yay");
            // console.log(pattern);
            // console.log(aliveCells);
        });
    });

    gliderCells = Array.from(cells);
}



function patternNeighbors(pattern) {
    for (let i = 0; i < pattern.length; i++) {
        const [x, y] = pattern[i];

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const neighbor = [x + dx, y + dy];

                // Check if this neighbor is not part of the pattern
                const isPartOfPattern = pattern.some(cell =>
                    cell[0] === neighbor[0] && cell[1] === neighbor[1]
                );

                // If the neighbor is not part of the pattern but is alive, return false
                if (!isPartOfPattern) {
                    const isNeighborAlive = aliveCells.some(cell =>
                        cell[0] === neighbor[0] && cell[1] === neighbor[1]
                    );

                    if (isNeighborAlive) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

function patternMatched(pattern) {
    let valid = pattern.every(([x, y]) =>
        aliveCells.some(cell => cell[0] === x && cell[1] === y)
    );
    return valid && patternNeighbors(pattern);
}

function resetGrid() {
    currentIteration = 0;
    document.getElementById('iteration').textContent = 'Generation: 0';

    stopGame();
    aliveCells = [];
    backs.forEach(function (part, index) {
        backs[index] = [];
    }, backs);
    seenCells = [];
    drawGrid();
}

function startGame() {
    if (interval) return;  // If the game is already running, do nothing

    const speed = document.getElementById('speedSelect').value;
    let intervalRate;

    switch (speed) {
        case 'superfast':
            intervalRate = 20;
            break;
        case 'fast':
            intervalRate = 100;
            break;
        case 'normal':
            intervalRate = 500;
            break;
        case 'slow':
            intervalRate = 1000;
            break;
    }
    console.log(customtick);
    if (customtick) {
        interval = setInterval(gameTickCustom, intervalRate);
    } else {
        interval = setInterval(gameTick, intervalRate);
    }
}

function stopGame() {
    clearInterval(interval);
    interval = null;
}

function getStartCells() {
    // aliveCells = startCells;
    // drawGrid();
}

function zoomIn() {
    if (currentZoomIndex > 0) {
        currentZoomIndex--;
        cellSize = zoomLevels[currentZoomIndex];
        drawGrid();
    }
}

function zoomOut() {
    if (currentZoomIndex < zoomLevels.length - 1) {
        currentZoomIndex++;
        cellSize = zoomLevels[currentZoomIndex];
        drawGrid();
    }
}

function randomize() {
    aliveCells = [];
    for (let x = 0; x < canvas.width / cellSize; x++) {
        for (let y = 0; y < canvas.height / cellSize; y++) {
            if (Math.random() < 0.05) {
                aliveCells.push([x, y]);
            }
        }
    }
    drawGrid();
}

function createGlider() {
    resetGrid();
    const startX = Math.floor(canvas.width / cellSize / 2);
    const startY = Math.floor(canvas.height / cellSize / 2);
    aliveCells = [
        [startX, startY - 1],
        [startX + 1, startY],
        [startX - 1, startY + 1],
        [startX, startY + 1],
        [startX + 1, startY + 1]
    ];
    drawGrid();
    startCells = aliveCells;
}

function createMorph() {
    const startX = Math.floor(canvas.width / cellSize / 2);
    const startY = Math.floor(canvas.height / cellSize / 2);
    aliveCells = [
        [startX, startY],
        [startX, startY + 1],
        [startX + 1, startY + 1],
        [startX + 2, startY + 1],
        [startX + 1, startY + 2],

        [startX + 4, startY],
        [startX + 5, startY],
        [startX + 6, startY],
        [startX + 5, startY + 1],
    ];
    drawGrid();
    startCells = aliveCells;
}

function slideLeft() {
    for (let i = 0; i < aliveCells.length; i++) {
        aliveCells[i][0] += 1;
    }
    for (let i = 0; i < startCells.length; i++) {
        startCells[i][0] += 1;
    }
    for (let i = 0; i < gliderCells.length; i++) {
        gliderCells[i][0] += 1;
    }
    for (let i = 0; i < repeatCells.length; i++) {
        repeatCells[i][0] += 1;
    }
    backs.forEach(arr => {
        for (let i = 0; i < arr.length; i++) {
            arr[i][0] += 1;
        }
    });
    viewportOffset.x += 1;
    drawGrid();
}

function slideRight() {
    for (let i = 0; i < aliveCells.length; i++) {
        aliveCells[i][0] -= 1;
    }
    for (let i = 0; i < startCells.length; i++) {
        startCells[i][0] -= 1;
    }
    for (let i = 0; i < gliderCells.length; i++) {
        gliderCells[i][0] -= 1;
    }
    for (let i = 0; i < repeatCells.length; i++) {
        repeatCells[i][0] -= 1;
    }
    backs.forEach(arr => {
        for (let i = 0; i < arr.length; i++) {
            arr[i][0] -= 1;
        }
    });
    viewportOffset.x -= 1;
    drawGrid();
}

function slideUp() {
    for (let i = 0; i < aliveCells.length; i++) {
        aliveCells[i][1] += 1;
    }
    for (let i = 0; i < startCells.length; i++) {
        startCells[i][1] += 1;
    }
    for (let i = 0; i < gliderCells.length; i++) {
        gliderCells[i][1] += 1;
    }
    for (let i = 0; i < repeatCells.length; i++) {
        repeatCells[i][1] += 1;
    }
    backs.forEach(arr => {
        for (let i = 0; i < arr.length; i++) {
            arr[i][1] += 1;
        }
    });
    viewportOffset.y += 1;
    drawGrid();
}

function slideDown() {
    for (let i = 0; i < aliveCells.length; i++) {
        aliveCells[i][1] -= 1;
    }
    for (let i = 0; i < startCells.length; i++) {
        startCells[i][1] -= 1;
    }
    for (let i = 0; i < gliderCells.length; i++) {
        gliderCells[i][1] -= 1;
    }
    for (let i = 0; i < repeatCells.length; i++) {
        repeatCells[i][1] -= 1;
    }
    backs.forEach(arr => {
        for (let i = 0; i < arr.length; i++) {
            arr[i][1] -= 1;
        }
    });
    viewportOffset.y -= 1;
    drawGrid();
}


// Keyboard controls
let moveInterval;

document.addEventListener('keydown', function (event) {
    if (moveInterval) {
        clearInterval(moveInterval);
    }
    switch (event.key) {
        case 'w':
            moveInterval = setInterval(slideUp, 600);
            break;
        case 'a':
            moveInterval = setInterval(slideLeft, 600);
            break;
        case 's':
            moveInterval = setInterval(slideDown, 600);
            break;
        case 'd':
            moveInterval = setInterval(slideRight, 600);
            break;
    }
});

document.addEventListener('keyup', function (event) {
    if (moveInterval) {
        clearInterval(moveInterval);
        moveInterval = null;
    }
});


let movingUp = false;
let movingDown = false;
let movingLeft = false;
let movingRight = false;

function continuousSlide() {
    if (movingUp) slideUp();
    if (movingDown) slideDown();
    if (movingLeft) slideLeft();
    if (movingRight) slideRight();

    requestAnimationFrame(continuousSlide);
}

document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'w':
            movingUp = true;
            break;
        case 'a':
            movingLeft = true;
            break;
        case 's':
            movingDown = true;
            break;
        case 'd':
            movingRight = true;
            break;
    }
});

document.addEventListener('keyup', function (event) {
    switch (event.key) {
        case 'w':
            movingUp = false;
            break;
        case 'a':
            movingLeft = false;
            break;
        case 's':
            movingDown = false;
            break;
        case 'd':
            movingRight = false;
            break;
    }
});

// Start the continuous sliding loop
continuousSlide();



// Function to create a string representation of the grid state
function getGridStateString() {
    let stateString = '';
    aliveCells.forEach(cell => {
        stateString += 'x' + cell[0] + 'y' + cell[1];
    });
    return stateString;
}

// Function to copy text to the clipboard
function copyTextToClipboard(text) {
    var dummy = document.createElement("input");
    dummy.value = text;
    document.body.appendChild(dummy);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

// Event listener for the copy button
document.getElementById('copyButton').addEventListener('click', function () {
    var gridStateString = getGridStateString();
    copyTextToClipboard(gridStateString);
});


function applyGridState(stateString) {
    aliveCells = [];

    const coordinates = stateString.match(/x\d+y\d+/g); // Matches patterns like "x2y3"
    if (coordinates) {
        coordinates.forEach(coord => {
            const parts = coord.match(/x(\d+)y(\d+)/); // Separates the numbers after "x" and "y"
            if (parts) {
                const x = parseInt(parts[1], 10);
                const y = parseInt(parts[2], 10);
                aliveCells.push([x, y]);
            }
        });
    }

    drawGrid();
}

document.getElementById('applyGridStateButton').addEventListener('click', function () {
    var gridStateString = document.getElementById('gridStateInput').value;
    applyGridState(gridStateString);
});
