// src/core/generator/IslandGenerator.ts
import { BiomeType, POIType } from '../models/Biomes';
import { Tile, GenerationParams } from '../models/Interfaces';

export class IslandGenerator {
  
  private seed: number = 0;

  // Petit générateur aléatoire maison (plus stable)
  private random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Retourne un entier entre min et max
  private randomRange(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  public generate(params: GenerationParams): Tile[][] {
    // 1. Init Seed
    this.seed = params.seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const grid: Tile[][] = [];
    const centerX = Math.floor(params.width / 2);
    const centerY = Math.floor(params.height / 2);
    
    // Rayon de base (plus petit pour laisser de la marge à l'eau)
    const baseRadius = Math.min(centerX, centerY) * 0.7; 

    // --- ETAPE 1 : FORME DE L'ILE (La Patate Lisse) ---
    for (let y = 0; y < params.height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < params.width; x++) {
        
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Astuce : On modifie le rayon en fonction de l'angle pour faire une patate
        // et non un cercle parfait, mais de façon "lisse" (sinus)
        const angle = Math.atan2(dy, dx);
        const irregularity = Math.sin(angle * 3 + this.seed) * 2 // 3 lobes principaux
                           + Math.cos(angle * 5) * 1.5;          // détails
        
        // Si la distance est inférieure au rayon modulé -> TERRE
        const threshold = baseRadius + irregularity;
        let isLand = distance < threshold;

        // Force l'océan sur les bords extrêmes
        if (x < 2 || y < 2 || x > params.width - 3 || y > params.height - 3) isLand = false;

        row.push({
          x, y,
          biome: BiomeType.OCEAN, // Par défaut
          poi: null,
          elevation: isLand ? 1 : 0
        });
      }
      grid.push(row);
    }

    // --- ETAPE 2 : BIOMES (Voronoï / Zones) ---
    // On ne lance ça que s'il y a de la terre
    this.applyBiomesVoronoi(grid, params);

    // --- ETAPE 3 : PLAGES ---
    this.applyBeaches(grid, params);

    return grid;
  }

  private applyBiomesVoronoi(grid: Tile[][], params: GenerationParams) {
    // 1. On définit des "Points de Germe" (Seeds) un peu partout sur l'île
    const biomeSeeds: {x: number, y: number, type: BiomeType}[] = [];
    const nbZones = 8; // Nombre de régions distinctes

    // Liste des biomes possibles (pondérée ou simple)
    const availableBiomes = [
        BiomeType.JUNGLE, BiomeType.JUNGLE, // Plus de chance d'avoir Jungle
        BiomeType.FORET_TROPICALE,
        BiomeType.SAVANE,
        BiomeType.MONTAGNE,
        BiomeType.DESERT_COTIER
    ];

    for(let i=0; i < nbZones; i++) {
        // On cherche un point au hasard qui est SUR LA TERRE
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

    // 2. Pour chaque case de TERRE, on cherche le germe le plus proche
    for (let y = 0; y < params.height; y++) {
      for (let x = 0; x < params.width; x++) {
        if (grid[y][x].elevation === 1) { // Si c'est terre
            let minDist = Infinity;
            let chosenBiome = BiomeType.FORET_TROPICALE; // Fallback

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
            // Regarde les 4 voisins (Nord, Sud, Est, Ouest)
            const hasWaterNeighbor = 
                grid[y+1][x].elevation === 0 || 
                grid[y-1][x].elevation === 0 || 
                grid[y][x+1].elevation === 0 || 
                grid[y][x-1].elevation === 0;
            
            // La plage remplace le biome précédent sur les bords
            if (hasWaterNeighbor) {
                tile.biome = BiomeType.PLAGE;
            }
        }
      }
    }
  }
}