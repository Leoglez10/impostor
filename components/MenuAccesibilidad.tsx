
import React from 'react';
import { X, Moon, Sun, Type, Eye, Zap, Accessibility } from 'lucide-react';

export interface AccesibilidadSettings {
  modoOscuro: boolean;
  altoContraste: boolean;
  fuenteDislexia: boolean;
  textoGrande: boolean;
  sinAnimaciones: boolean; // Modo TDA/Enfoque
}

interface MenuAccesibilidadProps {
  settings: AccesibilidadSettings;
  setSettings: React.Dispatch<React.SetStateAction<AccesibilidadSettings>>;
  onClose: () => void;
}

const MenuAccesibilidad: React.FC<MenuAccesibilidadProps> = ({ settings, setSettings, onClose }) => {
  
  const toggleSetting = (key: keyof AccesibilidadSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className={`relative w-full max-w-sm rounded-2xl p-6 shadow-2xl border ${settings.modoOscuro ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} ${settings.altoContraste ? 'border-4 border-yellow-400' : ''}`}>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold flex items-center gap-2 ${settings.modoOscuro ? 'text-white' : 'text-slate-900'}`}>
            <Accessibility className="w-6 h-6" />
            Accesibilidad
          </h2>
          <button onClick={onClose} className={`p-2 rounded-full ${settings.modoOscuro ? 'hover:bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-900'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          
          {/* Modo Oscuro / Claro */}
          <button 
            onClick={() => toggleSetting('modoOscuro')}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
               settings.modoOscuro 
               ? 'bg-slate-800 border-brand-primary text-white' 
               : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {settings.modoOscuro ? <Moon className="w-5 h-5 text-brand-primary" /> : <Sun className="w-5 h-5 text-orange-500" />}
              <span className="font-medium">Modo {settings.modoOscuro ? 'Oscuro' : 'Claro'}</span>
            </div>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${settings.modoOscuro ? 'bg-brand-primary' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.modoOscuro ? 'left-5' : 'left-1'}`}></div>
            </div>
          </button>

          {/* Alto Contraste */}
          <button 
            onClick={() => toggleSetting('altoContraste')}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
               settings.modoOscuro ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
            } ${settings.altoContraste ? 'ring-2 ring-yellow-400' : ''}`}
          >
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5" />
              <span className="font-medium">Alto Contraste</span>
            </div>
            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${settings.altoContraste ? 'bg-brand-primary border-brand-primary' : 'border-slate-400'}`}>
              {settings.altoContraste && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </button>

          {/* Fuente Dislexia */}
          <button 
            onClick={() => toggleSetting('fuenteDislexia')}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
               settings.modoOscuro ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5" />
              <span className="font-medium" style={{ fontFamily: 'Comic Sans MS, sans-serif' }}>Fuente Legible (Dislexia)</span>
            </div>
            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${settings.fuenteDislexia ? 'bg-brand-primary border-brand-primary' : 'border-slate-400'}`}>
              {settings.fuenteDislexia && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </button>

          {/* Texto Grande */}
          <button 
            onClick={() => toggleSetting('textoGrande')}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
               settings.modoOscuro ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">A+</span>
              <span className="font-medium">Texto Grande</span>
            </div>
            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${settings.textoGrande ? 'bg-brand-primary border-brand-primary' : 'border-slate-400'}`}>
              {settings.textoGrande && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </button>

          {/* Modo TDA / Enfoque */}
          <button 
            onClick={() => toggleSetting('sinAnimaciones')}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
               settings.modoOscuro ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5" />
              <div className="text-left">
                <span className="font-medium block">Modo TDA / Enfoque</span>
                <span className={`text-xs ${settings.modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>Sin animaciones ni fondos distractores</span>
              </div>
            </div>
            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${settings.sinAnimaciones ? 'bg-brand-primary border-brand-primary' : 'border-slate-400'}`}>
              {settings.sinAnimaciones && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};

export default MenuAccesibilidad;
