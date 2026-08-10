import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  Wifi, Radio, Satellite, Search, Plus, X, Check, AlertTriangle, Calendar,
  Users, FileText, Download, Upload, ChevronRight, ChevronDown, Pencil, Trash2,
  Save, LayoutGrid, List, MessageSquare, BarChart3, Building2, Phone, Clock,
  Signal, Copy, RefreshCw, MapPin, ArrowUpRight, CircleSlash,
} from "lucide-react";
import Papa from "papaparse";

/* ============================================================================
   DESIGN TOKENS — "Tour de contrôle" : centre d'exploitation réseau nocturne.
   Le motif signature est la barre de signal (comme sur un téléphone) utilisée
   partout où l'on affiche une progression ou un statut de connectivité.
============================================================================ */
const C = {
  bg: "#0A1220",
  bgGrad: "linear-gradient(180deg,#0A1220 0%,#0D1729 100%)",
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
  redDim: "#4A2020",
  blue: "#60A5FA",
  blueDim: "#1C3556",
  cyan: "#22D3EE",
  slate: "#5B6B8C",
  slateDim: "#26314A",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const body = { fontFamily: "'Inter', sans-serif" };
const mono = { fontFamily: "'IBM Plex Mono', monospace" };

/* ============================================================================
   DOMAIN CONSTANTS
============================================================================ */
const TECHNOS = ["Flybox 4G", "5G", "Fibre", "VSAT"];
const TECH_ICON = { "Flybox 4G": Radio, "5G": Signal, "Fibre": Wifi, "VSAT": Satellite };
const INSTALL_STATUSES = ["Non démarré", "Planifiée", "En cours", "Installée", "Bloquée"];

const ZONES_IEF = {
  "Dakar": ["IEF Dakar Plateau", "IEF Pikine", "IEF Guédiawaye", "IEF Rufisque"],
  "Thiès": ["IEF Thiès Ville", "IEF Mbour", "IEF Tivaouane"],
  "Saint-Louis": ["IEF Saint-Louis", "IEF Dagana", "IEF Podor"],
  "Kaolack": ["IEF Kaolack", "IEF Nioro", "IEF Guinguinéo"],
  "Ziguinchor": ["IEF Ziguinchor", "IEF Bignona", "IEF Oussouye"],
  "Tambacounda": ["IEF Tambacounda", "IEF Bakel", "IEF Goudiry"],
  "Kolda": ["IEF Kolda", "IEF Vélingara"],
  "Fatick": ["IEF Fatick", "IEF Gossas", "IEF Foundiougne"],
  "Louga": ["IEF Louga", "IEF Kébémer", "IEF Linguère"],
  "Matam": ["IEF Matam", "IEF Kanel"],
};
const ZONES = Object.keys(ZONES_IEF);
const ALL_IEFS = Object.values(ZONES_IEF).flat();

const STAGES = [
  "Non démarré",
  "Demande enregistrée",
  "Installation en cours",
  "Installée - en attente MES",
  "En service",
  "Bloqué",
];

const STAGE_META = {
  "Non démarré": { color: C.slate, dim: C.slateDim, level: 0, icon: CircleSlash },
  "Demande enregistrée": { color: C.blue, dim: C.blueDim, level: 1, icon: FileText },
  "Installation en cours": { color: C.amber, dim: C.amberDim, level: 3, icon: RefreshCw },
  "Installée - en attente MES": { color: C.amber, dim: C.amberDim, level: 4, icon: Check },
  "En service": { color: C.green, dim: C.greenDim, level: 5, icon: Wifi },
  "Bloqué": { color: C.red, dim: C.redDim, level: -1, icon: AlertTriangle },
};

function computeStage(s) {
  if (s.dateMES) return "En service";
  if (s.dateReelle) return "Installée - en attente MES";
  if (s.statutInstall === "Bloquée") return "Bloqué";
  if (s.statutInstall === "En cours" || s.statutInstall === "Planifiée") return "Installation en cours";
  if (s.numDemande) return "Demande enregistrée";
  return "Non démarré";
}

function daysBetween(a, b) {
  const d1 = new Date(a), d2 = new Date(b);
  return Math.round((d2 - d1) / 86400000);
}

function joursEcoules(s) {
  if (!s.dateEnr) return null;
  const end = s.dateMES || new Date().toISOString().slice(0, 10);
  return Math.max(0, daysBetween(s.dateEnr, end));
}

/* ============================================================================
   SEED DATA — realistic illustrative sample, replaced by the PM's real data
============================================================================ */
function seedSchools() {
  const lieux = ["Diamalaye", "Keur Massar", "Nguékhokh", "Sanghé", "Léona", "Darou", "Ndiareme",
    "Diakhao", "Tivaouane Peulh", "Ndioum", "Yoff", "Grand Yoff", "Sam Notaire", "Colobane",
    "Médina", "Cité Millionnaire", "Diourbel Nord", "Mbao", "Malika", "Bambey", "Ross Béthio",
    "Richard Toll", "Kolda Centre", "Vélingara Centre", "Ziguinchor Nord", "Oussouye Village",
    "Kaolack Nord", "Nioro Centre", "Fatick Centre", "Foundiougne Village", "Louga Centre",
    "Kébémer Village", "Tambacounda Centre", "Bakel Village", "Matam Centre", "Kanel Village",
    "Sédhiou Centre", "Bounkiling Village", "Kaffrine Centre", "Birkilane Village"];
  const types = ["EE", "CEM", "Lycée", "École primaire", "Collège"];
  const prenoms = ["Moussa", "Fatou", "Ibrahima", "Aïssatou", "Cheikh", "Awa", "Ousmane", "Mariama", "Abdoulaye", "Khady"];
  const noms = ["Diop", "Ndiaye", "Fall", "Sow", "Ba", "Gueye", "Diallo", "Sarr", "Cissé", "Kane"];
  const supports = ["Équipe Support 1", "Équipe Support 2", "Équipe Support 3", "Opérateur Orange", "Opérateur Free", "Prestataire VSAT"];
  const stageWeights = [
    ["not_started", 0.15], ["registered", 0.15], ["planned", 0.10], ["in_progress", 0.15],
    ["installed", 0.10], ["in_service", 0.30], ["blocked", 0.05],
  ];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const weightedPick = (pairs) => {
    const r = Math.random(); let acc = 0;
    for (const [v, w] of pairs) { acc += w; if (r <= acc) return v; }
    return pairs[0][0];
  };
  const addDays = (dateStr, n) => {
    const d = new Date(dateStr); d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  const out = [];
  for (let i = 1; i <= 40; i++) {
    const zone = pick(ZONES);
    const ief = pick(ZONES_IEF[zone]);
    const lieu = lieux[(i - 1) % lieux.length];
    const nom = `${pick(types)} ${lieu}`;
    const techno = pick(TECHNOS);
    const stage = weightedPick(stageWeights);
    const base = "2025-09-01";
    const d0 = addDays(base, Math.floor(Math.random() * 300));

    let dateEnr = "", numDemande = "", support = "", datePrevue = "", statutInstall = "Non démarré",
      dateReelle = "", dateMES = "", commentaire = "";

    if (stage !== "not_started") { dateEnr = d0; numDemande = `DEM-2025-${1000 + i}`; support = pick(supports); }
    if (["planned", "in_progress", "installed", "in_service", "blocked"].includes(stage)) {
      datePrevue = addDays(d0, 5 + Math.floor(Math.random() * 15)); statutInstall = "Planifiée";
    }
    if (["in_progress", "installed", "in_service"].includes(stage)) statutInstall = "En cours";
    if (["installed", "in_service"].includes(stage)) {
      statutInstall = "Installée";
      dateReelle = addDays(datePrevue || d0, Math.floor(Math.random() * 10));
    }
    if (stage === "in_service") dateMES = addDays(dateReelle, Math.floor(Math.random() * 5));
    if (stage === "blocked") {
      statutInstall = "Bloquée";
      commentaire = pick([
        "Zone difficile d'accès - retard livraison équipement",
        "Absence de réseau électrique sur site",
        "Attente autorisation IEF",
        "Site non accessible (route coupée)",
      ]);
    } else if (stage === "registered") {
      commentaire = "En attente de planification du support technique";
    }

    out.push({
      id: `sch-${i}`, nom, adresse: `Quartier ${lieu}, ${zone}`, zone, ief,
      contact: `${pick(prenoms)} ${pick(noms)}`,
      telephone: `77 ${100 + Math.floor(Math.random() * 899)} ${10 + Math.floor(Math.random() * 89)} ${10 + Math.floor(Math.random() * 89)}`,
      techno, dateEnr, numDemande, support, datePrevue, statutInstall, dateReelle, dateMES, commentaire,
    });
  }
  return out;
}

const emptySchool = () => ({
  id: `sch-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
  nom: "", adresse: "", zone: ZONES[0], ief: ZONES_IEF[ZONES[0]][0], contact: "", telephone: "",
  techno: TECHNOS[0], dateEnr: "", numDemande: "", support: "", datePrevue: "",
  statutInstall: "Non démarré", dateReelle: "", dateMES: "", commentaire: "",
});

/* ============================================================================
   SMALL UI PRIMITIVES
============================================================================ */
function SignalBars({ level, size = "md", blocked = false }) {
  const heights = size === "lg" ? [10, 16, 22, 28, 34] : size === "sm" ? [5, 8, 11, 14, 17] : [7, 11, 15, 19, 23];
  const w = size === "lg" ? 6 : size === "sm" ? 3 : 4;
  const gap = size === "lg" ? 4 : 2.5;
  if (blocked) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <AlertTriangle size={size === "lg" ? 22 : 14} color={C.red} />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: w, height: h, borderRadius: 2,
            background: i < level ? C.green : C.borderSoft,
            transition: "background 0.4s ease",
          }}
        />
      ))}
    </div>
  );
}

function Badge({ children, color, dim }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px",
        borderRadius: 999, fontSize: 11.5, fontWeight: 600, color,
        background: dim, border: `1px solid ${color}33`, whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function StageBadge({ stage }) {
  const meta = STAGE_META[stage] || STAGE_META["Non démarré"];
  const Icon = meta.icon;
  return (
    <Badge color={meta.color} dim={meta.dim}>
      <Icon size={12} />
      {stage}
    </Badge>
  );
}

function IconBtn({ icon: Icon, onClick, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: 8,
        background: "transparent", border: `1px solid ${C.border}`, cursor: "pointer",
        color: danger ? C.red : C.textDim,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = danger ? C.redDim : C.panelHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon size={14} />
    </button>
  );
}

function Btn({ children, onClick, variant = "primary", icon: Icon, small, disabled }) {
  const styles = {
    primary: { background: C.green, color: "#062017", border: "1px solid transparent" },
    ghost: { background: "transparent", color: C.text, border: `1px solid ${C.border}` },
    subtle: { background: C.panelAlt, color: C.textDim, border: `1px solid ${C.border}` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant], display: "inline-flex", alignItems: "center", gap: 7,
        padding: small ? "6px 11px" : "9px 16px", borderRadius: 9,
        fontSize: small ? 12.5 : 13.5, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, ...body, whiteSpace: "nowrap",
      }}
    >
      {Icon && <Icon size={small ? 13 : 15} />}
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: C.muted, letterSpacing: 0.3 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: 8,
  padding: "8px 10px", color: C.text, fontSize: 13, outline: "none", ...body, width: "100%",
};

function TextInput(props) { return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />; }
function Select({ children, ...props }) { return <select {...props} style={{ ...inputStyle, ...(props.style || {}) }}>{children}</select>; }

/* ============================================================================
   MAIN APP
============================================================================ */
export default function App() {
  const [ready, setReady] = useState(false);
  const [schools, setSchools] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [goal, setGoal] = useState(6000);
  const [tab, setTab] = useState("dashboard");
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const firstLoad = useRef(true);

  // ---- Load from persistent storage ----
  useEffect(() => {
    (async () => {
      try {
        let sc = [];
        try {
          const r = await window.storage.get("schools", false);
          sc = r?.value ? JSON.parse(r.value) : null;
        } catch { sc = null; }
        if (!sc || !sc.length) sc = seedSchools();

        let mt = [];
        try {
          const r = await window.storage.get("meetings", false);
          mt = r?.value ? JSON.parse(r.value) : [];
        } catch { mt = []; }

        let g = 6000;
        try {
          const r = await window.storage.get("goal", false);
          g = r?.value ? JSON.parse(r.value) : 6000;
        } catch { g = 6000; }

        setSchools(sc); setMeetings(mt); setGoal(g);
      } catch (e) {
        console.error("Erreur de chargement", e);
        setSchools(seedSchools());
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // ---- Persist on change ----
  useEffect(() => {
    if (!ready) return;
    if (firstLoad.current) { firstLoad.current = false; return; }
    setSaveState("saving");
    const t = setTimeout(async () => {
      try {
        await window.storage.set("schools", JSON.stringify(schools), false);
        setSaveState("saved");
      } catch (e) { console.error("Erreur de sauvegarde", e); setSaveState("idle"); }
    }, 400);
    return () => clearTimeout(t);
  }, [schools, ready]);

  useEffect(() => {
    if (!ready) return;
    (async () => { try { await window.storage.set("meetings", JSON.stringify(meetings), false); } catch (e) { console.error(e); } })();
  }, [meetings, ready]);

  useEffect(() => {
    if (!ready) return;
    (async () => { try { await window.storage.set("goal", JSON.stringify(goal), false); } catch (e) { console.error(e); } })();
  }, [goal, ready]);

  // ---- Derived data ----
  const withStage = useMemo(() => schools.map((s) => ({ ...s, stage: computeStage(s) })), [schools]);
  const counts = useMemo(() => {
    const c = Object.fromEntries(STAGES.map((s) => [s, 0]));
    withStage.forEach((s) => { c[s.stage] = (c[s.stage] || 0) + 1; });
    return c;
  }, [withStage]);
  const total = schools.length;
  const enService = counts["En service"] || 0;
  const pctGoal = goal ? Math.min(1, enService / goal) : 0;
  const pctOfTracked = total ? enService / total : 0;

  if (!ready) {
    return (
      <div style={{ ...body, background: C.bg, minHeight: 500, display: "grid", placeItems: "center", color: C.muted }}>
        <style>{FONTS}</style>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <RefreshCw size={16} className="spin" />
          Chargement de la tour de contrôle…
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bgGrad, minHeight: "100%", color: C.text, ...body }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        ::selection { background: ${C.green}55; }
        .spin { animation: spin 1.2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
        input:focus, select:focus, textarea:focus { border-color: ${C.green} !important; box-shadow: 0 0 0 3px ${C.green}22; }
        table { border-collapse: collapse; width: 100%; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 8px; }
        .tab-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <TopBar total={total} counts={counts} goal={goal} pctGoal={pctGoal} saveState={saveState} />
      <TabNav tab={tab} setTab={setTab} counts={counts} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "22px 24px 60px" }}>
        {tab === "dashboard" && (
          <Dashboard schools={withStage} counts={counts} total={total} goal={goal} setGoal={setGoal} pctGoal={pctGoal} />
        )}
        {tab === "schools" && (
          <SchoolsTab schools={withStage} setSchools={setSchools} />
        )}
        {tab === "kanban" && (
          <KanbanTab schools={withStage} setSchools={setSchools} />
        )}
        {tab === "sync" && (
          <SyncTab meetings={meetings} setMeetings={setMeetings} />
        )}
        {tab === "reporting" && (
          <ReportingTab schools={withStage} counts={counts} total={total} goal={goal} />
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   TOP BAR — hero signature: global signal tower toward the 6000-school goal
============================================================================ */
function TopBar({ total, counts, goal, pctGoal, saveState }) {
  const level = Math.round(pctGoal * 5);
  return (
    <div style={{ borderBottom: `1px solid ${C.borderSoft}`, background: "rgba(10,18,32,0.7)", backdropFilter: "blur(6px)", position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "18px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11, background: `linear-gradient(135deg, ${C.green}, ${C.cyan})`,
            display: "grid", placeItems: "center", boxShadow: `0 0 24px ${C.green}55`,
          }}>
            <Wifi size={22} color="#06201A" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ ...display, fontSize: 19, fontWeight: 700, letterSpacing: -0.3 }}>Tour de Contrôle Connectivité</div>
            <div style={{ fontSize: 12, color: C.muted }}>Écoles du Sénégal · Flybox 4G · 5G · Fibre · VSAT</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SignalBars level={level} size="lg" />
            <div>
              <div style={{ ...mono, fontSize: 15, fontWeight: 600 }}>
                {counts["En service"]} <span style={{ color: C.faint }}>/</span> {goal.toLocaleString("fr-FR")}
              </div>
              <div style={{ fontSize: 10.5, color: C.muted }}>écoles en service · objectif</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <MiniStat label="suivies" value={total} color={C.textDim} />
            <MiniStat label="en cours" value={(counts["Installation en cours"] || 0) + (counts["Installée - en attente MES"] || 0)} color={C.amber} />
            <MiniStat label="bloquées" value={counts["Bloqué"] || 0} color={C.red} />
          </div>

          <div style={{ fontSize: 11, color: C.faint, display: "flex", alignItems: "center", gap: 6, minWidth: 92 }}>
            {saveState === "saving" && <><RefreshCw size={11} className="spin" /> Sauvegarde…</>}
            {saveState === "saved" && <><Check size={11} color={C.green} /> Enregistré</>}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ ...mono, fontSize: 17, fontWeight: 600, color }}>{value}</div>
      <div style={{ fontSize: 9.5, color: C.faint, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
    </div>
  );
}

function TabNav({ tab, setTab, counts }) {
  const tabs = [
    { id: "dashboard", label: "Vue d'ensemble", icon: BarChart3 },
    { id: "schools", label: "Établissements", icon: Building2 },
    { id: "kanban", label: "Pipeline", icon: LayoutGrid },
    { id: "sync", label: "Synchronisation", icon: MessageSquare },
    { id: "reporting", label: "Rapports", icon: FileText },
  ];
  return (
    <div className="tab-scroll" style={{ borderBottom: `1px solid ${C.borderSoft}`, overflowX: "auto", background: C.bg }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", gap: 4 }}>
        {tabs.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "12px 14px",
                background: "transparent", border: "none", cursor: "pointer",
                color: active ? C.green : C.muted, fontSize: 13, fontWeight: 600, ...body,
                borderBottom: `2px solid ${active ? C.green : "transparent"}`, whiteSpace: "nowrap",
              }}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   DASHBOARD
============================================================================ */
function Dashboard({ schools, counts, total, goal, setGoal, pctGoal }) {
  const byTech = useMemo(() => {
    return TECHNOS.map((t) => {
      const items = schools.filter((s) => s.techno === t);
      return { techno: t, total: items.length, enService: items.filter((s) => s.stage === "En service").length };
    });
  }, [schools]);

  const byZone = useMemo(() => {
    return ZONES.map((z) => {
      const items = schools.filter((s) => s.zone === z);
      return { zone: z, total: items.length, enService: items.filter((s) => s.stage === "En service").length };
    }).filter((z) => z.total > 0).sort((a, b) => b.total - a.total);
  }, [schools]);

  const blocked = schools.filter((s) => s.stage === "Bloqué");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* HERO */}
      <div style={{ background: C.panel, border: `1px solid ${C.borderSoft}`, borderRadius: 16, padding: 26, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>Progression vers l'objectif national</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ ...display, fontSize: 44, fontWeight: 700, color: C.green }}>{counts["En service"]}</span>
            <span style={{ fontSize: 18, color: C.faint }}>/</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="number" value={goal} onChange={(e) => setGoal(Math.max(1, Number(e.target.value) || 0))}
                style={{ ...inputStyle, width: 92, ...mono, fontSize: 18, fontWeight: 600, padding: "4px 8px" }}
              />
              <span style={{ fontSize: 13, color: C.muted }}>écoles</span>
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: C.textDim, marginTop: 6 }}>
            {(pctGoal * 100).toFixed(1)}% de l'objectif atteint · {total} établissement{total > 1 ? "s" : ""} suivi{total > 1 ? "s" : ""} dans l'outil
          </div>
        </div>
        <SignalTower pct={pctGoal} />
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12 }}>
        {STAGES.map((stage) => {
          const meta = STAGE_META[stage];
          const Icon = meta.icon;
          return (
            <div key={stage} style={{ background: C.panel, border: `1px solid ${C.borderSoft}`, borderRadius: 13, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: meta.dim, display: "grid", placeItems: "center" }}>
                  <Icon size={13} color={meta.color} />
                </div>
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{stage}</span>
              </div>
              <div style={{ ...mono, fontSize: 24, fontWeight: 600, color: meta.color }}>{counts[stage] || 0}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, alignItems: "stretch" }}>
        <div style={{ background: C.panel, border: `1px solid ${C.borderSoft}`, borderRadius: 16, padding: 20 }}>
          <SectionTitle icon={BarChart3}>Total vs en service, par technologie</SectionTitle>
          <div style={{ height: 240, marginTop: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byTech} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} vertical={false} />
                <XAxis dataKey="techno" tick={{ fill: C.muted, fontSize: 11.5, fontFamily: "Inter" }} axisLine={{ stroke: C.borderSoft }} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12.5, color: C.text }} cursor={{ fill: C.panelHover }} />
                <Bar dataKey="total" name="Total" fill={C.slate} radius={[5, 5, 0, 0]} />
                <Bar dataKey="enService" name="En service" fill={C.green} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.borderSoft}`, borderRadius: 16, padding: 20 }}>
          <SectionTitle icon={MapPin}>Par zone</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12, maxHeight: 240, overflowY: "auto" }}>
            {byZone.map((z) => {
              const pct = z.total ? z.enService / z.total : 0;
              return (
                <div key={z.zone}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: C.textDim, fontWeight: 500 }}>{z.zone}</span>
                    <span style={{ ...mono, color: C.muted }}>{z.enService}/{z.total}</span>
                  </div>
                  <div style={{ height: 6, background: C.borderSoft, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct * 100}%`, background: C.green, borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Blocked alert */}
      {blocked.length > 0 && (
        <div style={{ background: C.redDim, border: `1px solid ${C.red}44`, borderRadius: 16, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={16} color={C.red} />
            <span style={{ fontWeight: 700, fontSize: 13.5, color: C.red }}>{blocked.length} établissement{blocked.length > 1 ? "s" : ""} bloqué{blocked.length > 1 ? "s" : ""} — nécessite{blocked.length > 1 ? "nt" : ""} une action</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {blocked.slice(0, 6).map((s) => (
              <div key={s.id} style={{ fontSize: 12.5, color: C.textDim, display: "flex", gap: 8 }}>
                <span style={{ fontWeight: 600, color: C.text, minWidth: 180 }}>{s.nom}</span>
                <span style={{ color: C.faint }}>·</span>
                <span>{s.commentaire || "Motif non renseigné"}</span>
              </div>
            ))}
            {blocked.length > 6 && <div style={{ fontSize: 11.5, color: C.muted }}>+ {blocked.length - 6} autre(s) — voir l'onglet Établissements</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: C.text }}>
      <Icon size={14} color={C.muted} /> {children}
    </div>
  );
}

function SignalTower({ pct }) {
  const bars = [0.2, 0.4, 0.6, 0.8, 1];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
      {bars.map((b, i) => {
        const filled = pct >= b - 0.001 || (pct > 0 && b === Math.ceil(pct * 5) / 5);
        const active = pct * 5 >= i + 1 || (pct * 5 > i && pct > 0);
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div
              style={{
                width: 16, height: `${b * 90}px`, borderRadius: 4,
                background: active ? `linear-gradient(180deg, ${C.cyan}, ${C.green})` : C.borderSoft,
                boxShadow: active ? `0 0 12px ${C.green}66` : "none",
                transition: "all 0.6s cubic-bezier(.4,0,.2,1)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================================
   ÉTABLISSEMENTS — table, filters, add/edit modal, CSV import/export
============================================================================ */
function SchoolsTab({ schools, setSchools }) {
  const [search, setSearch] = useState("");
  const [fZone, setFZone] = useState("");
  const [fTech, setFTech] = useState("");
  const [fStage, setFStage] = useState("");
  const [editing, setEditing] = useState(null); // school object or null
  const [showImport, setShowImport] = useState(false);

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      if (fZone && s.zone !== fZone) return false;
      if (fTech && s.techno !== fTech) return false;
      if (fStage && s.stage !== fStage) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(s.nom.toLowerCase().includes(q) || s.zone.toLowerCase().includes(q) || s.ief.toLowerCase().includes(q) || s.contact.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [schools, search, fZone, fTech, fStage]);

  const saveSchool = (school) => {
    setSchools((prev) => {
      const exists = prev.some((p) => p.id === school.id);
      return exists ? prev.map((p) => (p.id === school.id ? school : p)) : [...prev, school];
    });
    setEditing(null);
  };

  const deleteSchool = (id) => {
    if (!window.confirm) { setSchools((prev) => prev.filter((p) => p.id !== id)); return; }
    if (window.confirm("Supprimer définitivement cet établissement ?")) {
      setSchools((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const exportCSV = () => {
    const cols = ["nom", "adresse", "zone", "ief", "contact", "telephone", "techno", "dateEnr", "numDemande", "support", "datePrevue", "statutInstall", "dateReelle", "dateMES", "stage", "commentaire"];
    const csv = Papa.unparse({ fields: cols, data: filtered.map((s) => cols.map((c) => s[c] ?? "")) });
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "etablissements_connectivite.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error("Export impossible", e); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1, minWidth: 280 }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search size={14} color={C.faint} style={{ position: "absolute", left: 10, top: 10 }} />
            <TextInput placeholder="Rechercher une école, zone, IEF, contact…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
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
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="subtle" icon={Upload} small onClick={() => setShowImport(true)}>Importer CSV</Btn>
          <Btn variant="subtle" icon={Download} small onClick={exportCSV}>Exporter CSV</Btn>
          <Btn icon={Plus} small onClick={() => setEditing(emptySchool())}>Ajouter une école</Btn>
        </div>
      </div>

      <div style={{ fontSize: 12, color: C.muted }}>{filtered.length} établissement{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""} sur {schools.length}</div>

      <div style={{ background: C.panel, border: `1px solid ${C.borderSoft}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr style={{ background: C.panelAlt }}>
                {["École", "Zone / IEF", "Techno", "Statut", "Jours", "Contact", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.borderSoft}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const TechIcon = TECH_ICON[s.techno] || Radio;
                const je = joursEcoules(s);
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.borderSoft}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.panelAlt)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, maxWidth: 220 }}>{s.nom}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: C.textDim }}>
                      <div>{s.zone}</div>
                      <div style={{ fontSize: 10.5, color: C.faint }}>{s.ief}</div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.textDim }}>
                        <TechIcon size={13} color={C.muted} /> {s.techno}
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}><StageBadge stage={s.stage} /></td>
                    <td style={{ padding: "10px 14px", ...mono, fontSize: 12, color: C.muted }}>{je === null ? "—" : `${je} j`}</td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: C.textDim }}>
                      <div>{s.contact || "—"}</div>
                      <div style={{ fontSize: 10.5, color: C.faint }}>{s.telephone}</div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <IconBtn icon={Pencil} title="Modifier" onClick={() => setEditing(s)} />
                        <IconBtn icon={Trash2} title="Supprimer" danger onClick={() => deleteSchool(s.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 30, textAlign: "center", color: C.faint, fontSize: 13 }}>Aucun établissement ne correspond à ces filtres.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <SchoolModal school={editing} onClose={() => setEditing(null)} onSave={saveSchool} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={(rows) => { setSchools((prev) => [...prev, ...rows]); setShowImport(false); }} />}
    </div>
  );
}

function SchoolModal({ school, onClose, onSave }) {
  const [s, setS] = useState(school);
  const set = (k) => (e) => setS((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(6,10,18,0.7)", display: "grid", placeItems: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, width: 640, maxWidth: "100%", maxHeight: "88vh", overflowY: "auto", padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ ...display, fontSize: 17, fontWeight: 700 }}>{school.nom ? "Modifier l'établissement" : "Ajouter un établissement"}</div>
          <IconBtn icon={X} onClick={onClose} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "1 / -1" }}><Field label="Nom de l'établissement"><TextInput value={s.nom} onChange={set("nom")} placeholder="Ex. CEM Diamalaye" /></Field></div>
          <div style={{ gridColumn: "1 / -1" }}><Field label="Adresse"><TextInput value={s.adresse} onChange={set("adresse")} /></Field></div>

          <Field label="Zone">
            <Select value={s.zone} onChange={(e) => setS((p) => ({ ...p, zone: e.target.value, ief: ZONES_IEF[e.target.value][0] }))}>
              {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </Select>
          </Field>
          <Field label="IEF">
            <Select value={s.ief} onChange={set("ief")}>
              {(ZONES_IEF[s.zone] || ALL_IEFS).map((i) => <option key={i} value={i}>{i}</option>)}
            </Select>
          </Field>

          <Field label="Principal / Proviseur"><TextInput value={s.contact} onChange={set("contact")} /></Field>
          <Field label="Téléphone"><TextInput value={s.telephone} onChange={set("telephone")} placeholder="77 000 00 00" /></Field>

          <Field label="Technologie prévue">
            <Select value={s.techno} onChange={set("techno")}>{TECHNOS.map((t) => <option key={t} value={t}>{t}</option>)}</Select>
          </Field>
          <Field label="Support technique assigné"><TextInput value={s.support} onChange={set("support")} placeholder="Ex. Équipe Support 2" /></Field>

          <Field label="Date enregistrement demande (SI)"><TextInput type="date" value={s.dateEnr} onChange={set("dateEnr")} /></Field>
          <Field label="N° de demande (SI)"><TextInput value={s.numDemande} onChange={set("numDemande")} placeholder="DEM-2026-XXXX" /></Field>

          <Field label="Statut installation">
            <Select value={s.statutInstall} onChange={set("statutInstall")}>{INSTALL_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}</Select>
          </Field>
          <Field label="Date installation prévue"><TextInput type="date" value={s.datePrevue} onChange={set("datePrevue")} /></Field>

          <Field label="Date installation réalisée"><TextInput type="date" value={s.dateReelle} onChange={set("dateReelle")} /></Field>
          <Field label="Date mise en service"><TextInput type="date" value={s.dateMES} onChange={set("dateMES")} /></Field>

          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Commentaires / Blocages">
              <textarea value={s.commentaire} onChange={set("commentaire")} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
          <StageBadge stage={computeStage(s)} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
            <Btn icon={Save} onClick={() => onSave(s)} disabled={!s.nom.trim()}>Enregistrer</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImportModal({ onClose, onImport }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const doImport = () => {
    setError("");
    try {
      const parsed = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
      if (parsed.errors?.length && !parsed.data?.length) { setError("CSV illisible. Vérifiez le format."); return; }
      const rows = parsed.data.map((r, i) => ({
        id: `sch-imp-${Date.now()}-${i}`,
        nom: r.nom || r.Nom || "",
        adresse: r.adresse || r.Adresse || "",
        zone: r.zone || r.Zone || ZONES[0],
        ief: r.ief || r.IEF || "",
        contact: r.contact || r.Contact || "",
        telephone: r.telephone || r.Téléphone || r.telephone_contact || "",
        techno: TECHNOS.includes(r.techno) ? r.techno : (r.techno || TECHNOS[0]),
        dateEnr: r.dateEnr || "", numDemande: r.numDemande || "", support: r.support || "",
        datePrevue: r.datePrevue || "", statutInstall: r.statutInstall || "Non démarré",
        dateReelle: r.dateReelle || "", dateMES: r.dateMES || "", commentaire: r.commentaire || "",
      })).filter((r) => r.nom.trim());
      if (!rows.length) { setError("Aucune ligne valide trouvée (colonne 'nom' requise)."); return; }
      onImport(rows);
    } catch (e) { setError("Erreur d'import : " + e.message); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(6,10,18,0.7)", display: "grid", placeItems: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, width: 640, maxWidth: "100%", padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ ...display, fontSize: 17, fontWeight: 700 }}>Importer des établissements (CSV)</div>
          <IconBtn icon={X} onClick={onClose} />
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
          Collez ci-dessous un CSV avec en-têtes : <span style={{ ...mono, color: C.textDim }}>nom,adresse,zone,ief,contact,telephone,techno</span>
        </div>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} rows={10}
          placeholder={"nom,adresse,zone,ief,contact,telephone,techno\nCEM Exemple,Quartier X,Dakar,IEF Pikine,Nom Contact,77 000 00 00,Fibre"}
          style={{ ...inputStyle, ...mono, fontSize: 12, resize: "vertical" }}
        />
        {error && <div style={{ color: C.red, fontSize: 12.5, marginTop: 8 }}>{error}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn icon={Upload} onClick={doImport} disabled={!text.trim()}>Importer</Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   PIPELINE (KANBAN)
============================================================================ */
function KanbanTab({ schools, setSchools }) {
  const cols = STAGES;
  const [dragId, setDragId] = useState(null);

  const moveTo = (school, stage) => {
    setSchools((prev) => prev.map((p) => {
      if (p.id !== school.id) return p;
      const upd = { ...p };
      if (stage === "Non démarré") { upd.numDemande = ""; upd.statutInstall = "Non démarré"; upd.dateReelle = ""; upd.dateMES = ""; }
      if (stage === "Demande enregistrée") { if (!upd.numDemande) upd.numDemande = `DEM-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`; upd.statutInstall = "Planifiée"; upd.dateReelle = ""; upd.dateMES = ""; }
      if (stage === "Installation en cours") { upd.statutInstall = "En cours"; upd.dateReelle = ""; upd.dateMES = ""; }
      if (stage === "Installée - en attente MES") { upd.statutInstall = "Installée"; if (!upd.dateReelle) upd.dateReelle = new Date().toISOString().slice(0, 10); upd.dateMES = ""; }
      if (stage === "En service") { if (!upd.dateReelle) upd.dateReelle = new Date().toISOString().slice(0, 10); if (!upd.dateMES) upd.dateMES = new Date().toISOString().slice(0, 10); }
      if (stage === "Bloqué") { upd.statutInstall = "Bloquée"; }
      return upd;
    }));
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
        Glissez une carte vers une autre colonne pour faire avancer le dossier — le statut et les dates se mettent à jour automatiquement.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, minmax(220px, 1fr))`, gap: 12, overflowX: "auto" }}>
        {cols.map((stage) => {
          const meta = STAGE_META[stage];
          const items = schools.filter((s) => s.stage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const s = schools.find((x) => x.id === dragId); if (s) moveTo(s, stage); }}
              style={{ background: C.panel, border: `1px solid ${C.borderSoft}`, borderRadius: 14, padding: 12, minHeight: 200 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <meta.icon size={13} color={meta.color} />
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: meta.color }}>{stage}</span>
                </div>
                <span style={{ ...mono, fontSize: 11, color: C.muted }}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 460, overflowY: "auto" }}>
                {items.map((s) => (
                  <div
                    key={s.id} draggable onDragStart={() => setDragId(s.id)}
                    style={{ background: C.panelAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, cursor: "grab" }}
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>{s.nom}</div>
                    <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 6 }}>{s.zone} · {s.techno}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {cols.filter((c) => c !== stage).slice(0, 3).map((c) => (
                        <button key={c} onClick={() => moveTo(s, c)}
                          style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: 5, background: "transparent", border: `1px solid ${C.border}`, color: C.faint, cursor: "pointer" }}
                          title={`Déplacer vers ${c}`}>
                          → {c.length > 14 ? c.slice(0, 12) + "…" : c}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {items.length === 0 && <div style={{ fontSize: 11, color: C.faint, textAlign: "center", padding: 16 }}>Vide</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   SYNCHRONISATION — meeting log with stakeholders
============================================================================ */
function emptyMeeting() {
  return { id: `mt-${Date.now()}`, date: new Date().toISOString().slice(0, 10), partie: "", type: "", sujets: "", decisions: "", actions: "", responsable: "", echeance: "" };
}

function SyncTab({ meetings, setMeetings }) {
  const [editing, setEditing] = useState(null);
  const sorted = useMemo(() => [...meetings].sort((a, b) => (b.date || "").localeCompare(a.date || "")), [meetings]);

  const save = (m) => {
    setMeetings((prev) => (prev.some((p) => p.id === m.id) ? prev.map((p) => (p.id === m.id ? m : p)) : [m, ...prev]));
    setEditing(null);
  };
  const del = (id) => setMeetings((prev) => prev.filter((p) => p.id !== id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionTitle icon={MessageSquare}>Journal des points de synchronisation</SectionTitle>
        <Btn icon={Plus} small onClick={() => setEditing(emptyMeeting())}>Nouveau point</Btn>
      </div>

      {sorted.length === 0 && (
        <div style={{ background: C.panel, border: `1px dashed ${C.border}`, borderRadius: 14, padding: 30, textAlign: "center", color: C.muted, fontSize: 13 }}>
          Aucun point enregistré. Ajoutez vos réunions avec le Ministère, les IEF, ou le support technique pour garder une trace des décisions et actions.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((m) => (
          <div key={m.id} style={{ background: C.panel, border: `1px solid ${C.borderSoft}`, borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <Badge color={C.blue} dim={C.blueDim}><Calendar size={11} /> {m.date}</Badge>
                  <span style={{ fontWeight: 700, fontSize: 13.5 }}>{m.partie || "Partie prenante non renseignée"}</span>
                  {m.type && <span style={{ fontSize: 11.5, color: C.muted }}>· {m.type}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <IconBtn icon={Pencil} onClick={() => setEditing(m)} />
                <IconBtn icon={Trash2} danger onClick={() => del(m.id)} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10, fontSize: 12.5 }}>
              {m.sujets && <Info label="Sujets abordés" value={m.sujets} />}
              {m.decisions && <Info label="Décisions prises" value={m.decisions} />}
              {m.actions && <Info label="Actions à faire" value={m.actions} />}
              {(m.responsable || m.echeance) && <Info label="Responsable / Échéance" value={`${m.responsable || "—"} · ${m.echeance || "—"}`} />}
            </div>
          </div>
        ))}
      </div>

      {editing && <MeetingModal meeting={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: C.faint, fontWeight: 600, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</div>
      <div style={{ color: C.textDim }}>{value}</div>
    </div>
  );
}

function MeetingModal({ meeting, onClose, onSave }) {
  const [m, setM] = useState(meeting);
  const set = (k) => (e) => setM((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(6,10,18,0.7)", display: "grid", placeItems: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, width: 600, maxWidth: "100%", maxHeight: "88vh", overflowY: "auto", padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ ...display, fontSize: 17, fontWeight: 700 }}>Point de synchronisation</div>
          <IconBtn icon={X} onClick={onClose} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Date"><TextInput type="date" value={m.date} onChange={set("date")} /></Field>
          <Field label="Type de point"><TextInput value={m.type} onChange={set("type")} placeholder="Comité mensuel, point hebdo…" /></Field>
          <div style={{ gridColumn: "1 / -1" }}><Field label="Partie prenante"><TextInput value={m.partie} onChange={set("partie")} placeholder="Ministère, IEF, Support Technique, Opérateur…" /></Field></div>
          <div style={{ gridColumn: "1 / -1" }}><Field label="Sujets abordés"><textarea rows={2} value={m.sujets} onChange={set("sujets")} style={{ ...inputStyle, resize: "vertical" }} /></Field></div>
          <div style={{ gridColumn: "1 / -1" }}><Field label="Décisions prises"><textarea rows={2} value={m.decisions} onChange={set("decisions")} style={{ ...inputStyle, resize: "vertical" }} /></Field></div>
          <div style={{ gridColumn: "1 / -1" }}><Field label="Actions à faire"><textarea rows={2} value={m.actions} onChange={set("actions")} style={{ ...inputStyle, resize: "vertical" }} /></Field></div>
          <Field label="Responsable"><TextInput value={m.responsable} onChange={set("responsable")} /></Field>
          <Field label="Échéance"><TextInput type="date" value={m.echeance} onChange={set("echeance")} /></Field>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn icon={Save} onClick={() => onSave(m)}>Enregistrer</Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   REPORTING — auto-generated internal / ministry summaries
============================================================================ */
function ReportingTab({ schools, counts, total, goal }) {
  const [mode, setMode] = useState("interne");
  const [copied, setCopied] = useState(false);

  const byZone = useMemo(() => {
    return ZONES.map((z) => {
      const items = schools.filter((s) => s.zone === z);
      return { zone: z, total: items.length, enService: items.filter((s) => s.stage === "En service").length };
    }).filter((z) => z.total > 0);
  }, [schools]);

  const blocked = schools.filter((s) => s.stage === "Bloqué");
  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const pct = total ? ((counts["En service"] || 0) / total * 100).toFixed(1) : "0.0";
  const pctGoal = goal ? ((counts["En service"] || 0) / goal * 100).toFixed(1) : "0.0";

  const reportInterne = `RAPPORT INTERNE — Suivi du projet de connectivité des écoles
Date : ${today}

CHIFFRES CLÉS
- Établissements suivis dans l'outil : ${total}
- En service : ${counts["En service"] || 0} (${pct}% des établissements suivis, ${pctGoal}% de l'objectif de ${goal})
- Installation en cours / en attente de mise en service : ${(counts["Installation en cours"] || 0) + (counts["Installée - en attente MES"] || 0)}
- Demandes enregistrées, en attente de planification : ${counts["Demande enregistrée"] || 0}
- Non démarré : ${counts["Non démarré"] || 0}
- Bloqué : ${counts["Bloqué"] || 0}

RÉPARTITION PAR TECHNOLOGIE
${TECHNOS.map((t) => {
    const items = schools.filter((s) => s.techno === t);
    const es = items.filter((s) => s.stage === "En service").length;
    return `- ${t} : ${items.length} établissement(s), dont ${es} en service`;
  }).join("\n")}

POINTS DE BLOCAGE (${blocked.length})
${blocked.length ? blocked.map((s) => `- ${s.nom} (${s.zone}) : ${s.commentaire || "motif non renseigné"}`).join("\n") : "Aucun blocage en cours."}

DÉCISIONS / ARBITRAGES ATTENDUS
[à compléter avant le comité]

PROCHAINES ÉCHÉANCES
[à compléter]`;

  const reportMinistere = `RAPPORT D'AVANCEMENT — Connectivité Internet des Établissements Scolaires
Ministère de l'Éducation Nationale
Date : ${today}

AVANCEMENT GLOBAL
Le programme de connectivité couvre à ce jour ${total} établissement(s) suivis, pour un objectif national de ${goal} écoles.
${counts["En service"] || 0} établissement(s) sont connectés et en service, soit un taux de couverture de ${pct}% du périmètre suivi.

AVANCEMENT PAR ZONE
${byZone.map((z) => `- ${z.zone} : ${z.enService} école(s) en service sur ${z.total} suivie(s) (${z.total ? (z.enService / z.total * 100).toFixed(0) : 0}%)`).join("\n")}

SYNTHÈSE
[Résumé qualitatif à l'attention du Ministère : avancées majeures, zones prioritaires traitées, calendrier prévisionnel des prochaines phases]

POINTS NÉCESSITANT L'APPUI DU MINISTÈRE
[Ex. facilitation d'accès à certains sites, coordination avec les IEF, autorisations administratives]`;

  const report = mode === "interne" ? reportInterne : reportMinistere;

  const copy = async () => {
    try { await navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch (e) { console.error("Copie impossible", e); }
  };
  const download = () => {
    try {
      const blob = new Blob([report], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `rapport_${mode}_${new Date().toISOString().slice(0, 10)}.txt`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, background: C.panelAlt, padding: 4, borderRadius: 10, border: `1px solid ${C.border}` }}>
          {[["interne", "Rapport interne"], ["ministere", "Rapport Ministère"]].map(([id, label]) => (
            <button key={id} onClick={() => setMode(id)}
              style={{
                padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                background: mode === id ? C.green : "transparent", color: mode === id ? "#062017" : C.textDim,
              }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="subtle" small icon={copied ? Check : Copy} onClick={copy}>{copied ? "Copié !" : "Copier"}</Btn>
          <Btn variant="subtle" small icon={Download} onClick={download}>Télécharger .txt</Btn>
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.borderSoft}`, borderRadius: 14, padding: 22 }}>
        <pre style={{ ...mono, fontSize: 12.5, lineHeight: 1.7, color: C.textDim, whiteSpace: "pre-wrap", margin: 0 }}>{report}</pre>
      </div>
      <div style={{ fontSize: 11.5, color: C.faint }}>
        Généré automatiquement à partir des données actuelles de l'onglet Établissements. Complétez les sections entre crochets avant diffusion.
      </div>
    </div>
  );
}
