import { FileSpreadsheet, HelpCircle } from 'lucide-react';

interface NavigationProps {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

export const Navigation = ({ showHelp, setShowHelp }: NavigationProps) => (
  <nav className="bg-white shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <FileSpreadsheet className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">
            Générateur de Certificats
          </h1>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
          aria-label="Aide"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  </nav>
);
