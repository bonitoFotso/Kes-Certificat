import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Upload, Users, Image as ImageIcon, Download, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface Person {
  id: number;
  firstName: string;
  lastName: string;
}

interface PhotoMapping {
  person: Person;
  photo: File;
  photoPreview: string;
  fileName: string;
}

const ExcelPhotoUploader: React.FC = () => {
  const [excelData, setExcelData] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoMappings, setPhotoMappings] = useState<PhotoMapping[]>([]);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleExcelFileUpload = (file: File) => {
    setExcelFile(file);
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

            const firstName = firstNameKey ? String(row[firstNameKey]).trim() : `Prénom ${index + 1}`;
            const lastName = lastNameKey ? String(row[lastNameKey]).trim() : `Nom ${index + 1}`;

            return {
              id: index,
              firstName,
              lastName
            };
          });

          setExcelData(persons);
          showMessage(`${persons.length} personnes trouvées dans le fichier Excel.`, 'success');
          
          if (persons.length > 0) {
            setSelectedPerson(persons[0]);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'analyse du fichier Excel:', error);
        showMessage('Erreur lors de l\'analyse du fichier Excel. Vérifiez le format du fichier.', 'error');
      }
    };
    
    reader.onerror = () => {
      showMessage('Erreur lors de la lecture du fichier Excel.', 'error');
    };
    
    reader.readAsBinaryString(file);
  };

  const handlePhotoUpload = (files: File[]) => {
    if (batchMode) {
      setPhotos(files);
      showMessage(`${files.length} photos téléchargées.`, 'success');
    } else if (selectedPerson && files.length > 0) {
      const file = files[0];
      const extension = file.name.split('.').pop() || 'jpg';
      const newFileName = `${selectedPerson.lastName}_${selectedPerson.firstName}.${extension}`;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newMapping: PhotoMapping = {
            person: selectedPerson,
            photo: file,
            photoPreview: event.target.result as string,
            fileName: newFileName
          };
          
          const existingIndex = photoMappings.findIndex(m => m.person.id === selectedPerson.id);
          
          if (existingIndex >= 0) {
            const updatedMappings = [...photoMappings];
            updatedMappings[existingIndex] = newMapping;
            setPhotoMappings(updatedMappings);
          } else {
            setPhotoMappings([...photoMappings, newMapping]);
          }
          
          showMessage(`Photo associée à ${selectedPerson.firstName} ${selectedPerson.lastName}`, 'success');
        }
      };
      reader.readAsDataURL(file);
    }
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
      const newFileName = `${person.lastName}_${person.firstName}.${extension}`;
      
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
      showMessage('Création de l\'archive ZIP...', 'info');
      const zip = new JSZip();
      const folder = zip.folder("photos_renommees");
      
      if (folder) {
        await Promise.all(photoMappings.map(mapping => {
          return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                folder.file(mapping.fileName, event.target.result as ArrayBuffer);
                resolve();
              } else {
                reject(new Error("Échec de la lecture du fichier"));
              }
            };
            reader.onerror = () => reject(new Error("Erreur de FileReader"));
            reader.readAsArrayBuffer(mapping.photo);
          });
        }));
        
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "photos_renommees.zip");
        
        showMessage(`Archive ZIP créée avec ${photoMappings.length} photos.`, 'success');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'archive ZIP:', error);
      showMessage('Erreur lors de la création de l\'archive ZIP.', 'error');
    }
  };

  const removePhotoMapping = (personId: number) => {
    setPhotoMappings(photoMappings.filter(mapping => mapping.person.id !== personId));
    showMessage('Association photo-personne supprimée.', 'info');
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Nommage de photos</h1>
        <p className="text-gray-600 mb-6">Renommez automatiquement vos photos à partir d'un fichier Excel</p>

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
            
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                <Users className="w-4 h-4" />
                Fichier Excel
                <input
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
                  type="file"
                  accept="image/*"
                  multiple={batchMode}
                  onChange={(e) => e.target.files && handlePhotoUpload(Array.from(e.target.files))}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {excelData.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <button 
                onClick={() => setBatchMode(false)}
                className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                  !batchMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Mode individuel
              </button>
              <button 
                onClick={() => setBatchMode(true)}
                className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                  batchMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Mode par lot
              </button>
            </div>

            {!batchMode && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner une personne
                </label>
                <select 
                  value={selectedPerson?.id || ''}
                  onChange={(e) => {
                    const person = excelData.find(p => p.id === parseInt(e.target.value));
                    setSelectedPerson(person || null);
                  }}
                  className="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {excelData.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.lastName} {person.firstName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {batchMode && photos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4">
                    <img 
                      src={URL.createObjectURL(photo)} 
                      alt={`Photo ${index + 1}`} 
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <select 
                      onChange={(e) => assignPhotoToPerson(index, parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg mb-2"
                      defaultValue=""
                    >
                      <option value="" disabled>Sélectionner une personne</option>
                      {excelData.map(person => (
                        <option key={person.id} value={person.id}>
                          {person.lastName} {person.firstName}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {photoMappings.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Photos associées ({photoMappings.length})
                  </h2>
                  <button 
                    onClick={downloadAllPhotos}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger ZIP
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photoMappings.map((mapping) => (
                    <div key={mapping.person.id} className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="relative">
                        <img 
                          src={mapping.photoPreview} 
                          alt={`Photo de ${mapping.person.firstName}`} 
                          className="w-full h-48 object-cover"
                        />
                        <button 
                          onClick={() => removePhotoMapping(mapping.person.id)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-2">
                          {mapping.person.lastName} {mapping.person.firstName}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3 truncate">
                          {mapping.fileName}
                        </p>
                        <button 
                          onClick={() => downloadSinglePhoto(mapping)}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Download className="w-4 h-4" />
                          Télécharger
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {message && (
          <div className={`
            fixed bottom-4 right-4 max-w-md p-4 rounded-lg shadow-lg flex items-center gap-3
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
      </div>
    </div>
  );
};

export default ExcelPhotoUploader;