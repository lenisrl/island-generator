import React, { useEffect, useState } from 'react';
import { IslandGenerator } from '../core/generator/IslandGenerator';
import { GenerationParams, Tile } from '../core/models/Island';
import { Grid } from './components/Grid';
import { Inspector } from './components/Inspector/Inspector';
import { CreationMenu } from './components/CreationMenu/CreationMenu';
import { Home } from './components/Home/Home';

// Définition des écrans possibles
type ViewState = 'HOME' | 'CREATION' | 'MAP';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  
  const [grid, setGrid] = useState<Tile[][] | null>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [params, setParams] = useState<GenerationParams>({
    width: 60, height: 40, seed: "NEW_WORLD", wealthLevel: 50, highInequality: false, population: 15000
  });

  // Lance la génération seulement quand on arrive sur la vue MAP
  useEffect(() => {
    if (view === 'MAP') {
      const generator = new IslandGenerator();
      setGrid(generator.generate(params));
    }
  }, [view, params]);

  const handleUpdateTile = (updatedTile: Tile) => {
    if (!grid) return;
    const newGrid = [...grid];
    newGrid[updatedTile.y][updatedTile.x] = updatedTile;
    setGrid(newGrid);
  };

  // --- RENDER ---

  // 1. ÉCRAN D'ACCUEIL
  if (view === 'HOME') {
    return <Home onNewIsland={() => setView('CREATION')} onLoadIsland={() => alert('Bientôt !')} />;
  }

  // 2. ÉCRAN DE PARAMÉTRAGE
  if (view === 'CREATION') {
    return (
      <CreationMenu 
        currentParams={params}
        onBack={() => setView('HOME')}
        onGenerate={(newParams) => {
          setParams(newParams);
          setView('MAP'); // C'est ici qu'on bascule vers la carte
        }}
      />
    );
  }

  // 3. ÉCRAN DE LA CARTE (Plein écran)
  return (
    <div style={{ height: '100vh', backgroundColor: '#1a1a1a', position: 'relative' }}>
      
      {/* Bouton Flottant pour revenir au menu */}
      <button 
        onClick={() => {
            if(confirm("Quitter la carte ? (La sauvegarde n'est pas encore implémentée)")) {
                setView('HOME');
            }
        }}
        style={{
            position: 'fixed', top: 20, left: 20, zIndex: 50,
            background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid #555',
            padding: '8px 12px', borderRadius: 4, cursor: 'pointer'
        }}
      >
        ⬅ Menu
      </button>

      {/* Info bulle discrète */}
      <div style={{ position: 'fixed', top: 20, right: 20, color: 'white', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: 4, pointerEvents:'none' }}>
        {params.seed}
      </div>

      {grid ? (
        <Grid 
          grid={grid} 
          width={params.width} 
          height={params.height} 
          onTileClick={setSelectedTile} 
        />
      ) : (
        <div style={{color:'white', padding:50}}>Génération...</div>
      )}

      {selectedTile && (
        <Inspector 
          tile={selectedTile}
          onClose={() => setSelectedTile(null)} 
          onSave={handleUpdateTile}
        />
      )}
    </div>
  );
};

export default App;