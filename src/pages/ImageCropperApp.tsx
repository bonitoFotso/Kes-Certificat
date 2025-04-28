import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Crop, ArrowRight, Save, X, ImagePlus } from 'lucide-react';

// Composant principal
const ImageCropperApp = () => {
  // État pour stocker les images à rogner
  const [images, setImages] = useState<UploadedImage[]>([]);
  // Index de l'image actuellement en cours de rognage
  const [currentIndex, setCurrentIndex] = useState(0);
  // URL des images rognées
  interface CroppedImage {
    url: string;
    name: string;
  }
  const [croppedImages, setCroppedImages] = useState<CroppedImage[]>([]);
  // État de chargement
  const [loading, setLoading] = useState(false);
  // Zone de rognage
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 });
  // Références pour l'image et le canvas
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Gestionnaire pour l'upload de fichiers
interface UploadedImage {
    file: File;
    url: string;
    name: string;
}

const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const fileList = Array.from(e.target.files || []);
    
    // Créer des URL pour chaque image
    const newImages: UploadedImage[] = fileList.map(file => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name
    }));
    
    setImages((prevImages: UploadedImage[]) => [...prevImages, ...newImages]);
};

  // Fonction pour rogner l'image actuelle
  const cropCurrentImage = useCallback(() => {
    if (images.length === 0 || !imageRef.current) return;
    
    setLoading(true);
    
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Définir la taille du canvas
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    
    // Dessiner la partie de l'image à rogner
    context.drawImage(
      image,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );
    
    // Convertir le canvas en URL de données
    const croppedImageUrl = canvas.toDataURL('image/jpeg');
    
    // Ajouter l'image rognée à la liste
    setCroppedImages(prev => [...prev, {
      url: croppedImageUrl,
      name: `cropped_${images[currentIndex].name}`
    }]);
    
    setLoading(false);
    
    // Passer à l'image suivante
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [cropArea, currentIndex, images]);

  // Fonction pour ajuster la zone de rognage
interface CropAreaProperty {
    property: 'x' | 'y' | 'width' | 'height';
    value: string;
}

interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

const handleCropAreaChange = (property: CropAreaProperty['property'], value: string): void => {
    setCropArea((prev: CropArea) => ({
        ...prev,
        [property]: parseInt(value, 10)
    }));
};

  // Fonction pour télécharger une image rognée
  const downloadCroppedImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction pour supprimer une image de la liste
  const removeUploadedImage = (index: number) => {
      const newList = [...images];
      newList.splice(index, 1);
      setImages(newList);
      
      if (index <= currentIndex) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    };
  
  const removeCroppedImage = (index: number) => {
      const newList = [...croppedImages];
      newList.splice(index, 1);
      setCroppedImages(newList);
    };

    function removeImage(index: number, croppedImages: CroppedImage[], setCroppedImages: React.Dispatch<React.SetStateAction<CroppedImage[]>>): void {
        throw new Error('Function not implemented.');
    }

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Rognage d'images en série</h1>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </TabsTrigger>
          <TabsTrigger value="crop">
            <Crop className="mr-2 h-4 w-4" />
            Rogner
          </TabsTrigger>
          <TabsTrigger value="results">
            <Save className="mr-2 h-4 w-4" />
            Résultats
          </TabsTrigger>
        </TabsList>
        
        {/* Onglet d'importation */}
        <TabsContent value="upload" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Importer des images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <label 
                  htmlFor="image-upload" 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImagePlus className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Cliquez pour ajouter</span> ou glissez-déposez
                    </p>
                  </div>
                  <input 
                    id="image-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFileUpload} 
                  />
                </label>
              </div>
              
              {images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Images à rogner ({images.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image.url} 
                          alt={`Preview ${index}`} 
                          className="h-24 w-24 object-cover rounded-md" 
                          onClick={() => removeUploadedImage(index)}></img>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" 
                          onClick={() => removeImage(index, images, setImages)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <span className="text-xs mt-1 block truncate">{image.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet de rognage */}
        <TabsContent value="crop" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>
                Rogner les images 
                {images.length > 0 && (
                  <span className="ml-2 text-gray-500">
                    ({currentIndex + 1}/{images.length})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <div className="border rounded-md p-2 relative overflow-hidden">
                      <img 
                        ref={imageRef}
                        src={images[currentIndex]?.url} 
                        alt="Current" 
                        className="max-w-full max-h-64 mx-auto"
                      />
                      
                      {/* Zone de rognage visualisée */}
                      <div 
                        className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30 pointer-events-none" 
                        style={{
                          left: `${cropArea.x}px`,
                          top: `${cropArea.y}px`,
                          width: `${cropArea.width}px`,
                          height: `${cropArea.height}px`
                        }}
                      />
                    </div>
                    
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  
                  <div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium">Position X</label>
                        <input
                          type="range"
                          min="0"
                          max="500"
                          value={cropArea.x}
                          onChange={(e) => handleCropAreaChange('x', e.target.value)}
                          className="w-full"
                        />
                        <span className="text-sm">{cropArea.x}px</span>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium">Position Y</label>
                        <input
                          type="range"
                          min="0"
                          max="500"
                          value={cropArea.y}
                          onChange={(e) => handleCropAreaChange('y', e.target.value)}
                          className="w-full"
                        />
                        <span className="text-sm">{cropArea.y}px</span>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium">Largeur</label>
                        <input
                          type="range"
                          min="50"
                          max="500"
                          value={cropArea.width}
                          onChange={(e) => handleCropAreaChange('width', e.target.value)}
                          className="w-full"
                        />
                        <span className="text-sm">{cropArea.width}px</span>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium">Hauteur</label>
                        <input
                          type="range"
                          min="50"
                          max="500"
                          value={cropArea.height}
                          onChange={(e) => handleCropAreaChange('height', e.target.value)}
                          className="w-full"
                        />
                        <span className="text-sm">{cropArea.height}px</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Veuillez d'abord importer des images dans l'onglet "Importer".
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0 || images.length === 0}
              >
                Image précédente
              </Button>
              
              <Button
                onClick={cropCurrentImage}
                disabled={images.length === 0}
              >
                {currentIndex < images.length - 1 ? (
                  <>
                    Rogner et suivant <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Rogner'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Onglet des résultats */}
        <TabsContent value="results" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Images rognées ({croppedImages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {croppedImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {croppedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image.url} 
                        alt={`Cropped ${index}`} 
                        className="h-32 w-32 object-cover rounded-md" 
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="mr-2"
                          onClick={() => downloadCroppedImage(image.url, image.name)}
                        >
                          <Save className="h-4 w-4 mr-1" /> Enregistrer
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => removeImage(index, croppedImages, setCroppedImages)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="text-xs mt-1 block truncate">{image.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Aucune image rognée disponible. Utilisez l'onglet "Rogner" pour traiter vos images.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImageCropperApp;