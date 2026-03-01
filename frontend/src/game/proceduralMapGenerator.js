// ═══════════════════════════════════════════════════════════════════
//  PROCEDURAL MAP GENERATOR — Drunkard's Walk + BFS
//  Guarantees: hero → NPC path, hero → exit path (3-tile wide corridors)
// ═══════════════════════════════════════════════════════════════════

import { TILE_DEFS, TERRAIN_PALETTES } from './tilesetDefs';

const TILE_SIZE = 32;

// ─── Cell types ───
const CELL = {
    WALL: 'wall',
    FLOOR: 'floor',
    PATH: 'path',
    EXIT: 'exit',
};

const BLOCKING = new Set([CELL.WALL, CELL.PATH]);
const WALKABLE = new Set([CELL.FLOOR, CELL.EXIT]);

const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]];

// ─── Helpers ───
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function inBounds(x, y, w, h) { return x >= 0 && x < w && y >= 0 && y < h; }

function getRegionCenter(region, w, h) {
    switch (region) {
        case 'left': return { x: 3, y: Math.floor(h / 2) };
        case 'right': return { x: w - 4, y: Math.floor(h / 2) };
        case 'top': return { x: Math.floor(w / 2), y: 3 };
        case 'bottom': return { x: Math.floor(w / 2), y: h - 4 };
        case 'center':
        default: return { x: Math.floor(w / 2), y: Math.floor(h / 2) };
    }
}

function getRegionBounds(region, w, h) {
    const tw = Math.floor(w / 3), th = Math.floor(h / 3);
    switch (region) {
        case 'left': return { x0: 1, y0: 1, x1: tw, y1: h - 2 };
        case 'right': return { x0: w - tw - 1, y0: 1, x1: w - 2, y1: h - 2 };
        case 'top': return { x0: 1, y0: 1, x1: w - 2, y1: th };
        case 'bottom': return { x0: 1, y0: h - th - 1, x1: w - 2, y1: h - 2 };
        default: return { x0: tw, y0: th, x1: w - tw - 1, y1: h - th - 1 };
    }
}

function getEdgeTarget(edge, w, h) {
    switch (edge) {
        case 'left': return { x: 0, y: Math.floor(h / 2) };
        case 'right': return { x: w - 1, y: Math.floor(h / 2) };
        case 'top': return { x: Math.floor(w / 2), y: 0 };
        case 'bottom': return { x: Math.floor(w / 2), y: h - 1 };
        default: return { x: w - 1, y: Math.floor(h / 2) };
    }
}

function countWalkableNeighbours(grid, x, y, w, h) {
    let c = 0;
    for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy;
        if (inBounds(nx, ny, w, h) && WALKABLE.has(grid[ny][nx])) c++;
    }
    return c;
}

// ═══════════════════════════════════════════════
//  DRUNKARD'S WALK — higher floor ratio for open maps
// ═══════════════════════════════════════════════
function drunkardWalk(grid, w, h, config) {
    const { heroRegion, npcRegion, exitEdges, targetFloorRatio } = config;
    const total = w * h;
    const target = Math.floor(total * (targetFloorRatio || 0.55));
    const maxSteps = total * 8;

    const start = getRegionCenter(heroRegion || 'left', w, h);
    let cx = start.x, cy = start.y;
    grid[cy][cx] = CELL.FLOOR;
    let count = 1;

    const npcTarget = getRegionCenter(npcRegion || 'right', w, h);
    let reachedNpc = false;
    const edgeTargets = (exitEdges || ['right']).map(e => ({
        edge: e, target: getEdgeTarget(e, w, h), reached: false,
    }));

    for (let step = 0; step < maxSteps && count < target; step++) {
        let dir;
        // Bias towards targets more aggressively
        if (Math.random() < 0.45) {
            let t = null;
            if (!reachedNpc) t = npcTarget;
            else { const u = edgeTargets.find(e => !e.reached); if (u) t = u.target; }
            if (t) {
                const dx = t.x - cx, dy = t.y - cy;
                dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? [1, 0] : [-1, 0]) : (dy > 0 ? [0, 1] : [0, -1]);
            } else dir = pick(DIRS);
        } else dir = pick(DIRS);

        const nx = cx + dir[0], ny = cy + dir[1];
        if (nx < 1 || nx >= w - 1 || ny < 1 || ny >= h - 1) continue;
        cx = nx; cy = ny;
        if (grid[cy][cx] === CELL.WALL) { grid[cy][cx] = CELL.FLOOR; count++; }

        // Also carve one neighbour to make wider passages
        if (Math.random() < 0.4) {
            const sideDir = pick(DIRS);
            const sx = cx + sideDir[0], sy = cy + sideDir[1];
            if (sx >= 1 && sx < w - 1 && sy >= 1 && sy < h - 1 && grid[sy][sx] === CELL.WALL) {
                grid[sy][sx] = CELL.FLOOR; count++;
            }
        }

        if (!reachedNpc && Math.abs(cx - npcTarget.x) <= 1 && Math.abs(cy - npcTarget.y) <= 1) reachedNpc = true;
        for (const et of edgeTargets) {
            if (et.reached) continue;
            if (et.edge === 'left' && cx <= 1) et.reached = true;
            if (et.edge === 'right' && cx >= w - 2) et.reached = true;
            if (et.edge === 'top' && cy <= 1) et.reached = true;
            if (et.edge === 'bottom' && cy >= h - 2) et.reached = true;
        }
    }
    return count;
}

// ═══════════════════════════════════════════════
//  PATH VARIATION — visual only
// ═══════════════════════════════════════════════
function scatterPathObstacles(grid, w, h) {
    // Scatter a few path obstacles near walls (future tree placeholders)
    for (let y = 2; y < h - 2; y++) {
        for (let x = 2; x < w - 2; x++) {
            if (grid[y][x] !== CELL.FLOOR) continue;
            const wallNbrs = 4 - countWalkableNeighbours(grid, x, y, w, h);
            // Only near walls, low chance
            if (wallNbrs >= 2 && Math.random() < 0.12) {
                grid[y][x] = CELL.PATH;
            }
        }
    }
}

// ═══════════════════════════════════════════════
//  CARVE EXIT SLITS — 3 tiles wide, 4 tiles deep
// ═══════════════════════════════════════════════
function carveExitSlits(grid, w, h, exitEdges) {
    for (const edge of exitEdges) {
        const midH = Math.floor(h / 2), midW = Math.floor(w / 2);
        switch (edge) {
            case 'left':
                for (let dy = -1; dy <= 1; dy++) {
                    const y = Math.min(Math.max(midH + dy, 1), h - 2);
                    for (let dx = 0; dx < 4 && dx < w; dx++) grid[y][dx] = CELL.FLOOR;
                } break;
            case 'right':
                for (let dy = -1; dy <= 1; dy++) {
                    const y = Math.min(Math.max(midH + dy, 1), h - 2);
                    for (let dx = 0; dx < 4 && w - 1 - dx >= 0; dx++) grid[y][w - 1 - dx] = CELL.FLOOR;
                } break;
            case 'top':
                for (let dx = -1; dx <= 1; dx++) {
                    const x = Math.min(Math.max(midW + dx, 1), w - 2);
                    for (let dy = 0; dy < 4 && dy < h; dy++) grid[dy][x] = CELL.FLOOR;
                } break;
            case 'bottom':
                for (let dx = -1; dx <= 1; dx++) {
                    const x = Math.min(Math.max(midW + dx, 1), w - 2);
                    for (let dy = 0; dy < 4 && h - 1 - dy >= 0; dy++) grid[h - 1 - dy][x] = CELL.FLOOR;
                } break;
        }
    }
}

// ═══════════════════════════════════════════════
//  BFS
// ═══════════════════════════════════════════════
function bfs(grid, w, h, sx, sy) {
    const visited = Array.from({ length: h }, () => new Array(w).fill(false));
    if (!inBounds(sx, sy, w, h) || !WALKABLE.has(grid[sy][sx])) return visited;
    const queue = [[sx, sy]];
    visited[sy][sx] = true;
    while (queue.length > 0) {
        const [x, y] = queue.shift();
        for (const [dx, dy] of DIRS) {
            const nx = x + dx, ny = y + dy;
            if (!inBounds(nx, ny, w, h) || visited[ny][nx] || !WALKABLE.has(grid[ny][nx])) continue;
            visited[ny][nx] = true;
            queue.push([nx, ny]);
        }
    }
    return visited;
}

// ─── Carve a WIDE corridor (3 tiles wide) between two points ───
function carveWideCorridor(grid, w, h, x0, y0, x1, y1) {
    let cx = x0, cy = y0;
    const carveCell = (x, y) => {
        if (inBounds(x, y, w, h) && !WALKABLE.has(grid[y][x])) grid[y][x] = CELL.FLOOR;
    };
    // Horizontal first
    while (cx !== x1) {
        carveCell(cx, cy);
        carveCell(cx, cy - 1); // widen above
        carveCell(cx, cy + 1); // widen below
        cx += (x1 > cx) ? 1 : -1;
    }
    // Then vertical
    while (cy !== y1) {
        carveCell(cx, cy);
        carveCell(cx - 1, cy); // widen left
        carveCell(cx + 1, cy); // widen right
        cy += (y1 > cy) ? 1 : -1;
    }
    // Carve destination too
    carveCell(cx, cy);
    carveCell(cx - 1, cy);
    carveCell(cx + 1, cy);
    carveCell(cx, cy - 1);
    carveCell(cx, cy + 1);
}

function pickFloorInRegion(grid, w, h, region) {
    const bounds = getRegionBounds(region, w, h);
    const candidates = [];
    for (let y = bounds.y0; y <= bounds.y1; y++)
        for (let x = bounds.x0; x <= bounds.x1; x++)
            if (inBounds(x, y, w, h) && WALKABLE.has(grid[y][x])) candidates.push({ x, y });
    if (candidates.length === 0) {
        const c = getRegionCenter(region, w, h);
        const cx = Math.min(Math.max(c.x, 2), w - 3), cy = Math.min(Math.max(c.y, 2), h - 3);
        // Carve a 3x3 clearing
        for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++)
                if (inBounds(cx + dx, cy + dy, w, h)) grid[cy + dy][cx + dx] = CELL.FLOOR;
        return { x: cx, y: cy };
    }
    return pick(candidates);
}

function pickExitOnEdge(grid, w, h, edge) {
    const candidates = [];
    switch (edge) {
        case 'left': for (let y = 1; y < h - 1; y++) if (WALKABLE.has(grid[y][0])) candidates.push({ x: 0, y }); break;
        case 'right': for (let y = 1; y < h - 1; y++) if (WALKABLE.has(grid[y][w - 1])) candidates.push({ x: w - 1, y }); break;
        case 'top': for (let x = 1; x < w - 1; x++) if (WALKABLE.has(grid[0][x])) candidates.push({ x, y: 0 }); break;
        case 'bottom': for (let x = 1; x < w - 1; x++) if (WALKABLE.has(grid[h - 1][x])) candidates.push({ x, y: h - 1 }); break;
    }
    if (candidates.length === 0) {
        const t = getEdgeTarget(edge, w, h);
        grid[t.y][t.x] = CELL.FLOOR; return t;
    }
    const mid = (edge === 'left' || edge === 'right') ? Math.floor(h / 2) : Math.floor(w / 2);
    candidates.sort((a, b) => {
        const da = (edge === 'left' || edge === 'right') ? Math.abs(a.y - mid) : Math.abs(a.x - mid);
        const db = (edge === 'left' || edge === 'right') ? Math.abs(b.y - mid) : Math.abs(b.x - mid);
        return da - db;
    });
    return candidates[0];
}

// ─── Resolve cell type → tile def name from palette ───
function resolveCell(cellType, palette) {
    switch (cellType) {
        case CELL.FLOOR: return pick(palette.ground);
        case CELL.PATH: return pick(palette.path);
        case CELL.WALL: return pick(palette.wall);
        case CELL.EXIT: return pick(palette.exit);
        default: return pick(palette.ground);
    }
}

// ─── Find safe NPC patrol bounds (max walkable extent on Y axis from spawn) ───
function computePatrolBounds(grid, w, h, spawnTileX, spawnTileY, maxDist) {
    let minY = spawnTileY, maxY = spawnTileY;
    // Scan up
    for (let y = spawnTileY - 1; y >= Math.max(0, spawnTileY - maxDist); y--) {
        if (!WALKABLE.has(grid[y][spawnTileX])) break;
        minY = y;
    }
    // Scan down
    for (let y = spawnTileY + 1; y <= Math.min(h - 1, spawnTileY + maxDist); y++) {
        if (!WALKABLE.has(grid[y][spawnTileX])) break;
        maxY = y;
    }
    return {
        minY: minY * TILE_SIZE + TILE_SIZE / 2,
        maxY: maxY * TILE_SIZE + TILE_SIZE / 2,
        distance: (maxY - minY) * TILE_SIZE,
    };
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export function generateLocationMap(config) {
    const {
        width = 25, height = 19,
        heroRegion = 'left', npcRegion = 'right',
        exitEdges = ['right'], targetFloorRatio = 0.55,
        tileStyle = 'default', exitIds = [],
    } = config;

    const palette = TERRAIN_PALETTES[tileStyle] || TERRAIN_PALETTES.default;
    const MAX_ATTEMPTS = 5;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const grid = Array.from({ length: height }, () => new Array(width).fill(CELL.WALL));

        drunkardWalk(grid, width, height, { heroRegion, npcRegion, exitEdges, targetFloorRatio });
        carveExitSlits(grid, width, height, exitEdges);

        const hero = pickFloorInRegion(grid, width, height, heroRegion);
        const npc = pickFloorInRegion(grid, width, height, npcRegion);

        // Ensure hero and NPC spots are floor
        grid[hero.y][hero.x] = CELL.FLOOR;
        grid[npc.y][npc.x] = CELL.FLOOR;

        // Carve clearings around hero and NPC (3x3 minimum)
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (inBounds(hero.x + dx, hero.y + dy, width, height))
                    grid[hero.y + dy][hero.x + dx] = CELL.FLOOR;
                if (inBounds(npc.x + dx, npc.y + dy, width, height))
                    grid[npc.y + dy][npc.x + dx] = CELL.FLOOR;
            }
        }

        const exits = exitEdges.map((edge, i) => {
            const cell = pickExitOnEdge(grid, width, height, edge);
            grid[cell.y][cell.x] = CELL.EXIT;
            return {
                id: exitIds[i] || `exit_${edge}`, edge,
                tileX: cell.x, tileY: cell.y,
                x: cell.x * TILE_SIZE + TILE_SIZE / 2,
                y: cell.y * TILE_SIZE + TILE_SIZE / 2,
            };
        });

        // ─── BFS connectivity: wide corridors if not connected ───
        let visited = bfs(grid, width, height, hero.x, hero.y);
        let carved = false;
        if (!visited[npc.y][npc.x]) {
            carveWideCorridor(grid, width, height, hero.x, hero.y, npc.x, npc.y);
            carved = true;
        }
        for (const exit of exits) {
            if (!visited[exit.tileY][exit.tileX]) {
                carveWideCorridor(grid, width, height, hero.x, hero.y, exit.tileX, exit.tileY);
                carved = true;
            }
        }

        // Re-check after carving
        if (carved) {
            visited = bfs(grid, width, height, hero.x, hero.y);
            let allOk = visited[npc.y][npc.x];
            for (const exit of exits) {
                if (!visited[exit.tileY][exit.tileX]) allOk = false;
            }
            if (!allOk) {
                console.warn(`[ProceduralGen] Attempt ${attempt}: still not connected, retrying...`);
                continue;
            }
        }

        // Ensure arrival edges have walkable 3x3 areas
        // (player arrives at edge + 48px in, which is tile 1)
        for (const edge of exitEdges) {
            const midH = Math.floor(height / 2), midW = Math.floor(width / 2);
            switch (edge) {
                case 'left':
                    for (let dy = -1; dy <= 1; dy++) {
                        const y = Math.min(Math.max(midH + dy, 0), height - 1);
                        if (inBounds(1, y, width, height)) grid[y][1] = CELL.FLOOR;
                        if (inBounds(2, y, width, height)) grid[y][2] = CELL.FLOOR;
                    } break;
                case 'right':
                    for (let dy = -1; dy <= 1; dy++) {
                        const y = Math.min(Math.max(midH + dy, 0), height - 1);
                        if (inBounds(width - 2, y, width, height)) grid[y][width - 2] = CELL.FLOOR;
                        if (inBounds(width - 3, y, width, height)) grid[y][width - 3] = CELL.FLOOR;
                    } break;
                case 'top':
                    for (let dx = -1; dx <= 1; dx++) {
                        const x = Math.min(Math.max(midW + dx, 0), width - 1);
                        if (inBounds(x, 1, width, height)) grid[1][x] = CELL.FLOOR;
                        if (inBounds(x, 2, width, height)) grid[2][x] = CELL.FLOOR;
                    } break;
                case 'bottom':
                    for (let dx = -1; dx <= 1; dx++) {
                        const x = Math.min(Math.max(midW + dx, 0), width - 1);
                        if (inBounds(x, height - 2, width, height)) grid[height - 2][x] = CELL.FLOOR;
                        if (inBounds(x, height - 3, width, height)) grid[height - 3][x] = CELL.FLOOR;
                    } break;
            }
        }

        // Scatter a few path obstacles (blocking, future tree placeholders)
        scatterPathObstacles(grid, width, height);

        // Safety: remove any PATH tiles that break hero→NPC or hero→exit
        const postVisited = bfs(grid, width, height, hero.x, hero.y);
        let fixNeeded = !postVisited[npc.y][npc.x];
        for (const exit of exits) {
            if (!postVisited[exit.tileY][exit.tileX]) fixNeeded = true;
        }
        if (fixNeeded) {
            // Remove all PATH tiles that are on the critical corridor
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (grid[y][x] === CELL.PATH) grid[y][x] = CELL.FLOOR;
                }
            }
        }

        // ─── Compute NPC patrol bounds (only on walkable tiles) ───
        const npcTileX = Math.floor(npc.x), npcTileY = Math.floor(npc.y);
        const patrolBounds = computePatrolBounds(grid, width, height, npcTileX, npcTileY, 4);

        // Build rendering data
        const cellTypes = [];
        const groundDefNames = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                cellTypes.push(grid[y][x]);
                groundDefNames.push(resolveCell(grid[y][x], palette));
            }
        }

        const walkable = cellTypes.filter(c => WALKABLE.has(c)).length;
        console.log(`[ProceduralGen] Map ${width}×${height}, style: ${tileStyle}, ` +
            `walkable: ${(walkable / (width * height)).toFixed(2)}, attempt: ${attempt}, OK`);

        return {
            width, height,
            cellTypes,
            groundDefNames,
            treePositions: [],
            playerStart: {
                x: hero.x * TILE_SIZE + TILE_SIZE / 2,
                y: hero.y * TILE_SIZE + TILE_SIZE / 2,
            },
            npcSpawn: {
                x: npc.x * TILE_SIZE + TILE_SIZE / 2,
                y: npc.y * TILE_SIZE + TILE_SIZE / 2,
            },
            npcPatrolBounds: patrolBounds,  // safe patrol limits
            exits,
        };
    }

    // Fallback: completely open map
    console.error(`[ProceduralGen] Failed after ${MAX_ATTEMPTS} — open map`);
    const cellTypes = new Array(width * height).fill(CELL.FLOOR);
    for (let x = 0; x < width; x++) { cellTypes[x] = CELL.WALL; cellTypes[(height - 1) * width + x] = CELL.WALL; }
    for (let y = 0; y < height; y++) { cellTypes[y * width] = CELL.WALL; cellTypes[y * width + width - 1] = CELL.WALL; }
    return {
        width, height, cellTypes, treePositions: [],
        groundDefNames: cellTypes.map(c => resolveCell(c, TERRAIN_PALETTES.default)),
        playerStart: { x: 3 * TILE_SIZE, y: Math.floor(height / 2) * TILE_SIZE },
        npcSpawn: { x: (width - 4) * TILE_SIZE, y: Math.floor(height / 2) * TILE_SIZE },
        npcPatrolBounds: { minY: 4 * TILE_SIZE, maxY: (height - 4) * TILE_SIZE, distance: (height - 8) * TILE_SIZE },
        exits: (exitEdges || ['right']).map((edge, i) => {
            const t = getEdgeTarget(edge, width, height);
            return {
                id: (config.exitIds || [])[i] || `exit_${edge}`, edge,
                x: t.x * TILE_SIZE + TILE_SIZE / 2, y: t.y * TILE_SIZE + TILE_SIZE / 2
            };
        }),
    };
}
