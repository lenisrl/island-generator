import { BiomeType, POIType } from './Biomes';

/**
 * Represents a single cell on the grid.
 */
export interface Tile {
  id: string;             // Unique ID (e.g., "x-y")
  x: number;
  y: number;
  biome: BiomeType;
  poi: POIType | null;
  elevation: number;      // 0 for water, 1 for land
  
  // --- NOUVEAUX CHAMPS LORE (Optionnels) ---
  descriptionVisual?: string; // Le ? signifie que le champ peut être vide/indéfini au début
  loreEvent?: string;         // Pareil pour le lore
  imagePaths?: string[]; // <--- CHANGEMENT ICI : tableau de chaînes ([])
}

/**
 * User-defined parameters for island generation.
 */
export interface GenerationParams {
  width: number;
  height: number;
  seed: string;           // String seed for reproducibility
  wealthLevel: number;    // 0 to 100
  highInequality: boolean; // Enables both high wealth and high crime POIs
  population: number; // Ajoute cette ligne si elle manque !
}

/**
 * The complete Island object structure for saving/loading.
 */
export interface Island {
  params: GenerationParams;
  grid: Tile[][];
  createdAt: Date;
}