"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import { useUser } from "@clerk/nextjs";

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

  doc.setFillColor(245, 242, 235);
  doc.rect(margin - 4, y - 6, maxW + 8, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 70);
  doc.text("ANNONCE PROFESSIONNELLE", margin, y);
  y += 10;

  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.setTextColor(40, 30, 20);
  const titreLines = doc.splitTextToSize(stripEmojis(result.annonce_pro.titre), maxW);
  y = writeTextWithPageBreak(doc, titreLines, margin, y, 7, pageH, margin);
  y += 4;

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 70, 60);
  const descLines = doc.splitTextToSize(stripEmojis(result.annonce_pro.description), maxW);
  y = writeTextWithPageBreak(doc, descLines, margin, y, 5.5, pageH, margin);
  y += 6;

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

  if (y > pageH - 60) { doc.addPage(); y = 20; }

  doc.setFillColor(245, 242, 235);
  doc.rect(margin - 4, y - 6, maxW + 8, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 70);
  doc.text("POST RESEAUX SOCIAUX", margin, y);
  y += 10;

  const postClean = stripEmojis(result.post_reseaux);
  const postLines = doc.splitTextToSize(postClean, maxW - 6);
  const postH = postLines.length * 5.5 + 12;

  if (y + postH > pageH - 20) { doc.addPage(); y = 20; }

  doc.setFillColor(252, 250, 246);
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin - 2, y - 2, maxW + 4, postH, 2, 2, "FD");

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 50, 40);
  y = writeTextWithPageBreak(doc, postLines, margin + 2, y + 4, 5.5, pageH, margin);

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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

function IconFilm() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z"/><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z"/>
    </svg>
  );
}

function IconReset() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
    </svg>
  );
}

function IconLoader() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{animation:"spin 0.8s linear infinite"}}>
      <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

// ─── Panels ───────────────────────────────────────────────────────────────────

function AnnoncePanel({ data }: { data: AnnonceProData }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"28px"}}>
      <div>
        <p className="mono" style={{color:"#c9a84c",marginBottom:"1rem"}}>— Annonce —</p>
        <h2 className="serif" style={{fontSize:"clamp(28px,4vw,38px)",fontWeight:300,color:"#f0ece4",lineHeight:1.15,margin:0,letterSpacing:"-0.01em"}}>
          {data.titre}
        </h2>
      </div>

      <div style={{height:"1px",background:"linear-gradient(90deg,rgba(201,168,76,0.25),transparent)"}} />

      <p className="serif" style={{fontSize:"17px",color:"rgba(232,228,220,0.78)",lineHeight:1.75,margin:0,fontWeight:300,fontStyle:"italic"}}>
        {data.description}
      </p>

      <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:"24px",display:"flex",flexDirection:"column",gap:"14px"}}>
        <p className="mono" style={{color:"rgba(232,228,220,0.4)",margin:"0 0 8px"}}>Points forts</p>
        {data.points_forts.map((pt, i) => (
          <div key={i} className="fade-up in" style={{display:"flex",alignItems:"flex-start",gap:"14px",transitionDelay:`${i*0.05}s`}}>
            <div className="serif gold-text" style={{fontSize:"14px",fontStyle:"italic",fontWeight:300,minWidth:"24px",lineHeight:1.5}}>
              {String.fromCharCode(8544 + i)}
            </div>
            <span style={{fontSize:"14px",color:"rgba(232,228,220,0.75)",lineHeight:1.65,fontWeight:300}}>{pt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoryboardPanel({ scenes }: { scenes: StoryboardScene[] }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"0",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"16px",overflow:"hidden",background:"rgba(255,255,255,0.015)"}}>
      <div style={{display:"grid",gridTemplateColumns:"40px 1fr 1.2fr",padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(0,0,0,0.3)"}}>
        <span className="mono" style={{color:"rgba(232,228,220,0.35)"}}>№</span>
        <span className="mono" style={{color:"#c9a84c"}}>Ce qu'il faut filmer</span>
        <span className="mono" style={{color:"#c9a84c"}}>Voix off</span>
      </div>
      {scenes.map((s, i) => (
        <div key={i} className="fade-up in" style={{display:"grid",gridTemplateColumns:"40px 1fr 1.2fr",padding:"20px",borderBottom:i<scenes.length-1?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"flex-start",gap:"16px",transitionDelay:`${i*0.06}s`}}>
          <div className="serif gold-text" style={{fontSize:"22px",fontStyle:"italic",fontWeight:300,lineHeight:1}}>
            {String.fromCharCode(8544 + i)}
          </div>
          <div style={{fontSize:"14px",color:"rgba(232,228,220,0.85)",lineHeight:1.65,fontWeight:300}}>{s.plan}</div>
          <div className="serif" style={{fontSize:"15px",color:"rgba(232,228,220,0.6)",lineHeight:1.65,fontStyle:"italic",fontWeight:300}}>{s.voix_off}</div>
        </div>
      ))}
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
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      <div style={{position:"relative",background:"linear-gradient(180deg,rgba(255,255,255,0.02) 0%,rgba(0,0,0,0.2) 100%)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"16px",padding:"32px",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"60%",height:"1px",background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)"}} />
        <pre style={{whiteSpace:"pre-wrap",fontFamily:"'Inter',sans-serif",fontWeight:300,fontSize:"15px",color:"rgba(232,228,220,0.85)",lineHeight:1.85,margin:0}}>{text}</pre>
      </div>
      <button
        onClick={handleCopy}
        className="btn-ghost"
        style={{alignSelf:"flex-start",padding:"12px 24px",fontSize:"10px",color:copied?"#e8c87c":undefined,borderColor:copied?"rgba(201,168,76,0.3)":undefined}}
      >
        {copied ? <IconCheck /> : null}
        <span>{copied ? "Texte copié" : "Copier le texte"}</span>
      </button>
    </div>
  );
}

// ─── App principale ───────────────────────────────────────────────────────────

const TABS: {id: TabId; label: string; icon: () => React.ReactElement}[] = [
  {id:"annonce",   label:"Annonce",      icon: IconFileText},
  {id:"storyboard",label:"Storyboard",   icon: IconFilm},
  {id:"reseaux",   label:"Réseaux",      icon: IconShare},
];

export default function ImmoFlowApp() {
  const [notes, setNotes]         = useState("");
  const [luxeMode, setLuxeMode]   = useState(false);
  const { user } = useUser();
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
        body: JSON.stringify({ notes, mode: luxeMode ? "luxe" : "standard", userId: user?.id, plan: user?.publicMetadata?.plan || "free" }),
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
    <div style={{background:"#080808",minHeight:"100vh",fontFamily:"'Inter','Helvetica Neue',system-ui,sans-serif",color:"#e8e4dc",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Inter:wght@300;400;500&display=swap');

        *{box-sizing:border-box}

        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes grain{0%,100%{transform:translate(0,0)}10%{transform:translate(-5%,-10%)}30%{transform:translate(3%,-15%)}50%{transform:translate(12%,9%)}70%{transform:translate(9%,4%)}90%{transform:translate(-1%,7%)}}
        @keyframes drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-60px) scale(1.05)}}
        @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}

        .grain{position:fixed;inset:-100%;pointer-events:none;z-index:1;opacity:0.06;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");animation:grain 8s steps(4) infinite}

        .mesh-1{position:absolute;top:-20%;left:-10%;width:60%;height:80%;background:radial-gradient(ellipse at center,rgba(201,168,76,0.10) 0%,rgba(201,168,76,0.03) 35%,transparent 70%);filter:blur(80px);pointer-events:none;animation:drift 20s ease-in-out infinite}
        .mesh-2{position:absolute;top:30%;right:-15%;width:55%;height:70%;background:radial-gradient(ellipse at center,rgba(180,140,60,0.07) 0%,rgba(140,100,40,0.02) 40%,transparent 70%);filter:blur(100px);pointer-events:none;animation:drift 25s ease-in-out infinite reverse}

        .fade-up{opacity:0;transform:translateY(24px);transition:opacity 1.1s cubic-bezier(0.16,1,0.3,1),transform 1.1s cubic-bezier(0.16,1,0.3,1)}
        .fade-up.in{opacity:1;transform:translateY(0)}
        .fade-up.d1{transition-delay:0.1s}
        .fade-up.d2{transition-delay:0.2s}
        .fade-up.d3{transition-delay:0.3s}

        .serif{font-family:'Cormorant Garamond',Georgia,serif;font-weight:300;letter-spacing:-0.01em}
        .mono{font-family:'Inter',sans-serif;font-weight:400;letter-spacing:0.32em;text-transform:uppercase;font-size:10px}

        .gold-text{background:linear-gradient(135deg,#e8c87c 0%,#c9a84c 30%,#a88838 50%,#c9a84c 70%,#e8c87c 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 8s linear infinite}

        .nav-link{color:rgba(232,228,220,0.5);font-size:11px;letter-spacing:0.28em;text-transform:uppercase;text-decoration:none;font-weight:400;transition:color 0.4s cubic-bezier(0.16,1,0.3,1)}
        .nav-link:hover{color:#e8c87c}

        .btn-primary{background:transparent;border:1px solid rgba(201,168,76,0.4);color:#e8c87c;padding:14px 28px;font-family:'Inter',sans-serif;font-size:11px;font-weight:400;letter-spacing:0.32em;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:10px;position:relative;overflow:hidden;transition:all 0.6s cubic-bezier(0.16,1,0.3,1)}
        .btn-primary::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05));opacity:0;transition:opacity 0.6s cubic-bezier(0.16,1,0.3,1)}
        .btn-primary:hover:not(:disabled){border-color:rgba(232,200,124,0.7);color:#f4d896;transform:translateY(-1px)}
        .btn-primary:hover:not(:disabled)::before{opacity:1}
        .btn-primary > *{position:relative;z-index:1}
        .btn-primary:disabled{cursor:not-allowed;opacity:0.4}

        .btn-ghost{background:transparent;border:1px solid rgba(255,255,255,0.08);color:rgba(232,228,220,0.7);padding:12px 24px;font-family:'Inter',sans-serif;font-size:10px;font-weight:400;letter-spacing:0.32em;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:10px;transition:all 0.6s cubic-bezier(0.16,1,0.3,1)}
        .btn-ghost:hover{border-color:rgba(255,255,255,0.18);color:#e8e4dc;transform:translateY(-1px)}

        textarea{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:24px;font-size:15px;color:#e8e4dc;font-family:'Inter',sans-serif;font-weight:300;outline:none;transition:all 0.6s cubic-bezier(0.16,1,0.3,1);width:100%;line-height:1.75;resize:vertical;letter-spacing:0.01em}
        textarea:focus{border-color:rgba(201,168,76,0.25);background:rgba(201,168,76,0.015)}
        textarea::placeholder{color:rgba(232,228,220,0.25);font-style:italic;font-family:'Cormorant Garamond',serif;font-size:17px}

        .submit-luxe{background:linear-gradient(135deg,#e8c87c 0%,#c9a84c 50%,#a88838 100%);border:none;color:#080808;padding:18px;font-family:'Inter',sans-serif;font-size:11px;font-weight:500;letter-spacing:0.32em;text-transform:uppercase;cursor:pointer;transition:all 0.6s cubic-bezier(0.16,1,0.3,1);width:100%;display:flex;align-items:center;justify-content:center;gap:10px;border-radius:12px;position:relative;overflow:hidden}
        .submit-luxe:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 20px 60px -20px rgba(201,168,76,0.4)}
        .submit-luxe:disabled{cursor:not-allowed;background:rgba(255,255,255,0.04);color:rgba(232,228,220,0.3)}

        .divider-fine{height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)}

        .tab-button{flex:1;display:flex;align-items:center;justify-content:center;gap:10px;padding:18px 12px;background:transparent;border:none;color:rgba(232,228,220,0.35);font-size:10px;letter-spacing:0.32em;text-transform:uppercase;cursor:pointer;font-family:'Inter',sans-serif;font-weight:400;transition:all 0.6s cubic-bezier(0.16,1,0.3,1);position:relative}
        .tab-button:hover{color:rgba(232,228,220,0.6)}
        .tab-button.active{color:#e8c87c}
        .tab-button.active::after{content:"";position:absolute;bottom:-1px;left:25%;right:25%;height:1px;background:linear-gradient(90deg,transparent,#c9a84c,transparent)}

        .luxe-card{background:linear-gradient(180deg,rgba(255,255,255,0.018) 0%,rgba(255,255,255,0.005) 100%);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:20px 24px;transition:all 0.6s cubic-bezier(0.16,1,0.3,1)}
        .luxe-card.active{background:linear-gradient(180deg,rgba(201,168,76,0.05) 0%,rgba(201,168,76,0.01) 100%);border-color:rgba(201,168,76,0.2)}

        .toggle-switch{width:48px;height:26px;border-radius:13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);cursor:pointer;position:relative;transition:all 0.6s cubic-bezier(0.16,1,0.3,1);flex-shrink:0}
        .toggle-switch.on{background:linear-gradient(135deg,rgba(201,168,76,0.3),rgba(201,168,76,0.15));border-color:rgba(201,168,76,0.4)}
        .toggle-knob{position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:rgba(232,228,220,0.7);transition:all 0.6s cubic-bezier(0.16,1,0.3,1)}
        .toggle-switch.on .toggle-knob{left:24px;background:linear-gradient(135deg,#e8c87c,#a88838);box-shadow:0 0 12px rgba(201,168,76,0.4)}

        @media(max-width:768px){
          .nav-desktop{display:none !important}
          .footer-actions{flex-direction:column !important;gap:16px !important}
        }
      `}</style>

      {/* Texture grain overlay */}
      <div className="grain" />

      {/* Gradient mesh background */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}>
        <div className="mesh-1" />
        <div className="mesh-2" />
      </div>

      {/* IntersectionObserver */}
      <script dangerouslySetInnerHTML={{__html:`
        if(typeof window!=='undefined'){
          const obs=new IntersectionObserver((entries)=>{
            entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target)}});
          },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
          const init=()=>document.querySelectorAll('.fade-up:not(.in)').forEach(el=>obs.observe(el));
          if(document.readyState!=='loading')init();else document.addEventListener('DOMContentLoaded',init);
        }
      `}} />

      <div style={{position:"relative",zIndex:2}}>

        {/* NAV */}
        <nav style={{padding:"1.75rem 3rem",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"rgba(8,8,8,0.72)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",zIndex:100,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
          <a href="/" style={{display:"flex",alignItems:"center",gap:"14px",textDecoration:"none"}}>
            <div style={{width:"28px",height:"28px",border:"1px solid rgba(201,168,76,0.4)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"linear-gradient(135deg,#e8c87c,#a88838)"}} />
            </div>
            <div className="serif" style={{fontSize:"18px",fontWeight:400,letterSpacing:"0.18em",color:"#e8e4dc",textTransform:"uppercase"}}>
              ImmoFlow <span className="gold-text">AI</span>
            </div>
          </a>
          <div className="nav-desktop" style={{display:"flex",alignItems:"center",gap:"2.5rem"}}>
            <a href="/" className="nav-link">Accueil</a>
            <a href="/tarifs" className="nav-link">Tarifs</a>
            <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px 14px",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"100px",background:"rgba(201,168,76,0.03)"}}>
              <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#c9a84c",boxShadow:"0 0 8px rgba(201,168,76,0.6)",animation:"pulse 2s ease-in-out infinite"}} />
              <span className="mono" style={{color:"#c9a84c",fontSize:"9px"}}>L'atelier</span>
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main style={{maxWidth:"880px",margin:"0 auto",padding:"5rem 2rem 6rem"}}>

          {/* Header */}
          <div className="fade-up" style={{textAlign:"center",marginBottom:"4rem"}}>
            <p className="mono" style={{color:"#c9a84c",marginBottom:"1.5rem"}}>— L'atelier —</p>
            <h1 className="serif" style={{fontSize:"clamp(40px,6vw,72px)",fontWeight:300,color:"#f0ece4",margin:"0 0 1.5rem",lineHeight:1.05,letterSpacing:"-0.02em"}}>
              {status === "success" ? (
                <>Votre <span style={{fontStyle:"italic"}} className="gold-text">pack marketing</span></>
              ) : (
                <>Le générateur <span style={{fontStyle:"italic"}} className="gold-text">d'exception</span></>
              )}
            </h1>
            <div className="divider-fine" style={{width:"80px",margin:"0 auto 1.5rem"}} />
            <p className="serif" style={{fontSize:"17px",color:"rgba(232,228,220,0.55)",margin:0,fontStyle:"italic",fontWeight:300,maxWidth:"480px",marginLeft:"auto",marginRight:"auto",lineHeight:1.6}}>
              {status === "success"
                ? "Trois formats ciselés, prêts à transmettre"
                : "Confiez-nous vos notes, recevez votre œuvre"}
            </p>
          </div>

          {/* Input zone */}
          {status !== "success" && (
            <div className="fade-up d1" style={{display:"flex",flexDirection:"column",gap:"20px"}}>

              <div style={{position:"relative"}}>
                <div style={{position:"absolute",top:"-12px",left:"24px",background:"#080808",padding:"0 12px",zIndex:2}}>
                  <span className="mono" style={{color:"rgba(232,228,220,0.4)"}}>Notes de visite</span>
                </div>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={8}
                  placeholder="Hôtel particulier discret, cour pavée, jardin d'inspiration Le Nôtre, salon double avec parquet Versailles d'origine, cheminée Louis XVI en marbre de Carrare, vue dégagée sur la Tour Eiffel..."
                />
              </div>

              {error && (
                <div style={{padding:"14px 20px",background:"rgba(192,98,74,0.05)",border:"1px solid rgba(192,98,74,0.2)",borderRadius:"12px"}}>
                  <p className="mono" style={{color:"#c0624a",margin:0}}>{error}</p>
                </div>
              )}

              {/* Luxe Mode Toggle */}
              <div className={`luxe-card ${luxeMode ? 'active' : ''}`} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"16px",flex:1,minWidth:0}}>
                  <div style={{width:"40px",height:"40px",border:"1px solid rgba(201,168,76,0.25)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:luxeMode?"rgba(201,168,76,0.08)":"transparent",transition:"all 0.6s cubic-bezier(0.16,1,0.3,1)"}}>
                    <span className="serif" style={{color:"#c9a84c",fontSize:"18px",fontStyle:"italic"}}>✦</span>
                  </div>
                  <div style={{minWidth:0}}>
                    <p className="serif" style={{fontSize:"18px",color:"#f0ece4",margin:"0 0 2px",fontStyle:"italic",fontWeight:300}}>
                      Analyse de Style Luxe
                    </p>
                    <p className="mono" style={{color:"rgba(232,228,220,0.4)",margin:0}}>
                      Prompt exclusif · Plan Prestige
                    </p>
                  </div>
                </div>
                <div onClick={() => setLuxeMode(!luxeMode)} className={`toggle-switch ${luxeMode ? 'on' : ''}`}>
                  <div className="toggle-knob" />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={status === "loading" || !notes.trim()}
                className="submit-luxe"
              >
                {status === "loading" ? (
                  <>
                    <IconLoader />
                    <span>{luxeMode ? "Composition Luxe en cours…" : "Rédaction en cours…"}</span>
                  </>
                ) : (
                  <>
                    <IconSparkles />
                    <span>{luxeMode ? "Composer — Style Luxe ✦" : "Composer le Pack Marketing"}</span>
                  </>
                )}
              </button>

              {status === "loading" && (
                <p className="serif" style={{textAlign:"center",fontSize:"15px",color:"rgba(232,228,220,0.45)",margin:"0.5rem 0 0",fontStyle:"italic",fontWeight:300}}>
                  {luxeMode
                    ? "Votre consultant IA orchestre votre annonce dans le registre du grand luxe…"
                    : "Votre consultant IA compose votre pack marketing…"}
                </p>
              )}

              <p className="mono" style={{textAlign:"center",color:"rgba(232,228,220,0.25)",marginTop:"1rem"}}>
                Confidentialité absolue · Résultat en 10 secondes · Aucune donnée conservée
              </p>
            </div>
          )}

          {/* Output zone */}
          {status === "success" && result && (
            <div className="fade-up d1" style={{display:"flex",flexDirection:"column",gap:"32px"}}>

              {/* Tabs */}
              <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.015)",borderRadius:"16px 16px 0 0",overflow:"hidden"}}>
                {TABS.map(({id, label, icon: Icon}) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`tab-button ${activeTab === id ? 'active' : ''}`}
                  >
                    <Icon />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Panel content */}
              <div style={{padding:"0 8px",minHeight:"320px"}}>
                {activeTab === "annonce"    && <AnnoncePanel data={result.annonce_pro} />}
                {activeTab === "storyboard" && <StoryboardPanel scenes={result.storyboard_video} />}
                {activeTab === "reseaux"    && <PostPanel text={result.post_reseaux} />}
              </div>

              {/* Footer actions */}
              <div className="divider-fine" style={{margin:"1rem 0"}} />
              <div className="footer-actions" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"20px"}}>
                <button
                  onClick={handleReset}
                  className="btn-ghost"
                >
                  <IconReset />
                  <span>Nouvelle composition</span>
                </button>

                <button
                  onClick={() => exportPDF(result)}
                  className="btn-primary"
                >
                  <IconDownload />
                  <span>Exporter en PDF</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer style={{borderTop:"1px solid rgba(255,255,255,0.04)",padding:"3rem 2rem",textAlign:"center",background:"rgba(0,0,0,0.3)"}}>
          <div className="serif" style={{fontSize:"15px",color:"rgba(232,228,220,0.4)",margin:"0 0 8px",fontStyle:"italic",fontWeight:300}}>
            Le marketing immobilier de prestige, à l'ère de l'intelligence.
          </div>
          <p className="mono" style={{color:"rgba(232,228,220,0.25)",margin:0}}>
            © MMXXVI · ImmoFlow AI · Paris
          </p>
        </footer>
      </div>
    </div>
  );
}
