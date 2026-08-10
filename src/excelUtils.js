/**
 * Utilitaires d'import/export Excel
 * Gère les fichiers .xlsx pour l'import et l'export de données d'établissements
 */

import XLSX from 'xlsx';

/**
 * Convertit un état simple en état détaillé
 * EN = Enregistré
 * RE = Enregistré (variante)
 * VA = Installation en cours
 * MSV = Mise en Service
 * (vide) = Non démarré
 */
export function mapEtatToStage(etat) {
  if (!etat) return 'Non démarré';
  if (etat === 'EN' || etat === 'RE') return 'Demande enregistrée';
  if (etat === 'VA') return 'Installation en cours';
  if (etat === 'MSV') return 'En service';
  return 'Non démarré';
}

export function mapStageToEtat(stage) {
  if (stage === 'Non démarré') return '';
  if (stage === 'Demande enregistrée') return 'EN';
  if (stage === 'Installation en cours') return 'VA';
  if (stage === 'Installée - en attente MES') return 'VA';
  if (stage === 'En service') return 'MSV';
  if (stage === 'Bloqué') return 'BL';
  return '';
}

/**
 * Export des données en fichier Excel
 * @param {Array} schools - Tableau des établissements
 * @returns {void} Télécharge un fichier .xlsx
 */
export function exportToExcel(schools) {
  const data = schools.map(s => {
    const etat = mapStageToEtat(s.stage);
    return {
      'N° DEMANDE': s.numDemande || '',
      'ETAT DEMANDE': etat,
      'ÉTABLISSEMENT': s.nom || '',
      'ADRESSE': s.adresse || '',
      'ZONE': s.zone || '',
      'IEF': s.ief || '',
      'CONTACT': s.contact || '',
      'TÉLÉPHONE': s.telephone || '',
      'TECHNOLOGIE': s.techno || '',
      'DATE ENREGISTREMENT': s.dateEnr || '',
      'SUPPORT': s.support || '',
      'DATE PRÉVUE': s.datePrevue || '',
      'STATUT INSTALLATION': s.statutInstall || '',
      'DATE RÉELLE': s.dateReelle || '',
      'DATE MES': s.dateMES || '',
      'COMMENTAIRE': s.commentaire || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Style basique : largeur des colonnes
  const colWidths = [
    { wch: 15 }, // N° DEMANDE
    { wch: 12 }, // ETAT DEMANDE
    { wch: 30 }, // ÉTABLISSEMENT
    { wch: 35 }, // ADRESSE
    { wch: 15 }, // ZONE
    { wch: 20 }, // IEF
    { wch: 20 }, // CONTACT
    { wch: 15 }, // TÉLÉPHONE
    { wch: 15 }, // TECHNOLOGIE
    { wch: 15 }, // DATE ENREGISTREMENT
    { wch: 20 }, // SUPPORT
    { wch: 15 }, // DATE PRÉVUE
    { wch: 20 }, // STATUT INSTALLATION
    { wch: 15 }, // DATE RÉELLE
    { wch: 15 }, // DATE MES
    { wch: 30 }, // COMMENTAIRE
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Établissements');
  
  // Télécharger
  const fileName = `Tour_de_Controle_Connectivite_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Import de données depuis un fichier Excel
 * @param {File} file - Fichier .xlsx à importer
 * @returns {Promise<Array>} Tableau des établissements importés
 */
export async function importFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet);

        // Convertir les lignes en objets school
        const schools = rows.map((row, idx) => ({
          id: `sch-import-${Date.now()}-${idx}`,
          nom: row['ÉTABLISSEMENT'] || '',
          adresse: row['ADRESSE'] || '',
          zone: row['ZONE'] || '',
          ief: row['IEF'] || '',
          contact: row['CONTACT'] || '',
          telephone: row['TÉLÉPHONE'] || '',
          techno: row['TECHNOLOGIE'] || 'Flybox 4G',
          dateEnr: row['DATE ENREGISTREMENT'] || '',
          numDemande: row['N° DEMANDE'] || '',
          support: row['SUPPORT'] || '',
          datePrevue: row['DATE PRÉVUE'] || '',
          statutInstall: row['STATUT INSTALLATION'] || 'Non démarré',
          dateReelle: row['DATE RÉELLE'] || '',
          dateMES: row['DATE MES'] || '',
          commentaire: row['COMMENTAIRE'] || '',
          etatDemande: row['ETAT DEMANDE'] || '',
        }));

        resolve(schools);
      } catch (error) {
        reject(new Error(`Erreur lors de la lecture du fichier : ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Génère un template Excel vide pour faciliter l'import
 */
export function exportTemplate() {
  const templateData = [
    {
      'N° DEMANDE': 'DEM-2025-1001',
      'ETAT DEMANDE': 'EN',
      'ÉTABLISSEMENT': 'École Primaire Diamalaye',
      'ADRESSE': 'Quartier Diamalaye, Dakar',
      'ZONE': 'Dakar',
      'IEF': 'IEF Dakar Plateau',
      'CONTACT': 'Moussa Diop',
      'TÉLÉPHONE': '77 123 45 67',
      'TECHNOLOGIE': 'Flybox 4G',
      'DATE ENREGISTREMENT': '2025-01-15',
      'SUPPORT': 'Équipe Support 1',
      'DATE PRÉVUE': '2025-02-01',
      'STATUT INSTALLATION': 'Planifiée',
      'DATE RÉELLE': '',
      'DATE MES': '',
      'COMMENTAIRE': 'Exemple - À remplacer',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const colWidths = [
    { wch: 15 }, // N° DEMANDE
    { wch: 12 }, // ETAT DEMANDE
    { wch: 30 }, // ÉTABLISSEMENT
    { wch: 35 }, // ADRESSE
    { wch: 15 }, // ZONE
    { wch: 20 }, // IEF
    { wch: 20 }, // CONTACT
    { wch: 15 }, // TÉLÉPHONE
    { wch: 15 }, // TECHNOLOGIE
    { wch: 15 }, // DATE ENREGISTREMENT
    { wch: 20 }, // SUPPORT
    { wch: 15 }, // DATE PRÉVUE
    { wch: 20 }, // STATUT INSTALLATION
    { wch: 15 }, // DATE RÉELLE
    { wch: 15 }, // DATE MES
    { wch: 30 }, // COMMENTAIRE
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Exemple');
  
  const fileName = `Template_Tour_de_Controle_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
