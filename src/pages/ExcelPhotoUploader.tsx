import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  Upload, Users, Image as ImageIcon, Download, X, CheckCircle2, 
  AlertCircle, FileImage, RefreshCw, Search, UserCheck, Folder
} from 'lucide-react';

interface Person {
  id: number;
  firstName: string;
  lastName: string;
  reference: string;
}

interface PhotoMapping {
  person: Person;
  photo: File;
  photoPreview: string;
  fileName: string;
}

const ExcelPhotoUploader: React.FC = () => {
  const [excelData, setExcelData] = useState<Person[]>([]);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoMappings, setPhotoMappings] = useState<PhotoMapping[]>([]);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'mapping' | 'overview'>('upload');
  const [progressStatus, setProgressStatus] = useState<{excel: boolean, photos: boolean, config: boolean}>({
    excel: false,
    photos: false,
    config: false
  });
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProgressStatus(prev => ({
      ...prev,
      excel: excelData.length > 0,
      photos: photos.length > 0,
      config: projectName.trim() !== '' 
    }));
  }, [excelData, photos, projectName]);

  useEffect(() => {
    if (excelData.length > 0 && photos.length > 0) {
      setActiveTab('mapping');
    }
  }, [excelData, photos]);

  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleExcelFileUpload = (file: File) => {
    setExcelFile(file);
    setIsProcessing(true);
    showMessage('Analyse du fichier Excel...', 'info');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (event.target?.result) {
          const data = event.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Extract header names to identify columns
          const persons: Person[] = jsonData.map((row: any, index: number) => {
            const keys = Object.keys(row);
            const firstNameKey = keys.find(key => 
              key.toLowerCase().includes('prénom') || 
              key.toLowerCase().includes('prenom') || 
              key.toLowerCase() === 'first name' ||
              key.toLowerCase() === 'firstname'
            );
            
            const lastNameKey = keys.find(key => 
              key.toLowerCase().includes('nom') && !key.toLowerCase().includes('prénom') ||
              key.toLowerCase() === 'last name' ||
              key.toLowerCase() === 'lastname'
            );

            const referenceKey = keys.find(key => 
              key.toLowerCase().includes('référence') || 
              key.toLowerCase().includes('reference') || 
              key.toLowerCase() === 'ref'
            );

            const firstName = firstNameKey ? String(row[firstNameKey]).trim() : `Prénom ${index + 1}`;
            const lastName = lastNameKey ? String(row[lastNameKey]).trim() : `Nom ${index + 1}`;
            const reference = referenceKey ? String(row[referenceKey]).trim() : `REF-${index + 1}`;

            return {
              id: index,
              firstName,
              lastName,
              reference
            };
          });

          setExcelData(persons);
          setIsProcessing(false);
          showMessage(`${persons.length} personnes trouvées dans le fichier Excel.`, 'success');
        }
      } catch (error) {
        console.error('Erreur lors de l\'analyse du fichier Excel:', error);
        showMessage('Erreur lors de l\'analyse du fichier Excel. Vérifiez le format du fichier.', 'error');
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      showMessage('Erreur lors de la lecture du fichier Excel.', 'error');
      setIsProcessing(false);
    };
    
    reader.readAsBinaryString(file);
  };

  const handlePhotoUpload = (files: File[]) => {
    setPhotos(prev => [...prev, ...files]);
    showMessage(`${files.length} photos téléchargées.`, 'success');
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLogo(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setLogoPreview(e.target.result as string);
          showMessage('Logo ajouté avec succès.', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview('');
    if (logoInputRef.current) logoInputRef.current.value = '';
    showMessage('Logo supprimé.', 'info');
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    showMessage('Photo supprimée.', 'info');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const excelFiles = files.filter(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );
    
    const photoFiles = files.filter(file => 
      file.type.startsWith('image/')
    );

    if (excelFiles.length > 0) {
      handleExcelFileUpload(excelFiles[0]);
    }
    
    if (photoFiles.length > 0) {
      handlePhotoUpload(photoFiles);
    }
  };

  const assignPhotoToPerson = (photoIndex: number, personId: number) => {
    const person = excelData.find(p => p.id === personId);
    if (person && photos[photoIndex]) {
      const file = photos[photoIndex];
      const extension = file.name.split('.').pop() || 'jpg';
      const newFileName = `${person.lastName}_${person.firstName}_${person.reference}.${extension}`;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newMapping: PhotoMapping = {
            person,
            photo: file,
            photoPreview: event.target.result as string,
            fileName: newFileName
          };
          
          const existingIndex = photoMappings.findIndex(m => m.person.id === person.id);
          
          if (existingIndex >= 0) {
            const updatedMappings = [...photoMappings];
            updatedMappings[existingIndex] = newMapping;
            setPhotoMappings(updatedMappings);
          } else {
            setPhotoMappings([...photoMappings, newMapping]);
          }
          
          // Remove the photo from the list once it's assigned
          setPhotos(prev => prev.filter((_, i) => i !== photoIndex));
          showMessage(`Photo associée à ${person.firstName} ${person.lastName}`, 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadSinglePhoto = (mapping: PhotoMapping) => {
    const link = document.createElement('a');
    link.href = mapping.photoPreview;
    link.download = mapping.fileName;
    link.click();
    showMessage(`Photo téléchargée sous le nom "${mapping.fileName}"`, 'success');
  };

  const downloadAllPhotos = async () => {
    if (photoMappings.length === 0) {
      showMessage('Aucune photo à télécharger. Veuillez d\'abord associer des photos aux personnes.', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      showMessage('Création de l\'archive ZIP...', 'info');
      const zip = new JSZip();
      
      // Regrouper les photos par référence
      const groupedByReference = photoMappings.reduce((acc, mapping) => {
        const reference = mapping.person.reference;
        if (!acc[reference]) {
          acc[reference] = [];
        }
        acc[reference].push(mapping);
        return acc;
      }, {} as Record<string, PhotoMapping[]>);

      // Pour chaque référence, créer un dossier et y placer les photos + logo
      Object.entries(groupedByReference).forEach(([reference, mappings]) => {
        const folder = zip.folder(reference);
        if (folder) {
          // Ajouter les photos dans le dossier
          mappings.forEach(mapping => {
            folder.file(mapping.fileName, mapping.photo);
          });
          
          // Ajouter le logo dans chaque dossier si disponible
          if (logo) {
            folder.file("logo.png", logo);
          }
        }
      });

      // Générer le nom du fichier ZIP
      const zipName = projectName && projectName.trim() !== '' 
        ? `photos_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.zip` 
        : `photos_${new Date().toISOString().slice(0, 10)}.zip`;
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, zipName);
      
      setIsProcessing(false);
      showMessage(`Archive ZIP créée avec ${photoMappings.length} photos.`, 'success');
    } catch (error) {
      console.error('Erreur lors de la création de l\'archive ZIP:', error);
      showMessage('Erreur lors de la création de l\'archive ZIP.', 'error');
      setIsProcessing(false);
    }
  };

  const removePhotoMapping = (personId: number) => {
    const mapping = photoMappings.find(m => m.person.id === personId);
    if (mapping) {
      // Add the photo back to the unassigned photos
      setPhotos(prev => [...prev, mapping.photo]);
      // Remove the mapping
      setPhotoMappings(prev => prev.filter(m => m.person.id !== personId));
      showMessage('Association photo-personne supprimée.', 'info');
    }
  };

  // Auto-match photos by filename with person names
  const autoMatchPhotos = () => {
    if (photos.length === 0 || excelData.length === 0) {
      showMessage('Vous avez besoin de photos et de données Excel pour utiliser la correspondance automatique.', 'error');
      return;
    }

    setIsProcessing(true);
    showMessage('Tentative de correspondance automatique...', 'info');
    
    const newMappings: PhotoMapping[] = [];
    const unmatchedPhotos: File[] = [];
    
    photos.forEach(photo => {
      const fileName = photo.name.toLowerCase();
      // Try to find a matching person
      const matchedPerson = excelData.find(person => 
        (fileName.includes(person.firstName.toLowerCase()) && 
         fileName.includes(person.lastName.toLowerCase())) ||
        fileName.includes(person.reference.toLowerCase())
      );
      
      if (matchedPerson) {
        const extension = photo.name.split('.').pop() || 'jpg';
        const newFileName = `${matchedPerson.lastName}_${matchedPerson.firstName}_${matchedPerson.reference}.${extension}`;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newMappings.push({
              person: matchedPerson,
              photo: photo,
              photoPreview: event.target.result as string,
              fileName: newFileName
            });
            
            // Once all photos are processed
            if (newMappings.length + unmatchedPhotos.length === photos.length) {
              // Remove existing mappings for these people
              const updatedMappings = photoMappings.filter(mapping => 
                !newMappings.some(newMapping => newMapping.person.id === mapping.person.id)
              );
              
              setPhotoMappings([...updatedMappings, ...newMappings]);
              setPhotos(unmatchedPhotos);
              setIsProcessing(false);
              showMessage(`${newMappings.length} photos automatiquement associées.`, 'success');
            }
          }
        };
        reader.readAsDataURL(photo);
      } else {
        unmatchedPhotos.push(photo);
        
        // Check if processing is complete
        if (newMappings.length + unmatchedPhotos.length === photos.length) {
          setPhotoMappings([...photoMappings, ...newMappings]);
          setPhotos(unmatchedPhotos);
          setIsProcessing(false);
          showMessage(`${newMappings.length} photos automatiquement associées.`, 'success');
        }
      }
    });
  };

  const filteredPersons = excelData.filter(person => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      person.firstName.toLowerCase().includes(search) ||
      person.lastName.toLowerCase().includes(search) ||
      person.reference.toLowerCase().includes(search)
    );
  });

  const filteredMappings = photoMappings.filter(mapping => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      mapping.person.firstName.toLowerCase().includes(search) ||
      mapping.person.lastName.toLowerCase().includes(search) ||
      mapping.person.reference.toLowerCase().includes(search)
    );
  });

  const renderProgressBar = () => {
    const steps = [
      { complete: progressStatus.excel, label: 'Fichier Excel', icon: <Users className="w-4 h-4" /> },
      { complete: progressStatus.photos, label: 'Photos', icon: <ImageIcon className="w-4 h-4" /> },
      { complete: progressStatus.config, label: 'Configuration', icon: <Folder className="w-4 h-4" /> },
    ];
    
    const completedCount = Object.values(progressStatus).filter(Boolean).length;
    const progress = (completedCount / steps.length) * 100;
    
    return (
      <div className="mb-8">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center ${step.complete ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step.complete ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                {step.icon}
              </div>
              <span className="text-sm">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTabs = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8">
        <button
          onClick={() => setActiveTab('upload')}
          className={`py-4 px-1 ${activeTab === 'upload' 
            ? 'border-b-2 border-blue-500 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Importation</span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('mapping')}
          className={`py-4 px-1 ${activeTab === 'mapping' 
            ? 'border-b-2 border-blue-500 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          disabled={excelData.length === 0 || photos.length === 0}
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>Association</span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-4 px-1 ${activeTab === 'overview' 
            ? 'border-b-2 border-blue-500 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          disabled={photoMappings.length === 0}
        >
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            <span>Finalisation</span>
            {photoMappings.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                {photoMappings.length}
              </span>
            )}
          </div>
        </button>
      </nav>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Nommage de photos</h1>
        <p className="text-gray-600 mb-6">Renommez automatiquement vos photos à partir d'un fichier Excel</p>

        {renderProgressBar()}
        {renderTabs()}

        {activeTab === 'upload' && (
          <>
            <div className={`
              border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-all
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <Upload className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Glissez-déposez vos fichiers ici
                  </p>
                  <p className="text-sm text-gray-500">
                    ou cliquez pour sélectionner
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                    <Users className="w-4 h-4" />
                    Fichier Excel
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => e.target.files?.[0] && handleExcelFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </label>

                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
                    <ImageIcon className="w-4 h-4" />
                    Photos
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple={true}
                      onChange={(e) => e.target.files && handlePhotoUpload(Array.from(e.target.files))}
                      className="hidden"
                    />
                  </label>

                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
                    <FileImage className="w-4 h-4" />
                    Logo
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du projet (pour le fichier ZIP)
                </label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom du projet"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo (optionnel) - sera ajouté dans chaque dossier
                </label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative">
                      <img 
                        src={logoPreview} 
                        alt="Logo" 
                        className="w-12 h-12 object-contain border rounded"
                      />
                      <button 
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
                      <FileImage className="w-4 h-4" />
                      Choisir un logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Summary of uploaded items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Fichier Excel</h3>
                  {excelFile && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {excelFile ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{excelFile.name}</p>
                    <p className="text-sm text-blue-600">{excelData.length} personnes</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucun fichier importé</p>
                )}
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Photos</h3>
                  <button 
                    onClick={() => photoInputRef.current?.click()}
                    className="text-green-600 hover:text-green-800"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {photos.length} photos non assignées
                </p>
                <p className="text-sm text-green-600">
                  {photoMappings.length} photos assignées
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Logo</h3>
                {logo ? (
                  <div className="flex items-center gap-2">
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      className="w-6 h-6 object-contain border rounded"
                    />
                    <p className="text-sm text-gray-600">{logo.name}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucun logo importé</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => excelData.length > 0 && photos.length > 0 && setActiveTab('mapping')}
                disabled={excelData.length === 0 || photos.length === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 
                  ${excelData.length > 0 && photos.length > 0 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Continuer vers l'association
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </>
        )}

        {activeTab === 'mapping' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Association des photos aux personnes</h2>
              
              <div className="flex gap-3">
                <button 
                  onClick={autoMatchPhotos}
                  disabled={photos.length === 0 || isProcessing}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg
                    ${photos.length > 0 && !isProcessing 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  Association automatique
                </button>
                
                <button
                  onClick={() => photoMappings.length > 0 && setActiveTab('overview')}
                  disabled={photoMappings.length === 0}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg
                    ${photoMappings.length > 0 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  Continuer vers la finalisation
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Rechercher une personne..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="font-medium mb-4">Photos non assignées ({photos.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.length > 0 ? (
                    photos.map((photo, index) => (
                      <div key={index} className="bg-white rounded-lg shadow p-4">
                        <div className="relative">
                          <img 
                            src={URL.createObjectURL(photo)} 
                            alt={`Photo ${index + 1}`} 
                            className="w-full h-40 object-cover rounded-lg mb-3"
                          />
                          <button 
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 truncate" title={photo.name}>
                          {photo.name}
                        </p>
                        <select 
                          onChange={(e) => assignPhotoToPerson(index, parseInt(e.target.value))}
                          className="w-full p-2 border rounded-lg text-sm"
                          defaultValue=""
                        >
                          <option value="" disabled>Sélectionner une personne</option>
                          {filteredPersons.map(person => (
                            <option key={person.id} value={person.id}>
                              {person.lastName} {person.firstName} - {person.reference}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))
                  ) : (
                    <div className="lg:col-span-3 text-center p-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Aucune photo non assignée</p>
                      <button
                        onClick={() => photoInputRef.current?.click()}
                        className="mt-2 text-blue-600 hover:underline"
                      >
                        Ajouter des photos
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-4">Photos assignées ({photoMappings.length})</h3>
                {photoMappings.length > 0 ? (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {filteredMappings.map((mapping) => (
                      <div key={mapping.person.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3">
                        <img 
                          src={mapping.photoPreview} 
                          alt={`Photo de ${mapping.person.firstName}`} 
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {mapping.person.lastName} {mapping.person.firstName}
                          </p>
                          <p className="text-sm text-blue-600 truncate">
                            {mapping.person.reference}
                          </p>
                        </div>
                        <button 
                          onClick={() => removePhotoMapping(mapping.person.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                          title="Supprimer l'association"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <p className="text-gray-500">Aucune photo assignée</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setActiveTab('upload')}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Retour à l'importation
              </button>
              
              <button
                onClick={() => photoMappings.length > 0 && setActiveTab('overview')}
                disabled={photoMappings.length === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2
                  ${photoMappings.length > 0 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Continuer vers la finalisation
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </>
        )}

        {activeTab === 'overview' && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Finalisation et téléchargement</h2>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm">
                  <strong>Note :</strong> Le logo sera ajouté automatiquement dans chaque dossier de référence lors de la création du ZIP.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Résumé</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {photoMappings.length} photos assignées
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    {photos.length} photos non assignées
                  </p>
                  <p className="text-sm text-gray-600">
                    {Object.keys(photoMappings.reduce((acc, mapping) => {
                      acc[mapping.person.reference] = true;
                      return acc;
                    }, {} as Record<string, boolean>)).length} dossiers de référence
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Paramètres du projet</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Nom du projet : <span className="font-medium">{projectName || "Non défini"}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Logo : {logo ? <span className="text-green-600">Inclus</span> : <span className="text-red-600">Non inclus</span>}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Nom du fichier ZIP</h3>
                  <p className="text-sm text-gray-600 overflow-hidden text-ellipsis">
                    {projectName && projectName.trim() !== '' 
                      ? `photos_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.zip` 
                      : `photos_${new Date().toISOString().slice(0, 10)}.zip`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Rechercher par nom ou référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-6">
              {/* Group by reference */}
              {Object.entries(
                photoMappings.reduce((acc, mapping) => {
                  // Filter by search term if needed
                  if (searchTerm && !(
                    mapping.person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    mapping.person.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    mapping.person.reference.toLowerCase().includes(searchTerm.toLowerCase())
                  )) {
                    return acc;
                  }
                  
                  const reference = mapping.person.reference;
                  if (!acc[reference]) {
                    acc[reference] = [];
                  }
                  acc[reference].push(mapping);
                  return acc;
                }, {} as Record<string, PhotoMapping[]>)
              ).map(([reference, mappings]) => (
                <div key={reference} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">
                      Référence : <span className="text-blue-600">{reference}</span> 
                      <span className="ml-2 text-sm text-gray-500">({mappings.length} photos)</span>
                    </h3>
                    {logo && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <img 
                          src={logoPreview} 
                          alt="Logo" 
                          className="w-5 h-5 object-contain border rounded"
                        />
                        <span>Logo inclus dans ce dossier</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mappings.map((mapping) => (
                      <div key={mapping.person.id} className="bg-gray-50 rounded-lg overflow-hidden">
                        <img 
                          src={mapping.photoPreview} 
                          alt={`Photo de ${mapping.person.firstName}`} 
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-3">
                          <h4 className="font-medium text-sm mb-1">
                            {mapping.person.lastName} {mapping.person.firstName}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2 truncate" title={mapping.fileName}>
                            {mapping.fileName}
                          </p>
                          <button 
                            onClick={() => downloadSinglePhoto(mapping)}
                            className="w-full text-xs inline-flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            <Download className="w-3 h-3" />
                            Télécharger
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setActiveTab('mapping')}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Retour à l'association
              </button>
              
              <button 
                onClick={downloadAllPhotos}
                disabled={photoMappings.length === 0 || isProcessing}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-lg
                  ${photoMappings.length > 0 && !isProcessing 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <Download className={`w-5 h-5 ${isProcessing ? 'animate-pulse' : ''}`} />
                {isProcessing ? 'Création du ZIP...' : 'Télécharger toutes les photos (ZIP)'}
              </button>
            </div>
          </>
        )}

        {message && (
          <div className={`
            fixed bottom-4 right-4 max-w-md p-4 rounded-lg shadow-lg flex items-center gap-3 z-50
            ${messageType === 'success' ? 'bg-green-600 text-white' : ''}
            ${messageType === 'error' ? 'bg-red-600 text-white' : ''}
            ${messageType === 'info' ? 'bg-blue-600 text-white' : ''}
          `}>
            {messageType === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {messageType === 'error' && <AlertCircle className="w-5 h-5" />}
            {messageType === 'info' && <AlertCircle className="w-5 h-5" />}
            {message}
          </div>
        )}

        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-800 font-medium">Traitement en cours...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelPhotoUploader;