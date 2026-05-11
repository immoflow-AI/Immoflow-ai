"use client";

import { useState } from "react";
import jsPDF from "jspdf";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnnonceProData {
  titre: string;
  description: string;
  points_forts: string[];
}

interface StoryboardScene {
  plan: string;
  voix_off: string;
}

interface ImmoFlowResult {
  annonce_pro: AnnonceProData;
  storyboard_video: StoryboardScene[];
  post_reseaux: string;
}

type Status = "idle" | "loading" | "success" | "error";
type TabId = "annonce" | "storyboard" | "reseaux";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Supprime les emojis et caractères non supportés par jsPDF
function stripEmojis(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u{2600}-\u{27FF}]/gu, "")
    .replace(/[\u{FE00}-\u{FEFF}]/gu, "")
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
    .replace(/[^\x00-\x7E\u00C0-\u024F]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Écrit du texte avec gestion automatique des nouvelles pages
function writeTextWithPageBreak(
  doc: jsPDF,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
  pageH: number,
  margin: number
): number {
  for (const line of lines) {
    if (y + lineHeight > pageH - margin) {
      doc.addPage();
      y = margin + 10;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

// ─── Export PDF ───────────────────────────────────────────────────────────────

function exportPDF(result: ImmoFlowResult) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const pageH = 297;
  const margin = 18;
  const maxW = W - margin * 2;
  let y = 0;

  // ── Header ──
  doc.setFillColor(13, 11, 9);
  doc.rect(0, 0, W, 42, "F");

  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 70);
  doc.text("PROPULSE PAR L'IA  .  MARKETING DE PRESTIGE", W / 2, 14, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(201, 168, 76);
  doc.text("IMMOFLOW AI", W / 2, 26, { align: "center" });

  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.4);
  doc.line(margin + 20, 32, W - margin - 20, 32);

  y = 52;

  // ── ANNONCE PRO ──
  doc.setFillColor(245, 242, 235);
  doc.rect(margin - 4, y - 6, maxW + 8, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 70);
  doc.text("ANNONCE PROFESSIONNELLE", margin, y);
  y += 10;

  // Titre
  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.setTextColor(40, 30, 20);
  const titreLines = doc.splitTextToSize(stripEmojis(result.annonce_pro.titre), maxW);
  y = writeTextWithPageBreak(doc, titreLines, margin, y, 7, pageH, margin);
  y += 4;

  // Description
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 70, 60);
  const descLines = doc.splitTextToSize(stripEmojis(result.annonce_pro.description), maxW);
  y = writeTextWithPageBreak(doc, descLines, margin, y, 5.5, pageH, margin);
  y += 6;

  // Points forts
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 70);
  doc.text("POINTS FORTS", margin, y);
  y += 6;

  for (const pt of result.annonce_pro.points_forts) {
    if (y > pageH - margin) { doc.addPage(); y = margin + 10; }
    doc.setFillColor(201, 168, 76);
    doc.circle(margin + 1.5, y - 1.5, 1, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 40, 30);
    const ptLines = doc.splitTextToSize(stripEmojis(pt), maxW - 6);
    y = writeTextWithPageBreak(doc, ptLines, margin + 5, y, 5, pageH, margin);
    y += 2;
  }

  y += 8;

  // ── STORYBOARD ──
  if (y > pageH - 40) { doc.addPage(); y = 20; }

  doc.setFillColor(245, 242, 235);
  doc.rect(margin - 4, y - 6, maxW + 8, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 70);
  doc.text("STORYBOARD VIDEO", margin, y);
  y += 10;

  const col1 = maxW * 0.45;
  const col2 = maxW * 0.55;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(120, 100, 70);
  doc.text("CE QU'IL FAUT FILMER", margin, y);
  doc.text("VOIX OFF", margin + col1 + 4, y);
  y += 4;
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);
  y += 5;

  result.storyboard_video.forEach((scene, i) => {
    const planLines = doc.splitTextToSize(stripEmojis(scene.plan), col1 - 4);
    const voixLines = doc.splitTextToSize(stripEmojis(scene.voix_off), col2 - 4);
    const rowH = Math.max(planLines.length, voixLines.length) * 4.5 + 5;

    if (y + rowH > pageH - margin) { doc.addPage(); y = margin + 10; }

    if (i % 2 === 0) {
      doc.setFillColor(250, 248, 244);
      doc.rect(margin - 2, y - 3, maxW + 4, rowH, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(160, 120, 40);
    doc.text(planLines, margin, y);

    doc.setTextColor(80, 70, 60);
    doc.setFont("times", "italic");
    doc.text(voixLines, margin + col1 + 4, y);

    y += rowH;
    doc.setDrawColor(220, 215, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 1, W - margin, y - 1);
  });

  y += 10;

  // ── POST RÉSEAUX ──
  if (y > pageH - 60) { doc.addPage(); y = 20; }

  doc.setFillColor(245, 242, 235);
  doc.rect(margin - 4, y - 6, maxW + 8, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 70);
  doc.text("POST RESEAUX SOCIAUX", margin, y);
  y += 10;

  // Nettoyer le post et mesurer la hauteur réelle
  const postClean = stripEmojis(result.post_reseaux);
  const postLines = doc.splitTextToSize(postClean, maxW - 6);
  const postH = postLines.length * 5.5 + 12;

  // Nouvelle page si pas assez de place
  if (y + postH > pageH - 20) { doc.addPage(); y = 20; }

  doc.setFillColor(252, 250, 246);
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin - 2, y - 2, maxW + 4, postH, 2, 2, "FD");

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 50, 40);
  y = writeTextWithPageBreak(doc, postLines, margin + 2, y + 4, 5.5, pageH, margin);

  // ── Footer sur chaque page ──
  const totalPages = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(13, 11, 9);
    doc.rect(0, 285, W, 12, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 85, 60);
    doc.text(
      `Genere par ImmoFlow AI  .  Marketing de Prestige  .  Page ${p}/${totalPages}`,
      W / 2, 292, { align: "center" }
    );
  }

  doc.save("immoflow-annonce.pdf");
}

// ─── Icônes ───────────────────────────────────────────────────────────────────

function IconFileText() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

function IconFilm() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z"/><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z"/>
    </svg>
  );
}

function IconReset() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
    </svg>
  );
}

function IconLoader() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:"spin 0.8s linear infinite"}}>
      <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

// ─── Panels ───────────────────────────────────────────────────────────────────

function AnnoncePanel({ data }: { data: AnnonceProData }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      <h2 style={{fontFamily:"Georgia,serif",fontSize:"20px",fontWeight:400,color:"#c9a84c",lineHeight:1.4,margin:0}}>
        {data.titre}
      </h2>
      <p style={{fontSize:"13px",color:"#9a8e80",lineHeight:1.85,margin:0}}>
        {data.description}
      </p>
      <div style={{borderTop:"0.5px solid #2a2520",paddingTop:"16px",display:"flex",flexDirection:"column",gap:"8px"}}>
        <p style={{fontSize:"10px",letterSpacing:"3px",color:"#4a4030",textTransform:"uppercase",margin:"0 0 8px"}}>Points forts</p>
        {data.points_forts.map((pt, i) => (
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"10px"}}>
            <div style={{width:"4px",height:"4px",borderRadius:"50%",background:"#c9a84c",marginTop:"6px",flexShrink:0}} />
            <span style={{fontSize:"13px",color:"#c0b49e",lineHeight:1.6}}>{pt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoryboardPanel({ scenes }: { scenes: StoryboardScene[] }) {
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px",tableLayout:"fixed"}}>
        <colgroup><col style={{width:"45%"}}/><col style={{width:"55%"}}/></colgroup>
        <thead>
          <tr style={{borderBottom:"0.5px solid #2a2520"}}>
            <th style={{textAlign:"left",fontSize:"10px",letterSpacing:"2.5px",color:"#4a4030",textTransform:"uppercase",paddingBottom:"12px",paddingRight:"16px",fontWeight:400}}>Ce qu'il faut filmer</th>
            <th style={{textAlign:"left",fontSize:"10px",letterSpacing:"2.5px",color:"#4a4030",textTransform:"uppercase",paddingBottom:"12px",fontWeight:400}}>Voix off</th>
          </tr>
        </thead>
        <tbody>
          {scenes.map((s, i) => (
            <tr key={i} style={{borderBottom:"0.5px solid #1e1a16"}}>
              <td style={{padding:"12px 16px 12px 0",color:"#c9a84c",lineHeight:1.7,verticalAlign:"top"}}>{s.plan}</td>
              <td style={{padding:"12px 0",color:"#9a8e80",lineHeight:1.7,verticalAlign:"top",fontStyle:"italic"}}>{s.voix_off}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PostPanel({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      <div style={{background:"#0f0e0c",border:"0.5px solid #2a2520",borderRadius:"8px",padding:"20px"}}>
        <pre style={{whiteSpace:"pre-wrap",fontFamily:"inherit",fontSize:"13px",color:"#c0b49e",lineHeight:1.9,margin:0}}>{text}</pre>
      </div>
      <button
        onClick={handleCopy}
        style={{display:"flex",alignItems:"center",gap:"6px",background:"none",border:"none",cursor:"pointer",fontSize:"10px",letterSpacing:"2.5px",color:copied?"#6a9a6a":"#5a5048",textTransform:"uppercase",padding:0,transition:"color 0.2s"}}
      >
        {copied ? <IconCheck /> : null}
        {copied ? "Copié !" : "Copier le post"}
      </button>
    </div>
  );
}

// ─── App principale ───────────────────────────────────────────────────────────

const TABS: {id: TabId; label: string; icon: () => React.ReactElement}[] = [
  {id:"annonce",   label:"Annonce Pro",      icon: IconFileText},
  {id:"storyboard",label:"Storyboard Vidéo", icon: IconFilm},
  {id:"reseaux",   label:"Réseaux Sociaux",  icon: IconShare},
];

export default function ImmoFlowApp() {
  const [notes, setNotes]         = useState("");
const [luxeMode, setLuxeMode] = useState(false);
  const [status, setStatus]       = useState<Status>("idle");
  const [result, setResult]       = useState<ImmoFlowResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("annonce");

  const handleGenerate = async () => {
    if (!notes.trim() || status === "loading") return;
    setStatus("loading");
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, mode: luxeMode ? "luxe" : "standard" }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const data = await res.json();
      setResult(data);
      setStatus("success");
      setActiveTab("annonce");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setNotes("");
  };

  return (
    <div style={{background:"#0d0b09",minHeight:"580px",borderRadius:"12px",padding:"2rem 1.75rem",fontFamily:"system-ui,sans-serif",color:"#e0d8cc"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{textAlign:"center",marginBottom:"2rem"}}>
        <p style={{fontSize:"10px",letterSpacing:"5px",color:"#4a4030",textTransform:"uppercase",margin:"0 0 8px"}}>Propulsé par l'IA</p>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"24px",fontWeight:400,letterSpacing:"4px",color:"#c9a84c",textTransform:"uppercase",margin:0}}>ImmoFlow AI</h1>
        <div style={{width:"50px",height:"1px",background:"#c9a84c44",margin:"12px auto"}} />
        <p style={{fontSize:"10px",letterSpacing:"3px",color:"#4a4030",textTransform:"uppercase",margin:0}}>Marketing de Prestige</p>
      </div>

    {/* Input zone */}
      {status !== "success" && (
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={6}
            placeholder="Collez vos notes de visite ici (ex: 3 pces, calme, travaux à prévoir, balcon Sud...)"
            style={{width:"100%",background:"#141210",border:"0.5px solid #2a2520",borderRadius:"8px",padding:"14px 16px",fontSize:"13px",color:"#c0b49e",fontFamily:"inherit",lineHeight:1.75,resize:"vertical",outline:"none",boxSizing:"border-box"}}
            onFocus={e => (e.target.style.borderColor="#c9a84c44")}
            onBlur={e => (e.target.style.borderColor="#2a2520")}
          />
          {error && <p style={{fontSize:"12px",color:"#c0624a",margin:0}}>{error}</p>}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#141210",border:"0.5px solid #2a2520",borderRadius:"8px",padding:"12px 16px"}}>
            <div>
              <p style={{fontSize:"12px",color:"#c9a84c",margin:"0 0 2px",fontFamily:"Georgia,serif"}}>✦ Analyse de Style Luxe</p>
              <p style={{fontSize:"11px",color:"#4a4030",margin:0}}>Prompt exclusif Plan Prestige</p>
            </div>
            <div onClick={() => setLuxeMode(!luxeMode)} style={{width:"44px",height:"24px",borderRadius:"12px",background:luxeMode?"#c9a84c":"#2a2520",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
              <div style={{position:"absolute",top:"3px",left:luxeMode?"22px":"3px",width:"18px",height:"18px",borderRadius:"50%",background:"#fff",transition:"left 0.2s"}} />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={status === "loading" || !notes.trim()}
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",width:"100%",padding:"14px",background:status==="loading"||!notes.trim()?"#5a4a1a":"#c9a84c",border:"none",borderRadius:"8px",color:status==="loading"||!notes.trim()?"#2a2010":"#0d0b09",fontSize:"11px",fontWeight:500,letterSpacing:"2.5px",textTransform:"uppercase",cursor:status==="loading"||!notes.trim()?"not-allowed":"pointer",transition:"background 0.2s",fontFamily:"inherit"}}
          >
            {status === "loading" ? (<><IconLoader />Analyse en cours...</>) : (<><IconSparkles />{luxeMode ? "Générer — Style Luxe ✦" : "Générer le Pack Marketing"}</>)}
          </button>
          {status === "loading" && (
            <p style={{textAlign:"center",fontSize:"11px",letterSpacing:"1px",color:"#4a4030",margin:0}}>
              {luxeMode ? "Analyse Luxe en cours — Sotheby's style..." : "Rédaction en cours par votre consultant IA..."}
            </p>
          )}
        </div>
      )}

      {/* Output zone */}
      {status === "success" && result && (
        <div>
          <div style={{display:"flex",borderBottom:"0.5px solid #2a2520",marginBottom:"0"}}>
            {TABS.map(({id, label, icon: Icon}) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",padding:"12px 8px",background:"none",border:"none",borderBottom:activeTab===id?"2px solid #c9a84c":"2px solid transparent",marginBottom:"-1px",color:activeTab===id?"#c9a84c":"#4a4030",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",transition:"color 0.15s"}}
              >
                <Icon />{label}
              </button>
            ))}
          </div>

          <div style={{paddingTop:"24px",minHeight:"280px"}}>
            {activeTab === "annonce"    && <AnnoncePanel data={result.annonce_pro} />}
            {activeTab === "storyboard" && <StoryboardPanel scenes={result.storyboard_video} />}
            {activeTab === "reseaux"    && <PostPanel text={result.post_reseaux} />}
          </div>

          <div style={{borderTop:"0.5px solid #1e1a16",marginTop:"24px",paddingTop:"16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button
              onClick={handleReset}
              style={{display:"flex",alignItems:"center",gap:"6px",background:"none",border:"none",cursor:"pointer",fontSize:"10px",letterSpacing:"2.5px",color:"#4a4030",textTransform:"uppercase",padding:0,fontFamily:"inherit",transition:"color 0.2s"}}
              onMouseEnter={e => (e.currentTarget.style.color="#7a6a50")}
              onMouseLeave={e => (e.currentTarget.style.color="#4a4030")}
            >
              <IconReset />Nouvelle analyse
            </button>

            <button
              onClick={() => exportPDF(result)}
              style={{display:"flex",alignItems:"center",gap:"7px",background:"#c9a84c",border:"none",borderRadius:"7px",padding:"9px 18px",fontSize:"10px",fontWeight:500,letterSpacing:"2px",color:"#0d0b09",textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",transition:"opacity 0.2s"}}
              onMouseEnter={e => (e.currentTarget.style.opacity="0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity="1")}
            >
              <IconDownload />Exporter en PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
