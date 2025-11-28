import { BiomeType, POIType } from '../models/Biomes';
import { Tile, GenerationParams } from '../models/Island';

export class POIPlacement {

  private seed: number = 0;

  /**
   * Deterministic random generator
   */
  private random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Main method to apply all Points of Interest and Civilization features
   */
  public applyPOIs(grid: Tile[][], params: GenerationParams) {
    // Initialize local seed based on main seed to ensure reproducibility
    // We add 500 to differentiate from the terrain noise
    this.seed = params.seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 500;

    // 1. Natural Events
    this.placeVolcano(grid, params);

    // 2. Civilization (Start with the Capital)
    this.placeCapitalCity(grid, params);
  }

  /**
   * Tries to place ONE volcano with a low probability.
   * Prefers replacing an existing Mountain.
   */
  private placeVolcano(grid: Tile[][], params: GenerationParams) {
    // 10% chance to have a volcano (0.1)
    if (this.random() > 0.1) return; 

    const mountains: Tile[] = [];
    const landTiles: Tile[] = [];

    // Collect candidates
    grid.forEach(row => {
        row.forEach(tile => {
            if (tile.biome === BiomeType.MOUNTAIN) mountains.push(tile);
            if (tile.elevation === 1) landTiles.push(tile);
        });
    });

    let target: Tile;

    // Priority: Replace a mountain. If no mountain, pick random land.
    if (mountains.length > 0) {
        const index = Math.floor(this.random() * mountains.length);
        target = mountains[index];
    } else if (landTiles.length > 0) {
        const index = Math.floor(this.random() * landTiles.length);
        target = landTiles[index];
    } else {
        return; // No land to place volcano
    }

    // Apply Volcano
    target.biome = BiomeType.VOLCANO;
    target.poi = null; // A volcano is a biome feature, not a constructed POI
  }

  /**
   * Places the main capital city.
   * Rules: Must be on land, preferably flat, and adjacent to water (Coastal).
   */
  private placeCapitalCity(grid: Tile[][], params: GenerationParams) {
    const coastalCandidates: Tile[] = [];

    grid.forEach(row => {
        row.forEach(tile => {
            // Check if valid terrain for a city (Not Mountain, Not Volcano, Not Water)
            const isValidTerrain = tile.elevation === 1 
                && tile.biome !== BiomeType.MOUNTAIN 
                && tile.biome !== BiomeType.VOLCANO;

            if (isValidTerrain) {
                // Check neighbors for water
                const hasWaterNeighbor = 
                    (grid[tile.y+1] && grid[tile.y+1][tile.x].elevation === 0) || 
                    (grid[tile.y-1] && grid[tile.y-1][tile.x].elevation === 0) || 
                    (grid[tile.y][tile.x+1] && grid[tile.y][tile.x+1].elevation === 0) || 
                    (grid[tile.y][tile.x-1] && grid[tile.y][tile.x-1].elevation === 0);
                
                if (hasWaterNeighbor) {
                    coastalCandidates.push(tile);
                }
            }
        });
    });

    if (coastalCandidates.length > 0) {
        // Pick a random coastal spot for the capital
        const index = Math.floor(this.random() * coastalCandidates.length);
        const cityTile = coastalCandidates[index];

        cityTile.biome = BiomeType.URBAN_ZONE;
        cityTile.poi = POIType.CAPITAL_CITY;
    }
  }
}