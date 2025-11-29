// src/renderer/components/Grid.tsx
import React from 'react';
import { Tile } from '../../core/models/Island';
import { BiomeType, POIType } from '../../core/models/Biomes';
import './Grid.css';

// --- COULEURS DES BIOMES ---
const BIOME_COLORS: Record<string, string> = {
  [BiomeType.OCEAN]: '#2b65ec',        // Bleu Roi
  [BiomeType.BEACH]: '#fdd023',        // Jaune Sable
  [BiomeType.MANGROVE]: '#2e8b57',     // Vert Marin
  [BiomeType.JUNGLE]: '#006400',       // Vert Foncé
  [BiomeType.SAVANNA]: '#f0e68c',      // Khaki
  [BiomeType.COASTAL_DESERT]: '#edc9af', // Sable Beige
  [BiomeType.MOUNTAIN]: '#808080',     // Gris
  [BiomeType.VOLCANO]: '#8b0000',      // Rouge Sombre
  [BiomeType.URBAN_ZONE]: '#708090',   // Gris Ardoise
};

// --- ICONES DES POI ---
const POI_MARKERS: Record<string, string> = {
  [POIType.CAPITAL_CITY]: '⭐',
  [POIType.VILLAGE]: '🏠',
  [POIType.STILT_VILLAGE]: '🛖',
  [POIType.SLUM]: '🏚️',
  [POIType.LUXURY_RESORT]: '🏨',
  [POIType.INTL_AIRPORT]: '✈️',
  [POIType.PIRATE_BASE]: '☠️',
  [POIType.HIDDEN_AIRSTRIP]: '🛩️',
  [POIType.ANCIENT_RUINS]: '🏛️',
  [POIType.FISHING_DOCK]: '⚓',
};

interface GridProps {
  grid: Tile[][];
  width: number;
  height: number;
  onTileClick: (tile: Tile) => void;
}

export const Grid: React.FC<GridProps> = ({ grid, width, height, onTileClick}) => {
  
  // Configuration CSS Grid dynamique selon la taille de l'île
  const gridStyle = {
    gridTemplateColumns: `repeat(${width}, 20px)`,
    gridTemplateRows: `repeat(${height}, 20px)`,
  };

  return (
    <div className="map-container">
      <div className="grid" style={gridStyle}>
        {grid.map((row) =>
          row.map((tile) => {
            
            // 1. Couleur de fond (Biome)
            const backgroundColor = BIOME_COLORS[tile.biome] || '#ff00ff'; // Rose si erreur
            
            // 2. Icône (POI)
            const icon = tile.poi ? POI_MARKERS[tile.poi] : null;

            return (
              <div
                key={tile.id}
                className="tile"
                style={{ backgroundColor }}
                title={`Biome: ${tile.biome} ${tile.poi ? '| POI: ' + tile.poi : ''}`}
                onClick={() => onTileClick(tile)}
              >
                {icon}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};