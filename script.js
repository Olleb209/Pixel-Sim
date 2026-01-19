const rows = 100;
const cols = 100;
const cellSize = 7;

const gridElement = document.getElementById("grid");
const grid = [];
const cells = [];

let brushRadius = 5;
let currentType = 3; 

const keys = {};

const udir = 69696969696969420;

const indexes = {
    empty: 0,
    stone: 1,
    sand: 2,
    mud: 3,
    water: 4,
    lava: 5,
    steam: 6
}

const types = {
    empty: {
        index: indexes.empty,
        color: "rgb(0,0,0)",
        dirs: [],
        test: []
    },
    // Solid
    stone: {
        index: indexes.stone,
        color: "rgb(63, 63, 63)",
        dirs: [],
        test: []
    },
    // dust
    sand: {
        index: indexes.sand,
        color: "rgb(255,217,0)",
        dirs: [
            [1, 0],   // down
            [1, udir],  // down-left
            [1, udir]    // down-right
        ],
        test: [
            {
                gt: indexes.empty,
                turns: indexes.sand,
                leaves: indexes.empty,
                chance: 0.1
            },
            {
                gt: indexes.water,
                turns: indexes.mud,
                leaves: indexes.empty,
                chance: 0.3
            }
        ]
    },
    mud: {
        index: indexes.mud,
        color: "rgb(156, 102, 0)",
        dirs: [
            [1, 0]
        ],
        test: [
            {
                gt: indexes.empty,
                turns: indexes.mud,
                leaves: indexes.empty,
                chance: 0.1
            },
            {
                gt: indexes.water,
                turns: indexes.mud,
                leaves: indexes.water,
                chance: 0.5
            },
            {
                gt: indexes.sand,
                turns: indexes.mud,
                leaves: indexes.sand,
                chance: 0.8
            }
        ]
    },
    // liquid
    water: {
        index: indexes.water,
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
                gt: indexes.empty,
                turns: indexes.water,
                leaves: indexes.empty,
                chance: 0.1
            },
            {
                gt: indexes.sand,
                turns: indexes.mud,
                leaves: indexes.empty,
                chance: 0.7
            },
            {
                gt: indexes.lava,
                turns: indexes.stone,
                leaves: indexes.steam,
                chance: 0.1
            }
        ]
    },
    lava: {
        index: indexes.lava,
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
                gt: indexes.empty,
                turns: indexes.lava,
                leaves: indexes.empty,
                chance: 0.3
            },
            {
                gt: indexes.water,
                turns: indexes.stone,
                leaves: indexes.steam,
                chance: 0.5
            }
        ]
    },
    // gas
    steam: {
        index: indexes.steam,
        color: "rgb(160, 160, 160)",
        dirs: [
            [-1, 0],  
            [-1, udir], 
            [-1, udir],
            [0, udir],
            [0, udir]
        ],
        test: [
            {
                gt: indexes.empty,
                turns: indexes.steam,
                leaves: indexes.empty,
                chance: 0.2
            },
            {
                gt: indexes.water,
                turns: indexes.steam,
                leaves: indexes.water,
                chance: 0.15
            },
            {
                gt: indexes.lava,
                turns: indexes.steam,
                leaves: indexes.lava,
                chance: 0.25
            }
        ]
    }
};

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

    const container = document.getElementById("buttonsContainer");

    for (let [key, value] of types) {
        const button = document.createElement("button");

        button.textContent = key;

        button.addEventListener("click", function() {
            currentType = value.index;
        });
    }

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
            for (const [key, type] of Object.entries(types)) {
                if (grid[y][x] === type.index){
                    cells[y][x].style.background = type.color;
                }
            }
        }
    }
}

function update() {
    // --- Update solids and liquids ---
    for (let y = rows - 1; y >= 0; y--) {
        for (let x = 0; x < cols; x++) {
            for (const [key, type] of Object.entries(types)) {
                if (type.index === indexes.steam) continue; // skip gases here
                moveCell(x, y, type);
            }
        }
    }

    // --- Update gases separately ---
    for (let y = 0; y < rows; y++) { // gases usually go up
        for (let x = 0; x < cols; x++) {
            for (const [key, type] of Object.entries(types)) {
                if (type.index !== indexes.steam) continue;
                moveCell(x, y, type);
            }
        }
    }
}

// Helper to move a cell based on its type
function moveCell(x, y, type) {
    let moved = false;
    if (grid[y][x] !== type.index) return;

    let randDir = Math.random() < 0.5 ? -1 : 1;

    for (let dir of type.dirs) {
        let dx = dir[1];
        if (dx === udir) dx = randDir;
        const nx = x + dx;
        const ny = y + dir[0];

        if (!type.test) continue;
        for (let g of type.test) {
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                if (grid[ny][nx] === g.gt && g.chance < Math.random()) {
                    grid[ny][nx] = g.turns;
                    grid[y][x] = g.leaves;
                    moved = true;
                    break;
                }
            }
        }
        if (moved) break;
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
