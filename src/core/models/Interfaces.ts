// src/core/models/Interfaces.ts
import { BiomeType, POIType } from './Biomes';

export interface Tile {
  x: number;
  y: number;
  biome: BiomeType;
  poi: POIType | null;
  elevation: number; // 0 = eau, 1 = terre
}

export interface GenerationParams {
  width: number;
  height: number;
  seed: string;
  wealthLevel: number; // 0-100
  highInequality: boolean; // "Disparités extrêmes"
}