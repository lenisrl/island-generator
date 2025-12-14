import React, { useEffect, useState } from 'react';
import './LoadMenu.css';

interface LoadMenuProps {
  onBack: () => void;
  onLoad: (filename: string) => void;
}

export const LoadMenu: React.FC<LoadMenuProps> = ({ onBack, onLoad }) => {
  const [saves, setSaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Au chargement du composant, on demande la liste à Electron
  useEffect(() => {
    const fetchSaves = async () => {
      const result = await window.electronAPI.getSavedIslands();
      if (result.success && result.saves) {
        setSaves(result.saves);
      }
      setLoading(false);
    };
    fetchSaves();
  }, []);

  return (
    <div className="load-container">
      <div style={{width: 500, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
          <button onClick={onBack} style={{background:'none', border:'none', color:'#aaa', cursor:'pointer', fontSize:'1.2rem'}}>← Retour</button>
          <h2 style={{margin:0}}>Charger une Île</h2>
      </div>

      <div className="save-list">
        {loading && <div style={{padding:20, textAlign:'center'}}>Chargement...</div>}
        
        {!loading && saves.length === 0 && (
            <div style={{padding:20, textAlign:'center', color:'#666'}}>Aucune sauvegarde trouvée.</div>
        )}

        {saves.map((save) => (
          <div key={save.filename} className="save-item" onClick={() => onLoad(save.filename)}>
            <div className="save-info">
              <h3>🏝️ {save.seed}</h3>
              <p>{new Date(save.date).toLocaleString()} — {save.population.toLocaleString()} hab.</p>
            </div>
            <div style={{fontSize:'1.5rem'}}>👉</div>
          </div>
        ))}
      </div>
    </div>
  );
};