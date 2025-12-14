// src/renderer/App.tsx
import React, { useEffect, useState } from 'react';
import { IslandGenerator } from '../core/generator/IslandGenerator';
import { GenerationParams, Tile } from '../core/models/Island';
import { Grid } from './components/Grid';
import { Inspector } from './components/Inspector/Inspector';
import { CreationMenu } from './components/CreationMenu/CreationMenu';
import { Home } from './components/Home/Home';
import { LoadMenu } from './components/LoadMenu/LoadMenu';

// Définition des écrans possibles
type ViewState = 'HOME' | 'CREATION' | 'MAP' | 'LOAD';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  
  const [grid, setGrid] = useState<Tile[][] | null>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  
  // Paramètres par défaut
  const [params, setParams] = useState<GenerationParams>({
    width: 60, height: 40, seed: "NEW_WORLD", wealthLevel: 50, highInequality: false, population: 15000
  });

  // --- LOGIQUE SAUVEGARDE & CHARGEMENT ---

  const handleSaveIsland = async () => {
    if (!grid) return;
    const islandData = {
      params: params,
      grid: grid,
      saveDate: new Date().toISOString()
    };

    const result = await window.electronAPI.saveIsland(islandData);
    if (result.success) {
      alert(`Île sauvegardée !`);
    } else {
      alert('Erreur sauvegarde.');
    }
  };

  const handleLoadIsland = async (filename: string) => {
    const result = await window.electronAPI.loadIsland(filename);
    if (result.success && result.data) {
      setParams(result.data.params);
      setGrid(result.data.grid);
      setView('MAP');
    }
  };

  // --- LOGIQUE MISE A JOUR TUILE (C'est celle qui manquait !) ---
  const handleUpdateTile = (updatedTile: Tile) => {
    if (!grid) return;
    
    // 1. Copie de la grille
    const newGrid = [...grid];
    // 2. Copie de la ligne spécifique (Fix React pour détecter le changement)
    newGrid[updatedTile.y] = [...newGrid[updatedTile.y]];
    // 3. Mise à jour de la case
    newGrid[updatedTile.y][updatedTile.x] = updatedTile;
    
    setGrid(newGrid);
    console.log("Tile updated:", updatedTile);
  };

  // --- RENDU ---

  // GENERATION
  useEffect(() => {
    // On génère seulement si on est sur la carte ET que la grille est vide
    // (pour ne pas écraser un chargement)
    if (view === 'MAP' && !grid) { 
      const generator = new IslandGenerator();
      setGrid(generator.generate(params));
    }
  }, [view, params, grid]);


  // 1. HOME
  if (view === 'HOME') {
    return <Home 
        onNewIsland={() => { setGrid(null); setView('CREATION'); }} 
        onLoadIsland={() => setView('LOAD')} 
    />;
  }

  // 2. LOAD MENU
  if (view === 'LOAD') {
    return <LoadMenu 
        onBack={() => setView('HOME')}
        onLoad={handleLoadIsland}
    />;
  }

  // 3. CREATION
  if (view === 'CREATION') {
    return (
      <CreationMenu 
        currentParams={params}
        onBack={() => setView('HOME')}
        onGenerate={(newParams) => {
          setParams(newParams);
          setGrid(null);
          setView('MAP');
        }}
      />
    );
  }

  // 4. MAP
  return (
    <div style={{ height: '100vh', backgroundColor: '#1a1a1a', position: 'relative' }}>
      
      {/* Barre d'outils */}
      <div style={{
            position: 'fixed', top: 20, left: 20, zIndex: 50, display: 'flex', gap: 10
      }}>
          <button 
            onClick={() => { if(confirm("Retour au menu ?")) setView('HOME'); }}
            style={{
                background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid #555',
                padding: '8px 12px', borderRadius: 4, cursor: 'pointer'
            }}
          >
            ⬅ Menu
          </button>

          <button 
            onClick={handleSaveIsland}
            style={{
                background: '#2b65ec', color: 'white', border: 'none',
                padding: '8px 12px', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            💾 Sauvegarder
          </button>
      </div>

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
        <div style={{color:'white', padding:50}}>Chargement...</div>
      )}

      {selectedTile && (
        <Inspector 
          tile={selectedTile}
          currentSeed={params.seed} // Important pour le dossier images
          onClose={() => setSelectedTile(null)} 
          onSave={handleUpdateTile} // C'est ici qu'on connecte la fonction !
        />
      )}
    </div>
  );
};

export default App;