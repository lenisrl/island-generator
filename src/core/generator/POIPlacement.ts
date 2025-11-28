import { BiomeType, POIType } from '../models/Biomes';
import { Tile, GenerationParams } from '../models/Island';

export class POIPlacement {

  private seed: number = 0;
  private capitalTile: Tile | null = null; // We store the capital location for distance checks

  private random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  public applyPOIs(grid: Tile[][], params: GenerationParams) {
    this.seed = params.seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 500;

    // 1. Natural Events
    this.placeVolcano(grid);

    // 2. Main City (Capital)
    this.placeCapitalCity(grid, params);

    // 3. Rural Population (Villages)
    this.placeVillages(grid, params);

    // 4. Wealth & Infrastructure Logic
    this.placeInfrastructures(grid, params);

    // 5. Criminal Activities
    this.placeIllegalActivities(grid, params);
  }

  // --- NATURAL FEATURES ---

  private placeVolcano(grid: Tile[][]) {
    if (this.random() > 0.1) return; // 10% chance
    const mountains = this.getAllTiles(grid).filter(t => t.biome === BiomeType.MOUNTAIN);
    if (mountains.length > 0) {
        const target = mountains[Math.floor(this.random() * mountains.length)];
        target.biome = BiomeType.VOLCANO;
        target.poi = null;
    }
  }

  // --- CITIES & VILLAGES ---

  private placeCapitalCity(grid: Tile[][], params: GenerationParams) {
    const coastalCandidates = this.getAllTiles(grid).filter(t => 
        t.elevation === 1 && this.isCoastal(grid, t) && t.biome !== BiomeType.MOUNTAIN && t.biome !== BiomeType.VOLCANO
    );

    if (coastalCandidates.length === 0) return;

    // Pick start
    this.capitalTile = coastalCandidates[Math.floor(this.random() * coastalCandidates.length)];
    
    // Expand based on population (1 tile per 1000 pop, max 15)
    let targetSize = Math.max(1, Math.floor(params.population / 1000)); 
    if (targetSize > 15) targetSize = 15;

    const cityTiles: Tile[] = [this.capitalTile];
    this.capitalTile.biome = BiomeType.URBAN_ZONE;
    this.capitalTile.poi = POIType.CAPITAL_CITY;

    let currentSize = 1;
    let attempts = 0;

    while (currentSize < targetSize && attempts < 200) {
        attempts++;
        const source = cityTiles[Math.floor(this.random() * cityTiles.length)];
        const neighbors = this.getNeighbors(grid, source);

        for (const n of neighbors) {
            if (n.elevation === 1 && n.biome !== BiomeType.URBAN_ZONE && n.biome !== BiomeType.VOLCANO) {
                n.biome = BiomeType.URBAN_ZONE;
                n.poi = null; // Just housing
                cityTiles.push(n);
                currentSize++;
                break;
            }
        }
    }
  }

  private placeVillages(grid: Tile[][], params: GenerationParams) {
    const villageCount = Math.floor(params.population / 5000);
    const landTiles = this.getAllTiles(grid).filter(t => 
        t.elevation === 1 && t.biome !== BiomeType.URBAN_ZONE && t.biome !== BiomeType.VOLCANO
    );

    for (let i = 0; i < villageCount; i++) {
        if (landTiles.length === 0) break;
        const index = Math.floor(this.random() * landTiles.length);
        const tile = landTiles[index];
        
        landTiles.splice(index, 1);

        // Logic updated: Use STILT_VILLAGE for water/swamp, VILLAGE for land
        if (tile.biome === BiomeType.MANGROVE || (this.isCoastal(grid, tile) && params.wealthLevel < 40)) {
            tile.poi = POIType.STILT_VILLAGE;
        } else {
            // CORRECTION ICI : On utilise le vrai type VILLAGE
            tile.poi = params.wealthLevel < 30 ? POIType.SLUM : POIType.VILLAGE; 
        }
    }
  }

  // --- WEALTH & INFRASTRUCTURE ---

  private placeInfrastructures(grid: Tile[][], params: GenerationParams) {
    const isRich = params.wealthLevel >= 70 || params.highInequality;

    if (isRich) {
        // 1. Luxury Resort (Needs Beach) - unchanged
        const beaches = this.getAllTiles(grid).filter(t => t.biome === BiomeType.BEACH && t.poi === null);
        if (beaches.length > 0) {
            const resort = beaches[Math.floor(this.random() * beaches.length)];
            resort.poi = POIType.LUXURY_RESORT;
        }

        // 2. International Airport (Modified: Must be near Capital)
        // Find flat land (elevation 1, no mountain, not already built)
        const flatLand = this.getAllTiles(grid).filter(t => 
            t.elevation === 1 && t.biome !== BiomeType.MOUNTAIN && t.poi === null
        );

        let airportCandidates: Tile[] = [];

        if (this.capitalTile) {
            // Filter candidates: Must be within distance < 6 of Capital 
            // AND not directly ON the city tiles (we want it adjacent/suburban)
            airportCandidates = flatLand.filter(t => {
                const dist = Math.sqrt((t.x - this.capitalTile!.x)**2 + (t.y - this.capitalTile!.y)**2);
                return dist < 8 && dist > 2; // Close but not ON the center
            });
        }

        // Fallback: If no space near city (unlikely), pick any flat land
        if (airportCandidates.length === 0) airportCandidates = flatLand;

        if (airportCandidates.length > 0) {
            // Pick the one closest to capital among candidates
            airportCandidates.sort((a, b) => {
                const distA = Math.sqrt((a.x - this.capitalTile!.x)**2 + (a.y - this.capitalTile!.y)**2);
                const distB = Math.sqrt((b.x - this.capitalTile!.x)**2 + (b.y - this.capitalTile!.y)**2);
                return distA - distB;
            });

            // Take the best one
            const airport = airportCandidates[0];
            airport.poi = POIType.INTL_AIRPORT;
        }
    }
  }

  // --- CRIME & SECRETS ---

  private placeIllegalActivities(grid: Tile[][], params: GenerationParams) {
    // Crime rate is high if Wealth is Low OR if HighInequality is explicitly ON
    const crimeRate = params.highInequality ? 100 : (100 - params.wealthLevel);
    const isCriminal = crimeRate > 60;

    if (isCriminal) {
        // 1. Pirate Base (Hidden Bay - Needs to be coastal but far from Capital)
        const potentialHideouts = this.getAllTiles(grid).filter(t => 
            t.elevation === 1 && this.isCoastal(grid, t) && t.poi === null
        );

        if (potentialHideouts.length > 0) {
            // Find one far from capital if possible
            let bestSpot = potentialHideouts[0];
            let maxDist = 0;

            if (this.capitalTile) {
                potentialHideouts.forEach(t => {
                    const dist = Math.sqrt((t.x - this.capitalTile!.x)**2 + (t.y - this.capitalTile!.y)**2);
                    if (dist > maxDist) {
                        maxDist = dist;
                        bestSpot = t;
                    }
                });
            } else {
                bestSpot = potentialHideouts[Math.floor(this.random() * potentialHideouts.length)];
            }
            bestSpot.poi = POIType.PIRATE_BASE;
        }

        // 2. Hidden Airstrip (Deep Jungle)
        const jungles = this.getAllTiles(grid).filter(t => t.biome === BiomeType.JUNGLE && t.poi === null);
        if (jungles.length > 0) {
            const airstrip = jungles[Math.floor(this.random() * jungles.length)];
            airstrip.poi = POIType.HIDDEN_AIRSTRIP;
        }
    }
  }

  // --- UTILS ---

  private getAllTiles(grid: Tile[][]): Tile[] {
    return grid.flat();
  }

  private isCoastal(grid: Tile[][], tile: Tile): boolean {
    const neighbors = this.getNeighbors(grid, tile);
    return neighbors.some(n => n.elevation === 0);
  }

  private getNeighbors(grid: Tile[][], tile: Tile): Tile[] {
    const list: Tile[] = [];
    if (grid[tile.y-1]) list.push(grid[tile.y-1][tile.x]);
    if (grid[tile.y+1]) list.push(grid[tile.y+1][tile.x]);
    if (grid[tile.y][tile.x-1]) list.push(grid[tile.y][tile.x-1]);
    if (grid[tile.y][tile.x+1]) list.push(grid[tile.y][tile.x+1]);
    return list;
  }
}