// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CertificateGeneratorPage } from './pages/CertificateGeneratorPage';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from './components/ui/Toaster';
import ErrorBoundary from './components/common/ErrorBoundary';
import UploadComponent from './pages/UploadComponent';
import ExcelPhotoUploader from './pages/ExcelPhotoUploader';

/**
 * Point d'entrée principal de l'application
 */
export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Routes dans la mise en page principale */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<CertificateGeneratorPage />} />
              <Route path="certificates" element={<CertificateGeneratorPage />} />
              
              {/* Pages futures */}
              <Route path="entities" element={<UploadComponent/>} />
              <Route path="photo" element={<ExcelPhotoUploader/>} />
              <Route path="clients" element={<ComingSoonPage title="Clients" />} />
              <Route path="sites" element={<ComingSoonPage title="Sites" />} />
              <Route path="products" element={<ComingSoonPage title="Produits" />} />
              <Route path="formations" element={<ComingSoonPage title="Formations" />} />
              <Route path="reports" element={<ComingSoonPage title="Rapports" />} />
              <Route path="offres" element={<ComingSoonPage title="Offres" />} />
              <Route path="affaires" element={<ComingSoonPage title="Affaires" />} />
              <Route path="proformas" element={<ComingSoonPage title="Proformas" />} />
              
              {/* Pages utilitaires */}
              <Route path="help" element={<HelpPage />} />
              <Route path="settings" element={<SettingsPage />} />
              
              {/* Route par défaut */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

/**
 * Page temporaire pour les fonctionnalités à venir
 */
const ComingSoonPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-gray-600 text-center max-w-md">
        Cette fonctionnalité est en cours de développement et sera disponible prochainement.
      </p>
    </div>
  );
};

/**
 * Page d'aide complète
 */
const HelpPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Centre d'aide</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Documentation</h2>
        <p className="text-gray-600">
          Consultez notre documentation complète pour apprendre à utiliser toutes les fonctionnalités 
          du générateur de certificats.
        </p>
      </div>
    </div>
  );
};

/**
 * Page de paramètres
 */
const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Paramètres</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Préférences utilisateur</h2>
        <p className="text-gray-600">
          Configurez vos préférences pour personnaliser votre expérience.
        </p>
      </div>
    </div>
  );
};

export default App;