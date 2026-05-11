"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

const PLANS = [
  {
    id: "solo",
    nom: "Solo",
    prix: "39,99€",
    periode: "/mois",
    desc: "Parfait pour l'agent indépendant",
    limite: "15 annonces / mois",
    features: [
      "15 annonces par mois",
      "Annonce Pro + Storyboard + Post",
      "Export PDF",
      "Support email",
    ],
    gold: false,
  },
  {
    id: "prestige",
    nom: "Prestige",
    prix: "79,99€",
    periode: "/mois",
    desc: "Pour les agents qui veulent se démarquer",
    limite: "Annonces illimitées",
    features: [
      "Annonces illimitées",
      "Annonce Pro + Storyboard + Post",
      "Export PDF premium",
      "✦ Analyse de Style Luxe (prompt exclusif)",
      "Support prioritaire",
    ],
    gold: true,
  },
  {
    id: "agence",
    nom: "Agence",
    prix: "199€",
    periode: "/mois",
    desc: "Pour toute votre équipe",
    limite: "Jusqu'à 5 utilisateurs",
    features: [
      "Jusqu'à 5 utilisateurs",
      "Annonces illimitées",
      "Tout le plan Prestige inclus",
      "Logo de votre agence sur les PDF",
      "Onboarding personnalisé",
    ],
    gold: false,
  },
];

export default function TarifsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (!user) {
      window.location.href = "/sign-in";
      return;
    }
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          userId: user.id,
          userEmail: user.emailAddresses[0]?.emailAddress,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error);
    } catch (e) {
      alert("Erreur lors du paiement. Réessayez.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{background:"#0d0b09",minHeight:"100vh",fontFamily:"system-ui,sans-serif",color:"#e0d8cc"}}>
      <style>{`
        .btn-gold{background:#c9a84c;border:none;border-radius:8px;color:#0d0b09;font-family:inherit;font-weight:500;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:opacity 0.2s;width:100%}
        .btn-gold:hover{opacity:0.88}
        .btn-outline{background:none;border:0.5px solid #c9a84c44;border-radius:8px;color:#c9a84c;font-family:inherit;font-weight:400;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all 0.2s;width:100%}
        .btn-outline:hover{border-color:#c9a84c;background:#c9a84c11}
        .check{width:18px;height:18px;border-radius:50%;background:#c9a84c22;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
      `}</style>

      {/* NAV */}
      <nav style={{borderBottom:"0.5px solid #1e1a14",padding:"1.25rem 2rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <a href="/" style={{fontFamily:"Georgia,serif",fontSize:"16px",letterSpacing:"3px",color:"#c9a84c",textTransform:"uppercase",textDecoration:"none"}}>ImmoFlow AI</a>
        <a href="/app" style={{fontSize:"11px",letterSpacing:"2px",color:"#5a5040",textTransform:"uppercase",textDecoration:"none"}}>← Retour au générateur</a>
      </nav>

      {/* HEADER */}
      <div style={{textAlign:"center",padding:"4rem 2rem 3rem"}}>
        <p style={{fontSize:"10px",letterSpacing:"4px",color:"#4a4030",textTransform:"uppercase",margin:"0 0 10px"}}>Tarifs</p>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"32px",fontWeight:400,color:"#e8dcc8",margin:"0 0 12px"}}>Choisissez votre formule</h1>
        <div style={{width:"50px",height:"1px",background:"linear-gradient(90deg,transparent,#c9a84c55,transparent)",margin:"0 auto 16px"}} />
        <p style={{fontSize:"13px",color:"#7a6a58",margin:0}}>Sans engagement · Résiliable à tout moment</p>
      </div>

      {/* PLANS */}
      <div style={{maxWidth:"960px",margin:"0 auto",padding:"0 2rem 5rem",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"16px",alignItems:"start"}}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            background:"#141210",
            border: plan.gold ? "1px solid #c9a84c55" : "0.5px solid #2a2520",
            borderRadius:"12px",
            padding:"2rem",
            position:"relative",
          }}>
            {plan.gold && (
              <div style={{position:"absolute",top:"-12px",left:"50%",transform:"translateX(-50%)",background:"#c9a84c",color:"#0d0b09",fontSize:"9px",letterSpacing:"2px",padding:"4px 14px",borderRadius:"20px",textTransform:"uppercase",fontWeight:500,whiteSpace:"nowrap"}}>
                Le plus populaire
              </div>
            )}

            <p style={{fontSize:"10px",letterSpacing:"3px",color:plan.gold?"#c9a84c":"#5a5040",textTransform:"uppercase",margin:"0 0 12px"}}>{plan.nom}</p>
            <div style={{display:"flex",alignItems:"baseline",gap:"4px",margin:"0 0 4px"}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:"36px",color:plan.gold?"#c9a84c":"#e8dcc8",fontWeight:400}}>{plan.prix}</span>
              <span style={{fontSize:"12px",color:"#5a5040"}}>{plan.periode}</span>
            </div>
            <p style={{fontSize:"12px",color:"#5a5040",margin:"0 0 6px"}}>{plan.desc}</p>
            <p style={{fontSize:"11px",color:"#c9a84c",margin:"0 0 1.5rem",letterSpacing:"0.5px"}}>✦ {plan.limite}</p>

            <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"1.5rem"}}>
              {plan.features.map((f, i) => (
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"10px"}}>
                  <div className="check"><span style={{color:"#c9a84c",fontSize:"10px"}}>✓</span></div>
                  <span style={{fontSize:"13px",color:"#9a8e80",lineHeight:1.5}}>{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout(plan.id)}
              disabled={loading === plan.id}
              className={plan.gold ? "btn-gold" : "btn-outline"}
              style={{padding:"13px",fontSize:"10px",letterSpacing:"2px",opacity:loading===plan.id?0.6:1}}
            >
              {loading === plan.id ? "Redirection..." : "Choisir ce plan"}
            </button>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer style={{borderTop:"0.5px solid #1e1a14",padding:"2rem",textAlign:"center"}}>
        <p style={{fontSize:"11px",color:"#3a3028",margin:0,letterSpacing:"1px"}}>
          Paiement sécurisé par Stripe · Sans engagement · Annulation en 1 clic
        </p>
      </footer>
    </div>
  );
}
