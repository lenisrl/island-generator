import { IslandGenerator } from '../src/core/generator/IslandGenerator';
import { GenerationParams } from '../src/core/models/Island';
import { BiomeType } from '../src/core/models/Biomes';

// Test Configuration
const params: GenerationParams = {
    width: 50, 
    height: 30,
    seed: "ENGLISH_VERSION_V1", 
    wealthLevel: 50,
    highInequality: false
};

// ANSI Colors for Terminal Output
const COLORS: Record<string, string> = {
    [BiomeType.OCEAN]: '\x1b[44m  \x1b[0m',           // Blue
    [BiomeType.BEACH]: '\x1b[43m  \x1b[0m',           // Yellow
    [BiomeType.RAINFOREST]: '\x1b[42m  \x1b[0m',      // Green
    [BiomeType.JUNGLE]: '\x1b[48;5;22m  \x1b[0m',     // Dark Green
    [BiomeType.SAVANNA]: '\x1b[48;5;185m  \x1b[0m',   // Khaki
    [BiomeType.COASTAL_DESERT]: '\x1b[48;5;214m  \x1b[0m', // Orange
    [BiomeType.MOUNTAIN]: '\x1b[47m  \x1b[0m',        // White/Grey
    [BiomeType.MANGROVE]: '\x1b[48;5;29m  \x1b[0m',   // Teal
    [BiomeType.VOLCANO]: '\x1b[41m  \x1b[0m',        // Red
    [BiomeType.URBAN_ZONE]: '\x1b[47;100m  \x1b[0m', // Dark Grey (City)
    'DEFAULT': '\x1b[45m  \x1b[0m'                    // Magenta (Error)
};

const generator = new IslandGenerator();
console.log(`\n🏝️  Generating Island (Seed: ${params.seed}) ...\n`);

const grid = generator.generate(params);

// Render loop
grid.forEach(row => {
    const line = row.map(t => {
        return COLORS[t.biome] || COLORS['DEFAULT'];
    }).join('');
    console.log(line);
});

console.log("\n✅ Generation Complete. System is operational.");