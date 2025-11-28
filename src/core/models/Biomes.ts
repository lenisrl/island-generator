/**
 * Enum representing the different types of terrains available on the island.
 * Used for visual rendering and generation logic.
 */
export enum BiomeType {
  OCEAN = 'OCEAN',
  BEACH = 'BEACH',
  MANGROVE = 'MANGROVE',
  RAINFOREST = 'RAINFOREST',
  JUNGLE = 'JUNGLE',
  RICE_FIELD = 'RICE_FIELD',
  SAVANNA = 'SAVANNA',
  COASTAL_DESERT = 'COASTAL_DESERT',
  MOUNTAIN = 'MOUNTAIN',
  VOLCANO = 'VOLCANO',
  URBAN_ZONE = 'URBAN_ZONE'
}

/**
 * Points of Interest (POI) types.
 * These are special features placed on top of biomes.
 */
export enum POIType {
  // Wealth / Tourism
  LUXURY_RESORT = 'LUXURY_RESORT',
  MARINA = 'MARINA',
  
  // Poverty / Crime
  SLUM = 'SLUM',
  PIRATE_BASE = 'PIRATE_BASE',
  HIDDEN_AIRSTRIP = 'HIDDEN_AIRSTRIP',
  
  // Nature / Infrastructure / Others
  STILT_VILLAGE = 'STILT_VILLAGE',
  NATURE_RESERVE = 'NATURE_RESERVE',
  INTL_AIRPORT = 'INTL_AIRPORT',
  FISHING_DOCK = 'FISHING_DOCK',
  ANCIENT_RUINS = 'ANCIENT_RUINS'
}