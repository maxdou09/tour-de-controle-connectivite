# 📊 Guide d'Intégration - Support Excel et ETAT DEMANDE

## ✅ Fichiers Créés

1. **`src/excelUtils.js`** - Utilitaires import/export Excel
2. **`src/ExcelImportExport.jsx`** - Composant UI (boutons)
3. **`src/EtatDemande.jsx`** - Gestion des états (EN, RE, VA, MSV)
4. **`src/SchoolsTabUpdated.jsx`** - Version mise à jour de SchoolsTab
5. **`package.json`** - Dépendance `xlsx` ajoutée

---

## 🔧 Comment Intégrer dans App.jsx

### Étape 1 : Ajouter les imports en haut de App.jsx

```javascript
import { exportToExcel, importFromExcel, exportTemplate } from './excelUtils';
import { EtatBadge, EtatSelect, EtatLegend } from './EtatDemande';
```

### Étape 2 : Modifier la fonction SchoolsTab

**TROUVER :** La fonction `function SchoolsTab({ schools, setSchools })` (environ ligne 691)

**REMPLACER :** Le contenu complet avec le contenu de `src/SchoolsTabUpdated.jsx`

Ou utiliser la version simplifiée ci-dessous :

```javascript
function SchoolsTab({ schools, setSchools }) {
  // ... imports et states existants ...
  
  // AJOUTER CES IMPORTS
  import { exportToExcel, importFromExcel, exportTemplate } from './excelUtils';
  import { EtatBadge } from './EtatDemande';
  
  // ... existing code ...
  
  // REMPLACER exportCSV par :
  const handleExportExcel = () => {
    try {
      exportToExcel(filtered.map(s => ({ ...s, stage: s.stage })));
    } catch (error) {
      alert(`Erreur: ${error.message}`);
    }
  };

  const handleImportExcel = async (file) => {
    try {
      const imported = await importFromExcel(file);
      if (confirm(`${imported.length} établissements trouvés. Ajouter?`)) {
        setSchools([...schools, ...imported]);
      } else {
        setSchools(imported);
      }
    } catch (error) {
      alert(`Erreur: ${error.message}`);
    }
  };

  // ... rest of code ...
}
```

### Étape 3 : Mettre à jour la barre d'outils (SchoolsTab)

**REMPLACER :**
```javascript
<Btn variant="subtle" icon={Upload} small onClick={() => setShowImport(true)}>Importer CSV</Btn>
<Btn variant="subtle" icon={Download} small onClick={exportCSV}>Exporter CSV</Btn>
```

**PAR :**
```javascript
<Btn variant="subtle" icon={Download} small onClick={handleExportExcel}>
  Exporter Excel
</Btn>
<Btn variant="subtle" icon={FileText} small onClick={() => exportTemplate()}>
  Template
</Btn>
<Btn
  variant="subtle"
  icon={Upload}
  small
  onClick={() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) await handleImportExcel(file);
    };
    input.click();
  }}
>
  Importer Excel
</Btn>
<Btn variant="subtle" icon={Download} small onClick={exportCSV}>
  Exporter CSV
</Btn>
```

### Étape 4 : Ajouter colonnes dans le tableau

**REMPLACER :**
```javascript
{["École", "Zone / IEF", "Techno", "Statut", "Jours", "Contact", ""].map((h) => (
```

**PAR :**
```javascript
{["N° DEMANDE", "ETAT", "École", "Zone / IEF", "Techno", "Statut", "Jours", "Contact", ""].map((h) => (
```

### Étape 5 : Ajouter les colonnes dans les lignes du tableau

**AJOUTER** avant la colonne "École" :

```javascript
{/* N° DEMANDE */}
<td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600, color: C.textDim, maxWidth: 140 }}>
  {s.numDemande ? (
    <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{s.numDemande}</span>
  ) : (
    <span style={{ color: C.faint }}>—</span>
  )}
</td>

{/* ETAT DEMANDE */}
<td style={{ padding: "10px 14px" }}>
  <EtatBadge etat={s.etatDemande || ''} />
</td>
```

---

## 📝 Modifications dans SchoolModal

Si vous modifiez une école, vous devriez aussi ajouter la possibilité d'éditer `etatDemande` :

```javascript
// Ajouter dans SchoolModal
<Field label="ÉTAT DEMANDE">
  <EtatSelect value={school.etatDemande || ''} onChange={(v) => setLocal({ ...local, etatDemande: v })} />
</Field>
```

---

## 🧪 Tests

1. **Export Excel** : Cliquez "Exporter Excel" → un fichier .xlsx se télécharge
2. **Import Excel** : Cliquez "Importer Excel" → sélectionnez un fichier
3. **Template** : Cliquez "Template" → obtient un template d'exemple
4. **Colonnes** : Vérifiez que N° DEMANDE et ETAT DEMANDE apparaissent

---

## ✅ Checklist d'Intégration

- [ ] Ajouter imports en haut d'App.jsx
- [ ] Remplacer SchoolsTab avec la nouvelle version
- [ ] Ajouter boutons Excel dans la barre d'outils
- [ ] Ajouter colonnes N° DEMANDE et ETAT DEMANDE dans le tableau
- [ ] Ajouter champs édition ETAT DEMANDE dans SchoolModal
- [ ] Test export Excel
- [ ] Test import Excel
- [ ] Test template
- [ ] Build local : `npm run build`
- [ ] Push sur GitHub
- [ ] Vérifier sur Netlify

---

## 🚀 Format Fichier Excel

Colonnes attendues pour l'import :

```
1. N° DEMANDE          - DEM-2025-1001
2. ETAT DEMANDE        - EN, RE, VA, MSV, ou vide
3. ÉTABLISSEMENT       - nom de l'école
4. ADRESSE             - adresse complète
5. ZONE                - région
6. IEF                 - inspectorat
7. CONTACT             - responsable
8. TÉLÉPHONE           - +221 77 123 45 67
9. TECHNOLOGIE         - Flybox 4G, 5G, Fibre, VSAT
10. DATE ENREGISTREMENT - 2025-01-15
11. SUPPORT            - équipe support
12. DATE PRÉVUE        - 2025-02-01
13. STATUT INSTALLATION - Planifiée, En cours, etc
14. DATE RÉELLE        - 2025-02-15
15. DATE MES           - 2025-02-20
16. COMMENTAIRE        - notes libres
```

---

## 💡 Notes

- L'import Excel fusionne ou remplace selon le choix de l'utilisateur
- Tous les fichiers existants restent compatibles
- CSV est toujours supporté pour la rétrocompatibilité
- Les états EN/RE/VA/MSV sont mappés automatiquement

---

**Prêt à intégrer ? Suivez les étapes ci-dessus ! 🎉**
