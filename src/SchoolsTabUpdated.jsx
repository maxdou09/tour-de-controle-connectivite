/**
 * SchoolsTab - Onglet Établissements
 * Mise à jour : Support Excel + colonnes ETAT DEMANDE
 */

import React, { useState, useMemo } from "react";
import {
  Search, Plus, Pencil, Trash2, Upload, Download, FileText, AlertTriangle
} from "lucide-react";
import Papa from "papaparse";
import { exportToExcel, importFromExcel, exportTemplate } from "./excelUtils";
import { EtatBadge, EtatSelect } from "./EtatDemande";

// Réutiliser les couleurs et composants de App.jsx
const C = {
  bg: "#0A1220",
  panel: "#111B2E",
  panelAlt: "#16223A",
  panelHover: "#1B2A46",
  border: "#233252",
  borderSoft: "#1A2740",
  text: "#EAF0FB",
  textDim: "#B7C2DA",
  muted: "#7C89A6",
  faint: "#4C5975",
  green: "#34D399",
  greenDim: "#1B4B3C",
  amber: "#FBBF24",
  amberDim: "#4A3B14",
  red: "#F87171",
  slate: "#5B6B8C",
};

const body = { fontFamily: "'Inter', sans-serif" };
const mono = { fontFamily: "'IBM Plex Mono', monospace" };

export function SchoolsTabUpdated({
  schools,
  setSchools,
  ZONES,
  TECHNOS,
  TECH_ICON,
  STAGES,
  STAGE_META,
  TextInput,
  Select,
  Btn,
  IconBtn,
  StageBadge,
  emptySchool,
  SchoolModal,
  ImportModal,
  joursEcoules,
}) {
  const [search, setSearch] = useState("");
  const [fZone, setFZone] = useState("");
  const [fTech, setFTech] = useState("");
  const [fStage, setFStage] = useState("");
  const [fEtat, setFEtat] = useState("");
  const [editing, setEditing] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      if (fZone && s.zone !== fZone) return false;
      if (fTech && s.techno !== fTech) return false;
      if (fStage && s.stage !== fStage) return false;
      if (fEtat && s.etatDemande !== fEtat) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(
          s.nom.toLowerCase().includes(q) ||
          s.zone.toLowerCase().includes(q) ||
          s.ief.toLowerCase().includes(q) ||
          s.contact.toLowerCase().includes(q) ||
          (s.numDemande && s.numDemande.toLowerCase().includes(q))
        )) return false;
      }
      return true;
    });
  }, [schools, search, fZone, fTech, fStage, fEtat]);

  const saveSchool = (school) => {
    setSchools((prev) => {
      const exists = prev.some((p) => p.id === school.id);
      return exists ? prev.map((p) => (p.id === school.id ? school : p)) : [...prev, school];
    });
    setEditing(null);
  };

  const deleteSchool = (id) => {
    if (!window.confirm) {
      setSchools((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    if (window.confirm("Supprimer définitivement cet établissement ?")) {
      setSchools((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Export CSV (legacy)
  const exportCSV = () => {
    const cols = [
      "nom", "adresse", "zone", "ief", "contact", "telephone", "techno",
      "dateEnr", "numDemande", "support", "datePrevue", "statutInstall",
      "dateReelle", "dateMES", "stage", "etatDemande", "commentaire"
    ];
    const csv = Papa.unparse({
      fields: cols,
      data: filtered.map((s) => cols.map((c) => s[c] ?? ""))
    });
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `etablissements_connectivite_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export CSV impossible", e);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    try {
      const dataToExport = filtered.map(s => ({ ...s, stage: s.stage }));
      exportToExcel(dataToExport);
      setImportMessage("✅ Export Excel réussi !");
      setTimeout(() => setImportMessage(""), 3000);
    } catch (error) {
      setImportMessage(`❌ Erreur export : ${error.message}`);
      setTimeout(() => setImportMessage(""), 5000);
    }
  };

  // Import Excel
  const handleImportExcel = async (file) => {
    try {
      const imported = await importFromExcel(file);
      const shouldMerge = confirm(
        `${imported.length} établissement(s) trouvé(s).\n\n` +
        'Ajouter à la liste existante?\n' +
        '(OK = Ajouter, Annuler = Remplacer)'
      );

      if (shouldMerge) {
        setSchools([...schools, ...imported]);
      } else {
        setSchools(imported);
      }

      setImportMessage(`✅ ${imported.length} établissement(s) importé(s) !`);
      setTimeout(() => setImportMessage(""), 3000);
    } catch (error) {
      setImportMessage(`❌ Erreur import : ${error.message}`);
      setTimeout(() => setImportMessage(""), 5000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Message de feedback */}
      {importMessage && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 9,
            fontSize: 12.5,
            background: importMessage.includes("✅") ? C.greenDim : "#4A2020",
            color: importMessage.includes("✅") ? C.green : C.red,
            border: `1px solid ${importMessage.includes("✅") ? C.green : C.red}44`,
          }}
        >
          {importMessage}
        </div>
      )}

      {/* Barre de contrôle */}
      <div style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Filtres */}
        <div style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          flex: 1,
          minWidth: 280
        }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search size={14} color={C.faint} style={{ position: "absolute", left: 10, top: 10 }} />
            <TextInput
              placeholder="Rechercher une école, zone, IEF, contact ou numéro…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 30 }}
            />
          </div>
          <Select value={fZone} onChange={(e) => setFZone(e.target.value)} style={{ width: 150 }}>
            <option value="">Toutes zones</option>
            {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
          </Select>
          <Select value={fTech} onChange={(e) => setFTech(e.target.value)} style={{ width: 150 }}>
            <option value="">Toutes technologies</option>
            {TECHNOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select value={fStage} onChange={(e) => setFStage(e.target.value)} style={{ width: 190 }}>
            <option value="">Tous statuts</option>
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={fEtat} onChange={(e) => setFEtat(e.target.value)} style={{ width: 150 }}>
            <option value="">Tous états demande</option>
            <option value="">Non démarré</option>
            <option value="EN">Enregistré (EN)</option>
            <option value="RE">Enregistré (RE)</option>
            <option value="VA">Installation (VA)</option>
            <option value="MSV">Mise en service (MSV)</option>
          </Select>
        </div>

        {/* Boutons d'action */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
          <Btn icon={Plus} small onClick={() => setEditing(emptySchool())}>
            Ajouter une école
          </Btn>
        </div>
      </div>

      {/* Statistiques */}
      <div style={{ fontSize: 12, color: C.muted }}>
        {filtered.length} établissement{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""} sur {schools.length}
      </div>

      {/* Tableau */}
      <div style={{
        background: C.panel,
        border: `1px solid ${C.borderSoft}`,
        borderRadius: 14,
        overflow: "hidden"
      }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr style={{ background: C.panelAlt }}>
                {[
                  "N° DEMANDE",
                  "ETAT",
                  "École",
                  "Zone / IEF",
                  "Techno",
                  "Statut",
                  "Jours",
                  "Contact",
                  ""
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 14px",
                      fontSize: 11,
                      color: C.muted,
                      fontWeight: 600,
                      borderBottom: `1px solid ${C.borderSoft}`,
                      whiteSpace: "nowrap"
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const TechIcon = TECH_ICON[s.techno] || null;
                const je = joursEcoules(s);
                return (
                  <tr
                    key={s.id}
                    style={{ borderBottom: `1px solid ${C.borderSoft}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.panelAlt)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* N° DEMANDE */}
                    <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600, color: C.textDim, maxWidth: 140 }}>
                      {s.numDemande ? (
                        <span style={{ ...mono }}>{s.numDemande}</span>
                      ) : (
                        <span style={{ color: C.faint }}>—</span>
                      )}
                    </td>

                    {/* ETAT DEMANDE */}
                    <td style={{ padding: "10px 14px" }}>
                      <EtatBadge etat={s.etatDemande || ''} />
                    </td>

                    {/* École */}
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, maxWidth: 220 }}>
                      {s.nom}
                    </td>

                    {/* Zone / IEF */}
                    <td style={{ padding: "10px 14px", fontSize: 12, color: C.textDim }}>
                      <div>{s.zone}</div>
                      <div style={{ fontSize: 10.5, color: C.faint }}>{s.ief}</div>
                    </td>

                    {/* Techno */}
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.textDim }}>
                        {TechIcon && <TechIcon size={13} color={C.muted} />}
                        {s.techno}
                      </div>
                    </td>

                    {/* Statut */}
                    <td style={{ padding: "10px 14px" }}>
                      <StageBadge stage={s.stage} />
                    </td>

                    {/* Jours */}
                    <td style={{ padding: "10px 14px", ...mono, fontSize: 12, color: C.muted }}>
                      {je === null ? "—" : `${je} j`}
                    </td>

                    {/* Contact */}
                    <td style={{ padding: "10px 14px", fontSize: 12, color: C.textDim }}>
                      <div>{s.contact || "—"}</div>
                      <div style={{ fontSize: 10.5, color: C.faint }}>{s.telephone}</div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <IconBtn
                          icon={Pencil}
                          title="Modifier"
                          onClick={() => setEditing(s)}
                        />
                        <IconBtn
                          icon={Trash2}
                          title="Supprimer"
                          danger
                          onClick={() => deleteSchool(s.id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: 30,
                      textAlign: "center",
                      color: C.faint,
                      fontSize: 13
                    }}
                  >
                    Aucun établissement ne correspond à ces filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {editing && <SchoolModal school={editing} onClose={() => setEditing(null)} onSave={saveSchool} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={(rows) => { setSchools((prev) => [...prev, ...rows]); setShowImport(false); }} />}
    </div>
  );
}

export default SchoolsTabUpdated;
