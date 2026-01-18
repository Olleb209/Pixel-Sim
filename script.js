const rows = 150;
const cols = 150;
const cellSize = 5;

const gridElement = document.getElementById("grid");
const grid = [];
const cells = [];

let brushRadius = 5;
let currentType = 3; 

const keys = {};

const udir = 69696969696969420;

const types = [
    {
        index: 0,
        color: "rgb(0,0,0)",
        dirs: [],
        test: []
    },
    {
        index: 1,
        color: "rgb(63, 63, 63)",
        dirs: [],
        test: []
    },
    {
        index: 2,
        color: "rgb(255,217,0)",
        dirs: [
            [1, 0],   // down
            [1, udir],  // down-left
            [1, udir]    // down-right
        ],
        test: [
            {
                gt: 0,
                turns: 2,
                leaves: 0,
                chance: 0.1
            },
            {
                gt: 4,
                turns: 3,
                leaves: 0,
                chance: 0.3
            }
        ]
    },
    {
        index: 3,
        color: "rgb(156, 102, 0)",
        dirs: [
            [1, 0]
        ],
        test: [
            {
                gt: 0,
                turns: 2,
                leaves: 0,
                chance: 0.1
            },
            {
                gt: 4,
                turns: 3,
                leaves: 4,
                chance: 0.5
            },
            {
                gt: 2,
                turns: 3,
                leaves: 2,
                chance: 0.8
            }
        ]
    },
    {
        index: 4,
        color: "rgb(0, 38, 255)",
        dirs: [
            [1, 0],   // down
            [1, udir],  // down-left
            [1, udir],   // down-right
            [0, udir],
            [0, udir]
        ],
        test: [
            {
                gt: 0,
                turns: 4,
                leaves: 0,
                chance: 0.1
            },
            {
                gt: 2,
                turns: 3,
                leaves: 0,
                chance: 0.7
            }
        ]
    },
    {
        index: 5,
        color: "rgb(221, 44, 0)",
        dirs: [
            [1, 0],   // down
            [1, udir],  // down-left
            [1, udir],   // down-right
            [0, udir],
            [0, udir]
        ],
        test: [
            {
                gt: 0,
                turns: 5,
                leaves: 0,
                chance: 0.3
            },
            {
                gt: 4,
                turns: 1,
                leaves: 0,
                chance: 0.5
            }
        ]
    }
];

let isMouseDown = false;

window.addEventListener("keydown", e => {
  keys[e.code] = true;
});

window.addEventListener("keyup", e => {
  keys[e.code] = false;
});

gridElement.addEventListener("mousedown", e => {
    if (e.button === 0) {
        isMouseDown = true;
        drawCircleAtCursor(e);
    }
});

gridElement.addEventListener("mouseup", e => {
    if (e.button === 0) isMouseDown = false;
});

gridElement.addEventListener("mouseleave", e => {
    isMouseDown = false;
});

gridElement.addEventListener("mousemove", e => {
    if (isMouseDown) drawCircleAtCursor(e);
});
function drawCircleAtCursor(e) {
    const rect = gridElement.getBoundingClientRect();
    const cx = Math.floor((e.clientX - rect.left) / cellSize);
    const cy = Math.floor((e.clientY - rect.top) / cellSize);

    for (let dy = -brushRadius; dy <= brushRadius; dy++) {
        for (let dx = -brushRadius; dx <= brushRadius; dx++) {
            const x = cx + dx;
            const y = cy + dy;

            if (x >= 0 && x < cols && y >= 0 && y < rows) {
                if (dx*dx + dy*dy <= brushRadius*brushRadius) {
                    grid[y][x] = currentType;
                }
            }
        }
    }
}

function start() {
    gridElement.style.display = "grid";
    gridElement.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    gridElement.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

    for (let y = 0; y < rows; y++) {
        grid[y] = [];
        cells[y] = [];
        for (let x = 0; x < cols; x++) {
            grid[y][x] = 0;

            const cell = document.createElement("div");
            cell.style.width = cellSize + "px";
            cell.style.height = cellSize + "px";
            cell.style.background = "black";

            gridElement.appendChild(cell);
            cells[y][x] = cell;
        }
    }
}

function render() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            for (let type of types) {
                if (grid[y][x] === type.index){
                    cells[y][x].style.background = type.color;
                }
            }
        }
    }
}

function update() {
    for (let y = rows - 1; y >= 0; y--) {
        for (let x = 0; x < cols; x++) {
            for (let type of types) {
                let moved = false;
                if (grid[y][x] !== type.index) continue;

                // random horizontal choice for this update
                let randDir = Math.random() < 0.5 ? -1 : 1;

                for (let dir of type.dirs) {
                    let dx = dir[1];
                    if (dx === udir) dx = randDir; // replace udir with random left/right
                    const nx = x + dx;
                    const ny = y + dir[0];
                    
                    if (!type.test) continue;
                    for (let g of type.test) {
                        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                            if (grid[ny][nx] === g.gt && g.chance < Math.random()) {
                                grid[ny][nx] = g.turns;
                                grid[y][x] = g.leaves;
                                moved = true;
                                break; // stop checking dirs
                            }
                        }
                    }
                    if (moved) break;
                }
                if (moved) break;
            }
        }
    }
}

function loop(time) {
    if (keys["Digit1"]) currentType = 1;
    if (keys["Digit2"]) currentType = 2;
    if (keys["Digit3"]) currentType = 3;
    if (keys["Digit4"]) currentType = 4;
    if (keys["Digit5"]) currentType = 5;
    // Don't call drawCircleAtCursor here!
    update(); // optional, can be empty
    render();
    requestAnimationFrame(loop);
}

start();
requestAnimationFrame(loop);
