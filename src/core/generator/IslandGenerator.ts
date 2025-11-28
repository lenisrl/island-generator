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
    // 1. Initialize Seed
    this.seed = params.seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const grid: Tile[][] = [];
    
    // On calcule le centre exact
    const centerX = params.width / 2;
    const centerY = params.height / 2;

    // --- STEP 1: SHAPE GENERATION (Normalized Potato) ---
    for (let y = 0; y < params.height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < params.width; x++) {
        
        // --- NOUVELLE LOGIQUE ---
        // 1. On normalise les coordonnées entre -1 et 1
        // (nx, ny) = (0,0) est le centre, (1,1) est le coin bas-droite
        const nx = (x - centerX) / (params.width / 2);
        const ny = (y - centerY) / (params.height / 2);

        // 2. Calcul de la distance depuis le centre (0 à 1+)
        // Cette formule gère naturellement les rectangles (ça fait une ellipse)
        const distance = Math.sqrt(nx*nx + ny*ny);

        // 3. Calcul de l'angle pour le bruit
        const angle = Math.atan2(ny, nx);

        // 4. Bruit (Irrégularité)
        // On réduit l'amplitude du bruit pour éviter que ça ne sorte trop du cadre
        // Le bruit varie environ entre -0.1 et +0.1
        const noise = (Math.sin(angle * 3 + this.seed) + Math.cos(angle * 5 + this.seed * 0.5)) * 0.08; 
        
        // 5. Seuil de Terre (Threshold)
        // On veut que l'île aille jusqu'à ~85% du bord (0.85)
        // Si distance < 0.85 + bruit, c'est de la terre.
        // Cela laisse environ 10-15% de marge (eau) sur les bords.
        const baseSize = 0.85; 
        let isLand = distance < (baseSize + noise);

        // Sécurité absolue : Force l'eau sur les 2 dernières cases des bords
        // Comme tu l'as demandé ("2 cases d'eau minimum")
        if (x < 2 || y < 2 || x >= params.width - 2 || y >= params.height - 2) {
            isLand = false;
        }

        row.push({
          id: `${x}-${y}`,
          x, y,
          biome: BiomeType.OCEAN,
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
    
    // On augmente un peu le nombre de zones car l'île est plus grande
    const nbZones = 12; 

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
            let chosenBiome = BiomeType.RAINFOREST; 

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
        
        // On ne traite que la terre
        if (tile.elevation === 1) {
            
            // Vérifie les 4 voisins pour voir si c'est une côte
            const hasWaterNeighbor = 
                grid[y+1][x].elevation === 0 || 
                grid[y-1][x].elevation === 0 || 
                grid[y][x+1].elevation === 0 || 
                grid[y][x-1].elevation === 0;
            
            if (hasWaterNeighbor) {
                // REGLE 1 : Pas de plage sur les montagnes (Falaises)
                if (tile.biome === BiomeType.MOUNTAIN) continue;

                // REGLE 2 : Pas de plage sur les mangroves (Marécages côtiers)
                if (tile.biome === BiomeType.MANGROVE) continue;

                // REGLE 3 : Variation naturelle pour les autres biomes
                // On utilise une formule d'onde pour créer des "secteurs" de plage
                // et des secteurs "sauvages".
                // Le facteur 0.2 définit la longueur des plages (plus petit = plages plus longues)
                const beachNoise = Math.sin(x * 0.2 + this.seed) + Math.cos(y * 0.2 + this.seed);

                // Si le bruit est supérieur à un seuil, on met du sable.
                // Sinon, on laisse la végétation toucher l'eau (côte rocheuse ou sauvage).
                if (beachNoise > -0.5) { 
                    tile.biome = BiomeType.BEACH;
                }
            }
        }
      }
    }
  }
}