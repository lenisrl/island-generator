// src/renderer/App.tsx
import React, { useEffect, useState } from 'react';
import { IslandGenerator } from '../core/generator/IslandGenerator';
import { GenerationParams, Tile } from '../core/models/Island';
import { Grid } from './components/Grid';
import { Inspector } from './components/Inspector/Inspector';

const App: React.FC = () => {
  const [grid, setGrid] = useState<Tile[][] | null>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  
  // Paramètres par défaut (tu pourras les changer via un menu plus tard)
  const [params] = useState<GenerationParams>({
    width: 50,
    height: 35,
    seed: "MY_FIRST_GUI_ISLAND", // Change le texte pour changer l'île !
    wealthLevel: 50,
    highInequality: false,
    population: 15000
  });

  useEffect(() => {
    console.log("Génération de l'île en cours...");
    const generator = new IslandGenerator();
    const newGrid = generator.generate(params);
    setGrid(newGrid);
  }, [params]);

  // Fonction appelée quand l'utilisateur clique sur "Sauvegarder" dans l'inspecteur
  const handleUpdateTile = (updatedTile: Tile) => {
    if (!grid) return;

    // On doit créer une nouvelle copie de la grille pour que React détecte le changement
    const newGrid = [...grid]; 
    // On remplace la case modifiée à la bonne position [y][x]
    newGrid[updatedTile.y][updatedTile.x] = updatedTile;
    
    setGrid(newGrid);
    console.log("Tile updated:", updatedTile);
  };

  if (!grid) return <div style={{color:'white', padding: 20}}>Loading Map...</div>;

  return (
    <div>
      {/* UI Flottante pour le titre (temporaire) */}
      <div style={{
        position: 'fixed', top: 20, left: 20, 
        background: 'rgba(0,0,0,0.7)', color: 'white', 
        padding: '10px 20px', borderRadius: '8px',
        pointerEvents: 'none' // Laisse passer les clics au travers
      }}>
        <h2 style={{margin: 0}}>🏝️ {params.seed}</h2>
        <small>Pop: {params.population} | Wealth: {params.wealthLevel}%</small>
      </div>

      {/* La Carte */}
      <Grid 
        grid={grid} 
        width={params.width} 
        height={params.height} 
        onTileClick={(tile) => setSelectedTile(tile)}
      />

      {/* L'Inspecteur (visible seulement si une case est sélectionnée) */}
      {selectedTile && (
        <Inspector 
          tile={selectedTile}
          onClose={() => setSelectedTile(null)} // Fermer = vider la sélection
          onSave={handleUpdateTile}
        />
      )}
    </div>
  );
};

export default App;