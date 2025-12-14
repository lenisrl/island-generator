// src/renderer/components/CreationMenu/CreationMenu.tsx
import React, { useState } from 'react';
import { GenerationParams } from '../../../core/models/Island';
import './CreationMenu.css';

interface CreationMenuProps {
  currentParams: GenerationParams;
  onGenerate: (newParams: GenerationParams) => void;
  onBack: () => void;
}

export const CreationMenu: React.FC<CreationMenuProps> = ({ currentParams, onGenerate, onBack }) => {
  const [localParams, setLocalParams] = useState<GenerationParams>(currentParams);

  const handleChange = (field: keyof GenerationParams, value: any) => {
    setLocalParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="creation-container">
      <div className="creation-card">
        {/* En-tête avec bouton retour */}
        <div style={{display:'flex', alignItems:'center', marginBottom: 20}}>
            <button className="back-btn" onClick={onBack} style={{marginBottom:0, marginRight: 15}}>←</button>
            <h2 style={{margin:0}}>Nouvelle Île</h2>
        </div>

        {/* Zone Scrollable pour les paramètres */}
        <div style={{maxHeight: '60vh', overflowY: 'auto', paddingRight: 10}}>

            {/* 1. SEED */}
            <div className="control-group">
                <label>Nom de code (Seed)</label>
                <input 
                type="text" 
                value={localParams.seed} 
                onChange={(e) => handleChange('seed', e.target.value)}
                placeholder="Ex: ARCHIPEL_SECRET"
                />
            </div>

            {/* 2. DIMENSIONS (Côte à côte) */}
            <div className="control-group" style={{display:'flex', gap:15}}>
                <div style={{flex:1}}>
                <label>Largeur (Cases)</label>
                <input 
                    type="number" 
                    value={localParams.width} 
                    onChange={(e) => handleChange('width', parseInt(e.target.value))}
                    min={20} max={100}
                />
                </div>
                <div style={{flex:1}}>
                <label>Hauteur (Cases)</label>
                <input 
                    type="number" 
                    value={localParams.height} 
                    onChange={(e) => handleChange('height', parseInt(e.target.value))}
                    min={20} max={100}
                />
                </div>
            </div>

            {/* 3. POPULATION */}
            <div className="control-group">
                <label>Population : {localParams.population.toLocaleString()} hab.</label>
                <input 
                type="range" 
                min="0" max="100000" step="1000"
                value={localParams.population}
                onChange={(e) => handleChange('population', parseInt(e.target.value))}
                style={{width:'100%'}}
                />
            </div>

            {/* 4. RICHESSE */}
            <div className="control-group">
                <label>Niveau de Richesse : {localParams.wealthLevel}%</label>
                <input 
                type="range" 
                min="0" max="100"
                value={localParams.wealthLevel}
                onChange={(e) => handleChange('wealthLevel', parseInt(e.target.value))}
                style={{width:'100%'}}
                />
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'#666'}}>
                    <span>Pauvre / Criminel</span>
                    <span>Riche / Sûr</span>
                </div>
            </div>

            {/* 5. DISPARITÉS (Checkbox) */}
            <div className="control-group" style={{marginTop: 20, background: '#222', padding: 10, borderRadius: 5}}>
                <label style={{display:'flex', alignItems:'center', gap: 10, cursor:'pointer', marginBottom:0, color:'white'}}>
                <input 
                    type="checkbox" 
                    checked={localParams.highInequality}
                    onChange={(e) => handleChange('highInequality', e.target.checked)}
                    style={{width:'auto'}}
                />
                Disparités Extrêmes
                </label>
                <small style={{color:'#888', display:'block', marginTop:5, fontSize:'0.75rem'}}>
                Active simultanément les zones très riches (Hôtels) et très criminelles (Pirates), peu importe le niveau de richesse moyen.
                </small>
            </div>

        </div>

        {/* Bouton Action */}
        <button className="action-btn" onClick={() => onGenerate(localParams)}>
          🚀 Générer l'Île
        </button>
      </div>
    </div>
  );
};