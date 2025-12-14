import React, { useState, useEffect } from 'react';
import { Tile } from '../../../core/models/Island';
import './Inspector.css';

interface InspectorProps {
  tile: Tile;
  currentSeed: string; // NOUVEAU : On a besoin du seed pour savoir où enregistrer
  onClose: () => void;
  onSave: (updatedTile: Tile) => void;
}

export const Inspector: React.FC<InspectorProps> = ({ tile, currentSeed, onClose, onSave }) => {
  const [descVisual, setDescVisual] = useState(tile.descriptionVisual || '');
  const [lore, setLore] = useState(tile.loreEvent || '');
  // État pour la liste des images (tableau de chaînes)
  const [images, setImages] = useState<string[]>(tile.imagePaths || []);
  
  // État pour la Lightbox (contient le chemin de l'image à afficher en grand, ou null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // État pour le chemin de base sur le disque (pour l'affichage)
  const [basePath, setBasePath] = useState<string>('');

  useEffect(() => {
    setDescVisual(tile.descriptionVisual || '');
    setLore(tile.loreEvent || '');
    setImages(tile.imagePaths || []); // Charge les images existantes

    window.electronAPI.getUserDataPath().then(path => {
        // CORRECTION : On remplace les \ par des / pour Windows
        const cleanPath = path.replace(/\\/g, '/');
        // On ajoute file:/// (3 slashs) pour être sûr
        setBasePath(`file:///${cleanPath}`);
    });
  }, [tile]);

  const handleSave = () => {
    const updatedTile = {
      ...tile,
      descriptionVisual: descVisual,
      loreEvent: lore,
      imagePaths: images // On sauvegarde le tableau d'images
    };
    onSave(updatedTile);
    onClose();
  };

  const handleAddImage = async () => {
      // On appelle le processus principal pour importer
      const result = await window.electronAPI.importImage(currentSeed);
      if (result.success && result.path) {
          // On ajoute le nouveau chemin relatif à la liste
          setImages(prev => [...prev, result.path!]);
      }
  };

  // Fonction utilitaire pour construire le chemin d'affichage complet
  const getFullImagePath = (relativePath: string) => {
      // relativePath est déjà propre ("images/SEED/img.jpg")
      return `${basePath}/${relativePath}`;
  };

  return (
    <>
    {/* MODALE INSPECTEUR */}
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>
            <span>{tile.poi ? '📍' : '🌍'}</span> 
            {tile.poi ? tile.poi.replace('_', ' ') : tile.biome} 
          </h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          
          <div className="form-group">
            <label>👀 Description Visuelle</label>
            <textarea value={descVisual} onChange={(e) => setDescVisual(e.target.value)} placeholder="..." />
          </div>

          {tile.poi && (
            <div className="form-group">
              <label>📜 Lore & Événements (Secret)</label>
              <textarea value={lore} onChange={(e) => setLore(e.target.value)} placeholder="..." style={{borderColor: '#ffd70044'}} />
            </div>
          )}

          {/* GALERIE D'IMAGES */}
          <div className="form-group">
            <label>📷 Galerie ({images.length})</label>
            
            <div className="gallery-container">
                {/* Miniatures existantes */}
                {images.map((imgRelativePath, index) => (
                    <div key={index} className="thumbnail-wrapper" onClick={() => setLightboxImage(imgRelativePath)}>
                        {basePath && <img src={getFullImagePath(imgRelativePath)} alt="thumbnail" className="thumbnail" />}
                    </div>
                ))}

                {/* Bouton Ajouter */}
                <button className="add-image-btn" onClick={handleAddImage} title="Ajouter une image">
                    +
                </button>
            </div>

          </div>

        </div>

        <div className="modal-footer">
          <button onClick={onClose} style={{background:'none', border:'none', color:'#aaa', cursor:'pointer'}}>Annuler</button>
          {/* On change le texte ici pour éviter la confusion */}
          <button className="save-btn" onClick={handleSave}>Valider</button>
        </div>

      </div>
    </div>

    {/* LIGHTBOX (Si une image est sélectionnée) */}
    {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
            <button className="lightbox-close">&times;</button>
            <img src={getFullImagePath(lightboxImage)} alt="Full screen" className="lightbox-image" onClick={e => e.stopPropagation()} />
        </div>
    )}
    </>
  );
};