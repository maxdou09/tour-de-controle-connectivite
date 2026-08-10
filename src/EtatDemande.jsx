/**
 * Composant pour gérer l'état de la demande
 * États : EN (Enregistré), RE (Enregistré alt), VA (Installation), MSV (Mise en Service)
 */

import React from 'react';

const C = {
  bg: "#0A1220",
  panel: "#111B2E",
  border: "#233252",
  text: "#EAF0FB",
  textDim: "#B7C2DA",
  muted: "#7C89A6",
  green: "#34D399",
  greenDim: "#1B4B3C",
  amber: "#FBBF24",
  amberDim: "#4A3B14",
  red: "#F87171",
  redDim: "#4A2020",
  blue: "#60A5FA",
  blueDim: "#1C3556",
};

const ETAT_OPTIONS = [
  { value: '', label: 'Non démarré', color: C.muted, dim: '#4C5975' },
  { value: 'EN', label: 'Enregistré (EN)', color: C.blue, dim: C.blueDim },
  { value: 'RE', label: 'Enregistré (RE)', color: C.blue, dim: C.blueDim },
  { value: 'VA', label: 'Installation en cours (VA)', color: C.amber, dim: C.amberDim },
  { value: 'MSV', label: 'Mise en service (MSV)', color: C.green, dim: C.greenDim },
];

/**
 * Badge affichant l'état de la demande
 */
export function EtatBadge({ etat }) {
  const option = ETAT_OPTIONS.find(o => o.value === etat) || ETAT_OPTIONS[0];
  
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 600,
        color: option.color,
        background: option.dim,
        border: `1px solid ${option.color}33`,
        whiteSpace: 'nowrap',
      }}
    >
      {etat || '—'}
    </span>
  );
}

/**
 * Select dropdown pour l'état de la demande
 */
export function EtatSelect({ value, onChange }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: '8px 10px',
        color: C.text,
        fontSize: 13,
        outline: 'none',
        fontFamily: "'Inter', sans-serif",
        width: '100%',
        cursor: 'pointer',
      }}
    >
      {ETAT_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Légende explicative des états
 */
export function EtatLegend() {
  return (
    <div style={{
      background: C.panel,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 16,
      fontSize: 12.5,
      color: C.textDim,
      lineHeight: 1.6,
    }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 10 }}>
        États de Demande (ETAT DEMANDE)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <strong style={{ color: C.muted }}>Vide</strong> : Non démarré (demande pas encore enregistrée)
        </div>
        <div>
          <strong style={{ color: C.blue }}>EN</strong> : Enregistré (demande enregistrée - état 1)
        </div>
        <div>
          <strong style={{ color: C.blue }}>RE</strong> : Enregistré (demande enregistrée - état 2)
        </div>
        <div>
          <strong style={{ color: C.amber }}>VA</strong> : Installation en cours (Validation/Activation)
        </div>
        <div>
          <strong style={{ color: C.green }}>MSV</strong> : Mise en Service (installation complétée et validée)
        </div>
      </div>
    </div>
  );
}

export default EtatBadge;
