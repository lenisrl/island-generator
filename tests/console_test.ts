import { IslandGenerator } from '../src/core/generator/IslandGenerator';
import { GenerationParams } from '../src/core/models/Island';
import { BiomeType, POIType } from '../src/core/models/Biomes';

// Test Configuration
const params: GenerationParams = {
    width: 60, // Un peu plus large
    height: 30,
    seed: "NARCO_TEST_01", 
    wealthLevel: 80, // Riche
    highInequality: true, // MAIS criminel aussi !
    population: 25000 // Beaucoup de villages
};

// ANSI Colors for Terminal Output
const COLORS: Record<string, string> = {
    // BIOMES
    [BiomeType.OCEAN]: '\x1b[44m  \x1b[0m',           
    [BiomeType.BEACH]: '\x1b[43m  \x1b[0m',           
    [BiomeType.JUNGLE]: '\x1b[48;5;22m  \x1b[0m',     
    [BiomeType.SAVANNA]: '\x1b[48;5;185m  \x1b[0m',   
    [BiomeType.COASTAL_DESERT]: '\x1b[48;5;214m  \x1b[0m', 
    [BiomeType.MOUNTAIN]: '\x1b[47m  \x1b[0m',        
    [BiomeType.MANGROVE]: '\x1b[48;5;29m  \x1b[0m',
    [BiomeType.VOLCANO]: '\x1b[41m  \x1b[0m',
    [BiomeType.URBAN_ZONE]: '\x1b[47;100m  \x1b[0m', // Ville (Gris)

    // POIS (On affiche un caractère ou une couleur spéciale)
    // Note: Dans le terminal, difficile de superposer, on change la couleur de fond
    [POIType.CAPITAL_CITY]: '\x1b[47;100mC \x1b[0m', // C pour Capitale
    [POIType.STILT_VILLAGE]: '\x1b[48;5;29mV \x1b[0m', // V sur fond Mangrove
    [POIType.SLUM]: '\x1b[48;5;94mS \x1b[0m', // S marron
    [POIType.VILLAGE]: '\x1b[47;100mV \x1b[0m', // V Gris clair (Comme avant, mais avec le bon nom)
    [POIType.LUXURY_RESORT]: '\x1b[43m$ \x1b[0m', // $ sur fond Jaune (Plage)
    [POIType.INTL_AIRPORT]: '\x1b[47;100mA \x1b[0m', // A (Airport)
    [POIType.PIRATE_BASE]: '\x1b[41mX \x1b[0m', // X Rouge (Pirate)
    [POIType.HIDDEN_AIRSTRIP]: '\x1b[48;5;22m= \x1b[0m',
    [POIType.FISHING_DOCK]: '\x1b[47;100mV \x1b[0m', // V Gris clair (Village Standard)

    'DEFAULT': '\x1b[45m  \x1b[0m'
};

const generator = new IslandGenerator();
console.log(`\n🏝️  Generating Island (Seed: ${params.seed}) ...\n`);

const grid = generator.generate(params);

// Render loop
grid.forEach(row => {
    const line = row.map(t => {
        if (t.poi) {
            // Si c'est un POI, on affiche sa couleur spécifique
            return COLORS[t.poi] || COLORS['DEFAULT'];
        }
        // Sinon on affiche le biome
        return COLORS[t.biome] || COLORS['DEFAULT'];
    }).join('');
    console.log(line);
});

console.log("\n✅ Generation Complete. System is operational.");