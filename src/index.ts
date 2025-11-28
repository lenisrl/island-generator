// src/index.ts
import { IslandGenerator } from './core/generator/IslandGenerator';
import { GenerationParams } from './core/models/Interfaces';
import { BiomeType } from './core/models/Biomes';

const params: GenerationParams = {
    width: 40, 
    height: 30,
    seed: "LORE_ISLAND_V2", 
    wealthLevel: 50,
    highInequality: false
};

// --- MAPPING COULEURS ANSI (Pour le terminal) ---
// \x1b[48;5;Nm est le code couleur de fond (Background)
// \x1b[0m reset la couleur
const COLORS: Record<string, string> = {
    [BiomeType.OCEAN]: '\x1b[44m  \x1b[0m',           // Bleu
    [BiomeType.PLAGE]: '\x1b[43m  \x1b[0m',           // Jaune
    [BiomeType.FORET_TROPICALE]: '\x1b[42m  \x1b[0m', // Vert
    [BiomeType.JUNGLE]: '\x1b[48;5;22m  \x1b[0m',     // Vert foncé
    [BiomeType.SAVANE]: '\x1b[48;5;185m  \x1b[0m',    // Jaune pâle/Kaki
    [BiomeType.DESERT_COTIER]: '\x1b[48;5;214m  \x1b[0m', // Orange
    [BiomeType.MONTAGNE]: '\x1b[47m  \x1b[0m',        // Gris/Blanc
    [BiomeType.MANGROVE]: '\x1b[48;5;29m  \x1b[0m',   // Vert canard
    // Fallback
    'DEFAULT': '\x1b[45m  \x1b[0m'
};

const generator = new IslandGenerator();
console.log(`\n🏝️  Génération de l'île (Seed: ${params.seed}) ...\n`);

const grid = generator.generate(params);

// Rendu ligne par ligne
grid.forEach(row => {
    const line = row.map(t => {
        // On récupère la couleur associée au biome, ou DEFAULT si inconnu
        return COLORS[t.biome] || COLORS['DEFAULT'];
    }).join(''); // On colle les blocs sans espace
    console.log(line);
});

console.log("\n✅ Carte générée. (Bleu=Eau, Jaune=Plage, Verts=Végétation, Blanc=Montagne)");