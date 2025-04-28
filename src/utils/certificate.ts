export const generateCertificates = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('excel_file', file);
    
    const response = await fetch('http://192.168.100.188:8888/api/certificat/', {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error('Erreur lors de la génération des certificats');
    }
  
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificats-${file.name.split('.')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };