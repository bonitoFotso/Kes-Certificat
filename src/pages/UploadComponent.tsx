// UploadComponent.jsx
import React, { useState } from 'react';
import axios from 'axios';

const UploadComponent = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleExcelChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleImagesChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!excelFile) {
      setError('Veuillez sélectionner un fichier Excel');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('excel_file', excelFile);
    
    // Ajouter toutes les images
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post('/api/upload-files/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage('Fichiers téléchargés avec succès! Les titres d\'habilitations sont en cours de génération.');
      console.log('Réponse:', response.data);
    } catch (err) {
      setError(`Erreur lors du téléchargement: ${err.response?.data?.message || err.message}`);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Générateur de Titres d'Habilitations</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="excel-file">Fichier Excel avec les données:</label>
          <input 
            type="file" 
            id="excel-file" 
            accept=".xlsx, .xls" 
            onChange={handleExcelChange} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image-files">Photos des participants:</label>
          <input 
            type="file" 
            id="image-files" 
            accept="image/*" 
            multiple 
            onChange={handleImagesChange} 
          />
          <small>{imageFiles.length} fichier(s) sélectionné(s)</small>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Traitement en cours...' : 'Télécharger et générer les titres'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
    </div>
  );
};

export default UploadComponent;