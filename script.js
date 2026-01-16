const rows = 150;
const cols = 150;
const cellSize = 5;

const gridElement = document.getElementById("grid");
const gridn = [];
const cells = [];

const empty = 0;
const sand = 1;
const water = 2;
const clay = 3;

let currentParticle = sand;
let rad = 5;

// Initialize grid and cells
function start() {
    for (let y = 0; y < rows; y++) {
        gridn[y] = [];
        cells[y] = [];
        for (let x = 0; x < cols; x++) {
            gridn[y][x] = empty;
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.style.backgroundColor = "black";
            gridElement.appendChild(cell);
            cells[y][x] = cell;
        }
    }
}

// Physics update with randomness
function update_grid() {
    for (let y = rows - 1; y >= 0; y--) {
        for (let x = 0; x < cols; x++) {
            const randDir = Math.random() < 0.5 ? -1 : 1;
            const randMove = Math.random();

            // SAND
            if (gridn[y][x] === sand) {
                if (y + 1 < rows) {
                    // fall down
                    if (gridn[y + 1][x] === empty && randMove > 0.1) {
                        gridn[y + 1][x] = sand;
                        gridn[y][x] = empty;
                        continue;
                    }
                    // swap with water (random)
                    if (gridn[y + 1][x] === water && randMove > 0.4) {
                        gridn[y + 1][x] = sand;
                        gridn[y][x] = water;
                        continue;
                    }
                    // diagonal movement
                    const diagX = x + randDir;
                    if (diagX >= 0 && diagX < cols && y + 1 < rows) {
                        if (gridn[y + 1][diagX] === empty && randMove > 0.2) {
                            gridn[y][x] = gridn[y + 1][diagX];1
                            gridn[y + 1][diagX] = sand;
                            
                            continue;
                        }
                    }
                }
            }

            // WATER
            if (gridn[y][x] === water) {
                if (y + 1 < rows && gridn[y + 1][x] === empty && randMove > 0.1) {
                    gridn[y + 1][x] = water;
                    gridn[y][x] = empty;
                    continue;
                }
                // diagonal down
                const diagX = x + randDir;
                if (y + 1 < rows && diagX >= 0 && diagX < cols && gridn[y + 1][diagX] === empty && randMove > 0.3) {
                    gridn[y + 1][diagX] = water;
                    gridn[y][x] = empty;
                    continue;
                }
                // horizontal spread
                if (diagX >= 0 && diagX < cols && gridn[y][diagX] === empty && randMove > 0.4) {
                    gridn[y][diagX] = water;
                    gridn[y][x] = empty;
                    continue;
                }
            }
        }
    }
}

// Render colors
function render_grid() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            switch(gridn[y][x]) {
                case empty: cells[y][x].style.backgroundColor = "black"; break;
                case sand: cells[y][x].style.backgroundColor = "yellow"; break;
                case water: cells[y][x].style.backgroundColor = "blue"; break;
                case clay: cells[y][x].style.backgroundColor = "gray"; break;
            }
        }
    }
}

// Add particle at cursor
function addParticleAtCursor(event) {
    const rect = gridElement.getBoundingClientRect();
    const x1 = Math.floor((event.clientX - rect.left) / cellSize);
    const y1 = Math.floor((event.clientY - rect.top) / cellSize);

    for (let dy = -rad; dy <= rad; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
            let x = x1 + dx;
            let y = y1 + dy;
            if (x >= 0 && x < cols && y >= 0 && y < rows) {
                if (dx*dx + dy*dy <= rad*rad) {
                    gridn[y][x] = currentParticle;
                }
            }
        }
    }
}

// Mouse events
gridElement.addEventListener("click", addParticleAtCursor);
gridElement.addEventListener("mousemove", e => {
    if (e.buttons === 1) addParticleAtCursor(e);
});

// Key events
document.addEventListener("keydown", e => {
    if (e.key === "1") currentParticle = sand;
    if (e.key === "2") currentParticle = water;
    if (e.key === "3") currentParticle = clay;
    if (e.key === "r") {
        for (let y = 0; y < rows; y++)
            for (let x = 0; x < cols; x++)
                gridn[y][x] = empty;
    }
});

// Scroll wheel changes brush size
gridElement.addEventListener("wheel", e => {
    if (e.deltaY < 0) rad++;
    else rad--;
    rad = Math.max(1, Math.min(rad, 20));
    e.preventDefault();
}, { passive: false });

// Animation loop
function loop() {
    update_grid();
    render_grid();
    requestAnimationFrame(loop);
}

start();
requestAnimationFrame(loop);
