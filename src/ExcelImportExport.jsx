/**
 * Composant pour import/export Excel
 * Permet d'importer et exporter les données en format Excel
 */

import React, { useRef } from 'react';
import { Upload, Download, FileText } from 'lucide-react';
import { exportToExcel, importFromExcel, exportTemplate } from './excelUtils';

const C = {
  bg: "#0A1220",
  panel: "#111B2E",
  panelHover: "#1B2A46",
  border: "#233252",
  text: "#EAF0FB",
  textDim: "#B7C2DA",
  muted: "#7C89A6",
  green: "#34D399",
  greenDim: "#1B4B3C",
  amber: "#FBBF24",
  amberDim: "#4A3B14",
  red: "#F87171",
};

const body = { fontFamily: "'Inter', sans-serif" };

export function ExcelImportExport({ schools, setSchools, onImportSuccess }) {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    try {
      exportToExcel(schools);
    } catch (error) {
      alert(`Erreur lors de l'export : ${error.message}`);
    }
  };

  const handleExportTemplate = () => {
    try {
      exportTemplate();
    } catch (error) {
      alert(`Erreur lors de la génération du template : ${error.message}`);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedSchools = await importFromExcel(file);
      
      if (importedSchools.length === 0) {
        alert('Le fichier ne contient aucune donnée valide.');
        return;
      }

      // Option 1: Remplacer complètement
      // Option 2: Fusionner avec les existants
      const shouldMerge = confirm(
        `${importedSchools.length} établissement(s) trouvé(s).\n\n` +
        'Voulez-vous ajouter ces données aux existantes?\n' +
        '(OK = Ajouter, Annuler = Remplacer complètement)'
      );

      if (shouldMerge) {
        setSchools([...schools, ...importedSchools]);
      } else {
        setSchools(importedSchools);
      }

      if (onImportSuccess) {
        onImportSuccess(importedSchools.length);
      }

      alert(`✅ ${importedSchools.length} établissement(s) importé(s) avec succès !`);
    } catch (error) {
      alert(`❌ Erreur lors de l'import : ${error.message}`);
    } finally {
      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {/* Export */}
      <button
        onClick={handleExport}
        title="Exporter tous les établissements en Excel"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 16px',
          borderRadius: 9,
          background: C.green,
          color: '#062017',
          border: '1px solid transparent',
          fontSize: 13.5,
          fontWeight: 600,
          cursor: 'pointer',
          ...body,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <Download size={15} />
        Exporter Excel
      </button>

      {/* Import */}
      <button
        onClick={() => fileInputRef.current?.click()}
        title="Importer un fichier Excel"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 16px',
          borderRadius: 9,
          background: 'transparent',
          color: C.text,
          border: `1px solid ${C.border}`,
          fontSize: 13.5,
          fontWeight: 600,
          cursor: 'pointer',
          ...body,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.panelHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Upload size={15} />
        Importer Excel
      </button>

      {/* Template */}
      <button
        onClick={handleExportTemplate}
        title="Télécharger un template Excel vide à compléter"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 16px',
          borderRadius: 9,
          background: 'transparent',
          color: C.muted,
          border: `1px solid ${C.border}`,
          fontSize: 13.5,
          fontWeight: 600,
          cursor: 'pointer',
          ...body,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.panelHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <FileText size={15} />
        Template
      </button>

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default ExcelImportExport;
