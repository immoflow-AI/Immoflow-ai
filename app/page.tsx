"use client";

import { useState } from "react";

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

// ─── Mock API Simulator ───────────────────────────────────────────────────────
// Remplacez cette fonction par un vrai fetch("/api/generate", ...) en production.

async function mockGenerateAPI(notes: string): Promise<ImmoFlowResult> {
  await new Promise((r) => setTimeout(r, 1800));

  const hasTravaux = notes.toLowerCase().includes("travaux");
  const hasBalcon = notes.toLowerCase().includes("balcon");
  const hasHaussmann = notes.toLowerCase().includes("haussmann");

  return {
    annonce_pro: {
      titre: hasHaussmann
        ? "Haussmannien d'exception — volumes souverains et lumière dorée"
        : "Un appartement où le temps s'arrête, entre élégance et sérénité",
      description:
        "Derrière une façade bourgeoise au charme intemporel, cet appartement déploie des volumes généreux baignés d'une lumière naturelle rare. " +
        "Les hauteurs sous plafond, les moulures d'époque et les parquets anciens composent un écrin d'une rare noblesse. " +
        (hasTravaux
          ? "Une opportunité de personnalisation s'offre à l'acquéreur exigeant, pour faire de ces espaces le reflet d'un goût affirmé. "
          : "Chaque pièce a été pensée comme un tableau vivant, où matières nobles et lumière naturelle dialoguent avec grâce. ") +
        "Ici, l'art de vivre parisien prend tout son sens.",
      points_forts: [
        "Volumes exceptionnels, plafonds à " + (hasHaussmann ? "3,20m" : "2,80m"),
        hasBalcon ? "Balcon exposé Sud — terrasse de lumière à toute heure" : "Luminosité remarquable, double exposition",
        "Parquet point de Hongrie d'origine, cheminées en marbre",
        hasTravaux ? "Potentiel de personnalisation totale — sur plan vierge" : "Prestations haut de gamme, aucun travaux",
        "Environnement calme et préservé, à l'abri de l'agitation",
      ],
    },
    storyboard_video: [
      {
        plan: "Travelling avant lent sur la façade haussmannienne, lever du jour — angle légèrement bas valorisant la hauteur",
        voix_off: "Paris. Certaines adresses ne se découvrent pas, elles se révèlent.",
      },
      {
        plan: "Push-in depuis le couloir d'entrée vers le salon, lumière naturelle en contre-jour",
        voix_off: "Dès le premier pas, les volumes s'imposent. Le silence aussi.",
      },
      {
        plan: hasBalcon
          ? "Plan fixe sur le balcon Sud — soleil rasant, mobilier épuré, vue dégagée"
          : "Plan fixe sur la fenêtre en plein cintre, rideaux légers animés par la brise",
        voix_off: hasBalcon
          ? "Un balcon comme une scène privée, offert à la lumière du Sud."
          : "La lumière entre ici comme une invitée permanente.",
      },
      {
        plan: "Macro glissé sur les détails architecturaux — moulure, parquet, poignée de porte en laiton",
        voix_off: "Les détails sont le langage de l'excellence. Chacun raconte une époque.",
      },
      {
        plan: "Plan large de la chambre principale, lit centré, symétrie parfaite",
        voix_off: "Les nuits ici ressemblent à des parenthèses hors du temps.",
      },
      {
        plan: "Plan final : sortie lente en steadicam vers la porte d'entrée, fondu au noir sur le logo de l'agence",
        voix_off: "Une résidence d'exception ne se visite pas — elle se ressent.",
      },
    ],
    post_reseaux:
      "✨ Nouveau bien d'exception — Paris\n\n" +
      "Des volumes qui coupent le souffle. Une lumière qui ne ment pas.\n\n" +
      (hasBalcon ? "🌿 Balcon plein Sud, vue dégagée\n" : "") +
      "🏛️ Architecture Haussmannienne, détails d'époque préservés\n" +
      "🔑 Un art de vivre rare, à deux pas de tout\n\n" +
      (hasTravaux
        ? "Une opportunité unique de créer votre intérieur sur-mesure.\n\n"
        : "Prestations soignées, prêt à habiter.\n\n") +
      "Visites sur rendez-vous exclusivement.\n" +
      "DM ou lien en bio 👇\n\n" +
      "#immobilierparis #luxuryrealestate #appartementparis #haussmann #bienexception #immoluxe #paris #agenceimmobiliere",
  };
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function IconFileText() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>
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
  const [notes, setNotes]       = useState("");
  const [status, setStatus]     = useState<Status>("idle");
  const [result, setResult]     = useState<ImmoFlowResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("annonce");

  const handleGenerate = async () => {
    if (!notes.trim() || status === "loading") return;
    setStatus("loading");
    setError(null);
    setResult(null);
    try {
      // 👇 En production, remplacez mockGenerateAPI par :
      // const res = await fetch("/api/generate", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ notes }) });
      // if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      // const data = await res.json();
      const data = await mockGenerateAPI(notes);
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

          {error && (
            <p style={{fontSize:"12px",color:"#c0624a",margin:0}}>{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={status === "loading" || !notes.trim()}
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",width:"100%",padding:"14px",background: status === "loading" || !notes.trim() ? "#5a4a1a" : "#c9a84c",border:"none",borderRadius:"8px",color: status === "loading" || !notes.trim() ? "#2a2010" : "#0d0b09",fontSize:"11px",fontWeight:500,letterSpacing:"2.5px",textTransform:"uppercase",cursor:status === "loading" || !notes.trim() ? "not-allowed" : "pointer",transition:"background 0.2s",fontFamily:"inherit"}}
          >
            {status === "loading" ? (
              <><IconLoader />Analyse en cours...</>
            ) : (
              <><IconSparkles />Générer le Pack Marketing</>
            )}
          </button>

          {status === "loading" && (
            <p style={{textAlign:"center",fontSize:"11px",letterSpacing:"1px",color:"#4a4030",margin:0}}>
              Rédaction en cours par votre consultant IA...
            </p>
          )}
        </div>
      )}

      {/* Output zone */}
      {status === "success" && result && (
        <div>
          {/* Tabs */}
          <div style={{display:"flex",borderBottom:"0.5px solid #2a2520",marginBottom:"0"}}>
            {TABS.map(({id, label, icon: Icon}) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",padding:"12px 8px",background:"none",border:"none",borderBottom: activeTab === id ? "2px solid #c9a84c" : "2px solid transparent",marginBottom:"-1px",color: activeTab === id ? "#c9a84c" : "#4a4030",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",transition:"color 0.15s"}}
              >
                <Icon />{label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div style={{paddingTop:"24px",minHeight:"280px"}}>
            {activeTab === "annonce"    && <AnnoncePanel data={result.annonce_pro} />}
            {activeTab === "storyboard" && <StoryboardPanel scenes={result.storyboard_video} />}
            {activeTab === "reseaux"    && <PostPanel text={result.post_reseaux} />}
          </div>

          {/* Reset */}
          <div style={{borderTop:"0.5px solid #1e1a16",marginTop:"24px",paddingTop:"16px"}}>
            <button
              onClick={handleReset}
              style={{display:"flex",alignItems:"center",gap:"6px",background:"none",border:"none",cursor:"pointer",fontSize:"10px",letterSpacing:"2.5px",color:"#4a4030",textTransform:"uppercase",padding:0,fontFamily:"inherit",transition:"color 0.2s"}}
              onMouseEnter={e => (e.currentTarget.style.color="#7a6a50")}
              onMouseLeave={e => (e.currentTarget.style.color="#4a4030")}
            >
              <IconReset />Nouvelle analyse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
