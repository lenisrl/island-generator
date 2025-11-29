import React, { useState, useEffect } from 'react';
import { Tile } from '../../../core/models/Island';
import './Inspector.css';

interface InspectorProps {
  tile: Tile;
  onClose: () => void;
  onSave: (updatedTile: Tile) => void;
}

export const Inspector: React.FC<InspectorProps> = ({ tile, onClose, onSave }) => {
  // État local pour les champs de texte
  // On initialise avec les valeurs existantes de la case (ou vide)
  const [descVisual, setDescVisual] = useState(tile.descriptionVisual || '');
  const [lore, setLore] = useState(tile.loreEvent || '');

  // Si la case change (ex: clic ailleurs), on met à jour les champs
  useEffect(() => {
    setDescVisual(tile.descriptionVisual || '');
    setLore(tile.loreEvent || '');
  }, [tile]);

  const handleSave = () => {
    // On crée une copie de la case avec les nouvelles infos
    const updatedTile = {
      ...tile,
      descriptionVisual: descVisual,
      loreEvent: lore
    };
    onSave(updatedTile);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation empêche de fermer si on clique DANS la fenêtre */}
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="modal-header">
          <h2>
            <span>{tile.poi ? '📍' : '🌍'}</span> 
            {tile.poi ? tile.poi.replace('_', ' ') : tile.biome} 
            <small style={{fontSize:'0.8rem', color:'#aaa', marginLeft:10}}>
               (X:{tile.x}, Y:{tile.y})
            </small>
          </h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          
          {/* Champ Description Visuelle (Toujours là) */}
          <div className="form-group">
            <label>👀 Description Visuelle</label>
            <textarea 
              value={descVisual}
              onChange={(e) => setDescVisual(e.target.value)}
              placeholder="À quoi ressemble cet endroit ? (Ex: Une plage de sable noir bordée de palmiers géants...)"
            />
          </div>

          {/* Champ Lore (Seulement si c'est un POI ou une Ville) */}
          {tile.poi && (
            <div className="form-group">
              <label>📜 Lore & Événements (Secret)</label>
              <textarea 
                value={lore}
                onChange={(e) => setLore(e.target.value)}
                placeholder="Que s'y passe-t-il ? Qui dirige cet endroit ?"
                style={{borderColor: '#ffd70044'}} // Petit bord doré pour le lore
              />
            </div>
          )}

          {/* Zone Images (Placeholder pour l'instant) */}
          <div className="form-group">
            <label>📷 Galerie</label>
            <div style={{border:'2px dashed #444', padding: 20, textAlign:'center', color:'#666', borderRadius:4}}>
              (Module d'import d'images à venir dans la prochaine version)
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button onClick={onClose} style={{background:'none', border:'none', color:'#aaa', cursor:'pointer'}}>Annuler</button>
          <button className="save-btn" onClick={handleSave}>Sauvegarder</button>
        </div>

      </div>
    </div>
  );
};