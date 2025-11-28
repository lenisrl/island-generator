// src/core/models/Biomes.ts

export enum BiomeType {
  OCEAN = '🟦 OCEAN', // Emoji pour voir le résultat dans la console
  PLAGE = '🟨 PLAGE',
  MANGROVE = '🐊 MANGROVE',
  FORET_TROPICALE = '🌲 FORET',
  JUNGLE = '🌴 JUNGLE',
  RIZIERE = '🌾 RIZIERE',
  SAVANE = '🦁 SAVANE',
  DESERT_COTIER = '🏜️ DESERT',
  MONTAGNE = '⛰️ MONTAGNE',
  VOLCAN = '🌋 VOLCAN',
  ZONE_URBAINE = '🏙️ VILLE'
}

export enum POIType {
  // Richesse / Tourisme
  COMPLEXE_HOTELIER = 'HOTEL',
  PORT_PLAISANCE = 'MARINA',
  
  // Pauvreté / Crime
  BIDONVILLE = 'BIDONV.',
  BASE_PIRATE = 'PIRATES',
  AERODROME_CACHE = 'AERO_CACHE',
  
  // Nature / Autre
  VILLAGE_PILOTIS = 'PILOTIS',
  RESERVE_NATURELLE = 'RESERVE',
  AEROPORT = 'AEROPORT'
}