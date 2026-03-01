// ═══════════════════════════════════════════════════════════════════
//  TILESET DEFINITIONS — basechip.png (8 cols × 133 rows)
//  Frame IDs verified from working hardcoded maps in WorldScene
// ═══════════════════════════════════════════════════════════════════

export const TILE_DEFS = {
    // ─── Grass (walkable ground) ───
    grass: { frame: 73 },    // green grass (verified: island map uses 73 for grass)

    // ─── Path / walkable floors ───
    path: { frame: 456 },   // metal/clean floor (verified: research station corridor)
    path_2: { frame: 448 },   // interior floor (verified: research station interior)

    // ─── Walls (blocking) ───
    wall: { frame: 344 },   // grey stone wall (verified: research station + island hut)

    // ─── Exit marker ───
    exit: { frame: 82 },    // sand/exit tile (verified: ocean map sand)
};

// ═══════════════════════════════════════════════════════════════════
//  TERRAIN PALETTES — all use the same verified tile set
// ═══════════════════════════════════════════════════════════════════

const simplePalette = {
    ground: ['grass'],
    path: ['path', 'path_2'],
    wall: ['wall'],
    exit: ['exit'],
};

export const TERRAIN_PALETTES = {
    island: simplePalette,
    station: simplePalette,
    ocean: simplePalette,
    cave: simplePalette,
    default: simplePalette,
};
