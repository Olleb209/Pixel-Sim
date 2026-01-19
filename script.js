const rows = 100;
const cols = 100;
const cellSize = 7;

const gridElement = document.getElementById("grid");
const grid = [];
const cells = [];

let brushRadius = 5;
// Default to sand (index 2) as a starting material
let currentType = 2; 

const keys = {};

// Use a string or meaningful value for udir that you can check against later
const udir = "random_direction"; 

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

// *** MODIFIED START FUNCTION WITH BUTTON GENERATION ***
function start() {
    gridElement.style.display = "grid";
    gridElement.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    gridElement.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

    // The buttonsContainer must exist in the HTML for this to work
    // Since you didn't include it in your HTML snippet, 
    // we will add the buttons just above the grid element.
    const container = document.createElement('div');
    container.id = 'buttonsContainer';
    document.body.insertBefore(container, gridElement);

    // Loop through the types object using Object.entries
    for (const [key, value] of Object.entries(types)) {
        const button = document.createElement("button");

        button.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize the first letter

        button.addEventListener("click", function() {
            currentType = value.index;
            console.log("Switched to: " + key);
        });

        container.appendChild(button);
    }
    // *** END OF BUTTON GENERATION ***


    // Initialize the grid data structure and DOM elements
    for (let y = 0; y < rows; y++) {
        grid[y] = [];
        cells[y] = [];
        for (let x = 0; x < cols; x++) {
            grid[y][x] = 0;

            const cell = document.createElement("div");
            cell.style.width = cellSize + "px";
            cell.style.height = cellSize + "px";
            // Set initial background color based on initial type (0, empty)
            cell.style.background = types.empty.color; 

            gridElement.appendChild(cell);
            cells[y][x] = cell;
        }
    }
}

function render() {
    // Optimized render loop to directly access the color from the grid value
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const typeIndex = grid[y][x];
            // Find the correct color efficiently
            // Note: A map of index->color would be faster, but this works
            for (const [key, type] of Object.entries(types)) {
                if (type.index === typeIndex){
                    cells[y][x].style.background = type.color;
                    break; // Exit the inner loop once the color is found
                }
            }
        }
    }
}

// ... (update and moveCell functions remain the same as you provided) ...

function update() {
    // --- Update solids and liquids ---
    // Iterate from bottom up for gravity simulation
    for (let y = rows - 1; y >= 0; y--) {
        for (let x = 0; x < cols; x++) {
            // Check for material types that fall down or spread
            const typeIndex = grid[y][x];
            if (typeIndex !== indexes.steam && typeIndex !== indexes.empty && typeIndex !== indexes.stone) {
                // Find the full type object to pass to moveCell
                const currentTypeObj = Object.values(types).find(t => t.index === typeIndex);
                if (currentTypeObj) {
                    moveCell(x, y, currentTypeObj);
                }
            }
        }
    }

    // --- Update gases separately ---
    // Iterate from top down for gas rising simulation
    for (let y = 0; y < rows; y++) { 
        for (let x = 0; x < cols; x++) {
            if (grid[y][x] === indexes.steam) {
                 const steamTypeObj = types.steam;
                 moveCell(x, y, steamTypeObj);
            }
        }
    }
}

// Helper to move a cell based on its type
function moveCell(x, y, type) {
    let moved = false;
    // Don't move if the cell content doesn't match the type we are processing
    if (grid[y][x] !== type.index) return; 

    // Used to randomize left/right direction for liquids/dusts
    let randDir = Math.random() < 0.5 ? -1 : 1;

    // Shuffle the directions array to reduce grid artifacts/bias
    const shuffledDirs = [...type.dirs].sort(() => Math.random() - 0.5);

    for (let dir of shuffledDirs) {
        let dx = dir[1];
        if (dx === udir) dx = randDir; // Apply random left/right
        const nx = x + dx;
        const ny = y + dir[0];

        if (!type.test) continue;
        for (let g of type.test) {
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                // Check if target cell matches the requirement (g.gt) AND chance passes
                if (grid[ny][nx] === g.gt && Math.random() > (1 - g.chance)) {
                    grid[ny][nx] = g.turns; // Target cell becomes this
                    grid[y][x] = g.leaves;  // Original cell becomes this
                    moved = true;
                    break; // Stop checking directions once moved
                }
            }
        }
        if (moved) break;
    }
}

function loop(time) {
    if (keys["Digit1"]) currentType = indexes.stone;
    if (keys["Digit2"]) currentType = indexes.sand;
    if (keys["Digit3"]) currentType = indexes.mud;
    if (keys["Digit4"]) currentType = indexes.water;
    if (keys["Digit5"]) currentType = indexes.lava;
    if (keys["Digit6"]) currentType = indexes.steam;

    update();
    render();
    requestAnimationFrame(loop);
}

// Initialize the simulation
start();
// Start the main loop
requestAnimationFrame(loop);
