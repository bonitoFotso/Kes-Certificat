import { FileSpreadsheet, Files } from 'lucide-react';

interface ModeSelectorProps {
  mode: 'ATT' | 'THEL' | 'THTH';
  setMode: (mode: 'ATT' | 'THEL' | 'THTH') => void;
}

export const ModeSelector = ({ mode, setMode }: ModeSelectorProps) => (
  <div className="flex justify-center mb-8">
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
      <button
        onClick={() => setMode('ATT')}
        className={`inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition-all duration-200 ${
          mode === 'ATT'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <FileSpreadsheet className="w-4 h-4" />
        certificat
      </button>
      <button
        onClick={() => setMode('THEL')}
        className={`inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition-all duration-200 ${
          mode === 'THEL'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Files className="w-4 h-4" />
        Titre d'habilitations Electrique
      </button>
      <button
        onClick={() => setMode('THTH')}
        className={`inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition-all duration-200 ${
          mode === 'THTH'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Files className="w-4 h-4" />
        Titre d'habilitations Traveaux en Hauteur
      </button>
    </div>
  </div>
);