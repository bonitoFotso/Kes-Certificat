export const HelpSection = () => (
    <div className="mb-8 bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Comment utiliser l'application ?</h2>
      <div className="space-y-3 text-gray-600">
        <p><strong>Mode fichier unique :</strong> Idéal pour traiter un seul fichier Excel. Vous pourrez prévisualiser les données avant de générer les certificats.</p>
        <p><strong>Mode multi-fichiers :</strong> Permet de traiter plusieurs fichiers Excel en une fois. Chaque fichier sera traité séquentiellement.</p>
        <p><strong>Format accepté :</strong> Fichiers Excel (.xlsx, .xls)</p>
      </div>
    </div>
  );