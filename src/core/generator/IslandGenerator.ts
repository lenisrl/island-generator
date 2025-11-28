import { BiomeType, POIType } from '../models/Biomes';
import { Tile, GenerationParams } from '../models/Island';

export class IslandGenerator {
  
  private seed: number = 0;

  /**
   * Simple pseudo-random generator based on sine waves.
   * Deterministic: same seed = same sequence.
   */
  private random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  private randomRange(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Main entry point to generate the grid.
   */
  public generate(params: GenerationParams): Tile[][] {
    // 1. Initialize Seed (String to Number hash)
    this.seed = params.seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const grid: Tile[][] = [];
    const centerX = Math.floor(params.width / 2);
    const centerY = Math.floor(params.height / 2);
    
    // Base radius for the island shape
    const baseRadius = Math.min(centerX, centerY) * 0.7; 

    // --- STEP 1: SHAPE GENERATION (The "Potato" Algorithm) ---
    for (let y = 0; y < params.height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < params.width; x++) {
        
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Modulate radius based on angle to create irregularities
        const angle = Math.atan2(dy, dx);
        const irregularity = Math.sin(angle * 3 + this.seed) * 2 
                           + Math.cos(angle * 5) * 1.5;          
        
        const threshold = baseRadius + irregularity;
        let isLand = distance < threshold;

        // Force ocean on extreme borders
        if (x < 2 || y < 2 || x > params.width - 3 || y > params.height - 3) isLand = false;

        row.push({
          id: `${x}-${y}`,
          x, y,
          biome: BiomeType.OCEAN, // Default
          poi: null,
          elevation: isLand ? 1 : 0
        });
      }
      grid.push(row);
    }

    // --- STEP 2: BIOME DISTRIBUTION (Voronoi Zones) ---
    this.applyBiomesVoronoi(grid, params);

    // --- STEP 3: COASTLINES (Beaches) ---
    this.applyBeaches(grid, params);

    return grid;
  }

  private applyBiomesVoronoi(grid: Tile[][], params: GenerationParams) {
    const biomeSeeds: {x: number, y: number, type: BiomeType}[] = [];
    const nbZones = 8; // Number of distinct biome regions

    // Biome pool (weighted for tropical feel)
    const availableBiomes = [
        BiomeType.JUNGLE, BiomeType.JUNGLE,
        BiomeType.RAINFOREST,
        BiomeType.SAVANNA,
        BiomeType.MOUNTAIN,
        BiomeType.COASTAL_DESERT
    ];

    // Place biome seeds on land tiles
    for(let i=0; i < nbZones; i++) {
        let attempts = 0;
        let sx, sy;
        do {
            sx = this.randomRange(2, params.width - 3);
            sy = this.randomRange(2, params.height - 3);
            attempts++;
        } while (grid[sy][sx].elevation === 0 && attempts < 50);

        if (grid[sy][sx].elevation === 1) {
            const randomBiome = availableBiomes[this.randomRange(0, availableBiomes.length - 1)];
            biomeSeeds.push({ x: sx, y: sy, type: randomBiome });
        }
    }

    // Assign each land tile to the nearest biome seed
    for (let y = 0; y < params.height; y++) {
      for (let x = 0; x < params.width; x++) {
        if (grid[y][x].elevation === 1) { 
            let minDist = Infinity;
            let chosenBiome = BiomeType.RAINFOREST; // Fallback

            biomeSeeds.forEach(seed => {
                const dist = Math.sqrt((x - seed.x)**2 + (y - seed.y)**2);
                if (dist < minDist) {
                    minDist = dist;
                    chosenBiome = seed.type;
                }
            });
            
            grid[y][x].biome = chosenBiome;
        }
      }
    }
  }

  private applyBeaches(grid: Tile[][], params: GenerationParams) {
    for (let y = 1; y < params.height - 1; y++) {
      for (let x = 1; x < params.width - 1; x++) {
        const tile = grid[y][x];
        if (tile.elevation === 1) {
            // Check 4 neighbors
            const hasWaterNeighbor = 
                grid[y+1][x].elevation === 0 || 
                grid[y-1][x].elevation === 0 || 
                grid[y][x+1].elevation === 0 || 
                grid[y][x-1].elevation === 0;
            
            if (hasWaterNeighbor) {
                tile.biome = BiomeType.BEACH;
            }
        }
      }
    }
  }
}