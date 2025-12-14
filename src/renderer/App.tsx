import React, { useEffect, useState } from 'react';
import { IslandGenerator } from '../core/generator/IslandGenerator';
import { GenerationParams, Tile } from '../core/models/Island';
import { Grid } from './components/Grid';
import { Inspector } from './components/Inspector/Inspector';
import { CreationMenu } from './components/CreationMenu/CreationMenu';
import { Home } from './components/Home/Home';
import { LoadMenu } from './components/LoadMenu/LoadMenu'; // Import

type ViewState = 'HOME' | 'CREATION' | 'MAP' | 'LOAD'; // Ajout de LOAD

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  
  const [grid, setGrid] = useState<Tile[][] | null>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [params, setParams] = useState<GenerationParams>({
    width: 60, height: 40, seed: "NEW_WORLD", wealthLevel: 50, highInequality: false, population: 15000
  });

  // --- LOGIQUE SAUVEGARDE & CHARGEMENT ---

  // NOUVEAU SAVE (Automatique)
  const handleSaveIsland = async () => {
    if (!grid) return;
    const islandData = {
      params: params,
      grid: grid,
      saveDate: new Date().toISOString()
    };

    const result = await window.electronAPI.saveIsland(islandData);
    if (result.success) {
      alert(`Île sauvegardée !`); // Simple alerte pour l'instant
    } else {
      alert('Erreur sauvegarde.');
    }
  };

  // NOUVEAU LOAD (Prend un nom de fichier)
  const handleLoadIsland = async (filename: string) => {
    const result = await window.electronAPI.loadIsland(filename);
    if (result.success && result.data) {
      setParams(result.data.params);
      setGrid(result.data.grid);
      setView('MAP');
    }
  };

  // --- RENDU ---

  // GENERATION (Seulement si on vient de Creation, pas si on a chargé un fichier)
  useEffect(() => {
    if (view === 'MAP' && !grid) { 
      // !grid est important : si on a chargé une île, grid n'est pas null, donc on ne régénère pas !
      const generator = new IslandGenerator();
      setGrid(generator.generate(params));
    }
  }, [view, params, grid]);


  // 1. HOME
  if (view === 'HOME') {
    return <Home 
        onNewIsland={() => { setGrid(null); setView('CREATION'); }} 
        onLoadIsland={() => setView('LOAD')} // Va vers le menu LOAD
    />;
  }

  // 2. LOAD MENU (Nouveau)
  if (view === 'LOAD') {
    return <LoadMenu 
        onBack={() => setView('HOME')}
        onLoad={handleLoadIsland}
    />;
  }

  // 2. CREATION
  if (view === 'CREATION') {
    return (
      <CreationMenu 
        currentParams={params}
        onBack={() => setView('HOME')}
        onGenerate={(newParams) => {
          setParams(newParams);
          setGrid(null); // On s'assure que la grille est vide pour déclencher le useEffect
          setView('MAP');
        }}
      />
    );
  }

  // 3. MAP
  return (
    <div style={{ height: '100vh', backgroundColor: '#1a1a1a', position: 'relative' }}>
      
      {/* Barre d'outils flottante */}
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
          onClose={() => setSelectedTile(null)} 
          onSave={handleSaveIsland} // Attention j'avais appelé ça onSave avant, vérifie le nom de la prop dans ton App.tsx précédent ou ici
        />
      )}
    </div>
  );
};

export default App;