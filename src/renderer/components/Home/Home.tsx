import React from 'react';

interface HomeProps {
  onNewIsland: () => void;
  onLoadIsland: () => void; // Pour plus tard
}

export const Home: React.FC<HomeProps> = ({ onNewIsland, onLoadIsland }) => {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', backgroundColor: '#1a1a1a', color: 'white', gap: 20
    }}>
      <h1 style={{ fontSize: '3rem', margin: 0 }}>🏝️ Island Generator</h1>
      <p style={{ color: '#888' }}>Outil de World Building & Lore</p>
      
      <div style={{ display: 'flex', gap: 20, marginTop: 40 }}>
        <button 
          onClick={onNewIsland}
          style={{
            padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer',
            backgroundColor: '#2b65ec', color: 'white', border: 'none', borderRadius: 8
          }}
        >
          ✨ Nouvelle Île
        </button>
        
        <button 
          onClick={onLoadIsland}
          disabled={true} // Désactivé pour l'instant
          style={{
            padding: '15px 30px', fontSize: '1.2rem', cursor: 'not-allowed',
            backgroundColor: '#333', color: '#666', border: 'none', borderRadius: 8
          }}
        >
          📂 Charger (Bientôt)
        </button>
      </div>
    </div>
  );
};