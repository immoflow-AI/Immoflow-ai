"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

const PLANS = [
  {
    id: "solo",
    nom: "Solo",
    prix: "39,99€",
    periode: "/ mois",
    desc: "L'agent indépendant qui débute",
    limite: "15 annonces par mois",
    features: [
      "15 annonces par mois",
      "Pack complet : Annonce, Storyboard, Post",
      "Export PDF élégant",
      "Support par courriel",
    ],
    gold: false,
  },
  {
    id: "prestige",
    nom: "Prestige",
    prix: "79,99€",
    periode: "/ mois",
    desc: "L'agent qui veut se démarquer",
    limite: "Annonces illimitées",
    features: [
      "Annonces illimitées",
      "Pack complet livré en 10 secondes",
      "Export PDF premium personnalisé",
      "✦ Analyse de Style Luxe (prompt exclusif)",
      "Support prioritaire dédié",
    ],
    gold: true,
  },
  {
    id: "agence",
    nom: "Agence",
    prix: "199€",
    periode: "/ mois",
    desc: "La maison toute entière",
    limite: "Jusqu'à 5 utilisateurs",
    features: [
      "Jusqu'à 5 collaborateurs",
      "Annonces illimitées",
      "Tout le plan Prestige inclus",
      "Logo de votre maison sur les PDF",
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

        .mesh-1{position:absolute;top:-20%;left:-10%;width:60%;height:80%;background:radial-gradient(ellipse at center,rgba(201,168,76,0.12) 0%,rgba(201,168,76,0.04) 35%,transparent 70%);filter:blur(80px);pointer-events:none;animation:drift 20s ease-in-out infinite}
        .mesh-2{position:absolute;top:30%;right:-15%;width:55%;height:70%;background:radial-gradient(ellipse at center,rgba(180,140,60,0.08) 0%,rgba(140,100,40,0.03) 40%,transparent 70%);filter:blur(100px);pointer-events:none;animation:drift 25s ease-in-out infinite reverse}
        .mesh-3{position:absolute;bottom:-10%;left:20%;width:50%;height:60%;background:radial-gradient(ellipse at center,rgba(201,168,76,0.06) 0%,transparent 60%);filter:blur(90px);pointer-events:none}

        .fade-up{opacity:0;transform:translateY(24px);transition:opacity 1.1s cubic-bezier(0.16,1,0.3,1),transform 1.1s cubic-bezier(0.16,1,0.3,1)}
        .fade-up.in{opacity:1;transform:translateY(0)}
        .fade-up.d1{transition-delay:0.1s}
        .fade-up.d2{transition-delay:0.2s}
        .fade-up.d3{transition-delay:0.3s}

        .serif{font-family:'Cormorant Garamond',Georgia,serif;font-weight:300;letter-spacing:-0.02em}
        .mono{font-family:'Inter',sans-serif;font-weight:400;letter-spacing:0.32em;text-transform:uppercase;font-size:10px}

        .gold-text{background:linear-gradient(135deg,#e8c87c 0%,#c9a84c 30%,#a88838 50%,#c9a84c 70%,#e8c87c 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 8s linear infinite}

        .nav-link{color:rgba(232,228,220,0.5);font-size:11px;letter-spacing:0.28em;text-transform:uppercase;text-decoration:none;font-weight:400;transition:color 0.4s cubic-bezier(0.16,1,0.3,1)}
        .nav-link:hover{color:#e8c87c}

        .divider-fine{height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)}

        .check-mark{width:16px;height:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:3px;color:#c9a84c;font-family:'Cormorant Garamond',serif;font-size:18px;font-style:italic;font-weight:300}

        .price-card{background:linear-gradient(180deg,rgba(255,255,255,0.015) 0%,rgba(0,0,0,0.2) 100%);border:1px solid rgba(255,255,255,0.05);border-radius:24px;padding:3rem 2.5rem;position:relative;transition:all 0.8s cubic-bezier(0.16,1,0.3,1);backdrop-filter:blur(10px);display:flex;flex-direction:column}
        .price-card:hover{border-color:rgba(255,255,255,0.1);transform:translateY(-4px)}

        .price-card-featured{background:linear-gradient(180deg,rgba(201,168,76,0.06) 0%,rgba(201,168,76,0.01) 100%);border:1px solid rgba(201,168,76,0.25)}
        .price-card-featured::after{content:"";position:absolute;inset:-1px;border-radius:24px;padding:1px;background:linear-gradient(180deg,rgba(232,200,124,0.4),rgba(201,168,76,0.05) 50%,transparent);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
        .price-card-featured:hover{border-color:rgba(201,168,76,0.4);transform:translateY(-4px)}

        .btn-primary{background:transparent;border:1px solid rgba(201,168,76,0.4);color:#e8c87c;padding:16px 28px;font-family:'Inter',sans-serif;font-size:11px;font-weight:400;letter-spacing:0.32em;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:12px;position:relative;overflow:hidden;transition:all 0.6s cubic-bezier(0.16,1,0.3,1);width:100%}
        .btn-primary::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05));opacity:0;transition:opacity 0.6s cubic-bezier(0.16,1,0.3,1)}
        .btn-primary:hover:not(:disabled){border-color:rgba(232,200,124,0.7);color:#f4d896;transform:translateY(-1px)}
        .btn-primary:hover:not(:disabled)::before{opacity:1}
        .btn-primary > *{position:relative;z-index:1}
        .btn-primary:disabled{cursor:not-allowed;opacity:0.5}

        .btn-ghost{background:transparent;border:1px solid rgba(255,255,255,0.08);color:rgba(232,228,220,0.7);padding:16px 28px;font-family:'Inter',sans-serif;font-size:11px;font-weight:400;letter-spacing:0.32em;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:12px;transition:all 0.6s cubic-bezier(0.16,1,0.3,1);width:100%}
        .btn-ghost:hover:not(:disabled){border-color:rgba(255,255,255,0.18);color:#e8e4dc;transform:translateY(-1px)}
        .btn-ghost:disabled{cursor:not-allowed;opacity:0.5}

        .featured-badge{position:absolute;top:-1px;left:50%;transform:translateX(-50%) translateY(-50%);background:#080808;padding:6px 16px;border:1px solid rgba(201,168,76,0.3);border-radius:100px;white-space:nowrap;z-index:2}

        @media(max-width:768px){
          .nav-desktop{display:none !important}
          .price-grid{grid-template-columns:1fr !important}
          .header-title{font-size:clamp(40px,10vw,56px) !important}
        }
      `}</style>

      {/* Texture grain overlay */}
      <div className="grain" />

      {/* Gradient mesh background */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}>
        <div className="mesh-1" />
        <div className="mesh-2" />
        <div className="mesh-3" />
      </div>

      {/* IntersectionObserver */}
      <script dangerouslySetInnerHTML={{__html:`
        if(typeof window!=='undefined'){
          const obs=new IntersectionObserver((entries)=>{
            entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target)}});
          },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
          const init=()=>document.querySelectorAll('.fade-up').forEach(el=>obs.observe(el));
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
            <a href="/app" className="nav-link">← Retour à l'atelier</a>
          </div>
        </nav>

        {/* HEADER */}
        <section style={{maxWidth:"880px",margin:"0 auto",padding:"7rem 2rem 4rem",textAlign:"center"}}>
          <div className="fade-up">
            <p className="mono" style={{color:"#c9a84c",marginBottom:"1.5rem"}}>— Honoraires —</p>
            <h1 className="serif header-title" style={{fontSize:"clamp(48px,7vw,88px)",fontWeight:300,color:"#f0ece4",margin:"0 0 1.5rem",lineHeight:1.05,letterSpacing:"-0.02em"}}>
              Trois formules,<br />
              <span style={{fontStyle:"italic"}}>une </span>
              <span style={{fontStyle:"italic"}} className="gold-text">même exigence</span>
            </h1>
            <div className="divider-fine" style={{width:"80px",margin:"0 auto 1.5rem"}} />
            <p className="serif" style={{fontSize:"17px",color:"rgba(232,228,220,0.55)",margin:0,fontStyle:"italic",fontWeight:300,maxWidth:"480px",marginLeft:"auto",marginRight:"auto",lineHeight:1.6}}>
              Sans engagement, résiliable à tout moment, comme il se doit chez les grandes maisons.
            </p>
          </div>
        </section>

        {/* PLANS */}
        <section style={{maxWidth:"1200px",margin:"0 auto",padding:"0 2rem 4rem"}}>
          <div className="price-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"20px",alignItems:"stretch"}}>

            {PLANS.map((plan, idx) => (
              <div
                key={plan.id}
                className={`price-card ${plan.gold ? 'price-card-featured' : ''} fade-up ${idx === 1 ? 'd1' : idx === 2 ? 'd2' : ''}`}
              >
                {plan.gold && (
                  <div className="featured-badge">
                    <span className="mono gold-text" style={{letterSpacing:"0.32em"}}>Le plus choisi</span>
                  </div>
                )}

                <p className={`mono ${plan.gold ? 'gold-text' : ''}`} style={{color:plan.gold?undefined:"rgba(232,228,220,0.4)",marginBottom:"2rem"}}>
                  {plan.nom}
                </p>

                <div style={{marginBottom:"0.5rem"}}>
                  <span className={`serif ${plan.gold ? 'gold-text' : ''}`} style={{fontSize:"56px",fontWeight:300,letterSpacing:"-0.03em",color:plan.gold?undefined:"#f0ece4"}}>
                    {plan.prix}
                  </span>
                  <span style={{fontSize:"13px",color:"rgba(232,228,220,0.4)",marginLeft:"8px"}}>{plan.periode}</span>
                </div>

                <p className="serif" style={{margin:"0 0 1rem",fontStyle:"italic",fontSize:"16px",color:"rgba(232,228,220,0.55)",fontWeight:300}}>
                  {plan.desc}
                </p>

                <div style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"6px 12px",border:`1px solid ${plan.gold ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.08)'}`,borderRadius:"100px",marginBottom:"2rem",alignSelf:"flex-start",background:plan.gold ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.015)'}}>
                  <span style={{color:"#c9a84c",fontSize:"10px"}}>✦</span>
                  <span className="mono" style={{color:plan.gold?"#e8c87c":"rgba(232,228,220,0.5)",fontSize:"9px"}}>
                    {plan.limite}
                  </span>
                </div>

                <div style={{height:"1px",background:plan.gold?"linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)":"rgba(255,255,255,0.05)",margin:"0 0 2rem"}} />

                <div style={{display:"flex",flexDirection:"column",gap:"14px",marginBottom:"2.5rem",flex:1}}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"12px"}}>
                      <span className="check-mark" style={{color:plan.gold?"#e8c87c":"#c9a84c"}}>+</span>
                      <span style={{fontSize:"14px",color:plan.gold?"rgba(232,228,220,0.85)":"rgba(232,228,220,0.7)",fontWeight:300,lineHeight:1.5}}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className={plan.gold ? "btn-primary" : "btn-ghost"}
                  style={plan.gold ? {borderColor:"rgba(201,168,76,0.6)"} : undefined}
                >
                  {loading === plan.id ? (
                    <span>Redirection sécurisée…</span>
                  ) : (
                    <>
                      <span>{plan.gold ? "Choisir Prestige" : "Choisir " + plan.nom}</span>
                      {plan.gold && <span>→</span>}
                    </>
                  )}
                </button>
              </div>
            ))}

          </div>

          <p className="fade-up mono" style={{textAlign:"center",marginTop:"3rem",color:"rgba(232,228,220,0.3)"}}>
            Tous les tarifs s'entendent hors taxes · Engagement mensuel · Résiliation à tout moment
          </p>
        </section>

        <div className="divider-fine" style={{maxWidth:"720px",margin:"0 auto"}} />

        {/* TRUST / SECURITY */}
        <section style={{maxWidth:"880px",margin:"0 auto",padding:"6rem 2rem",textAlign:"center"}}>
          <div className="fade-up">
            <p className="mono" style={{color:"#c9a84c",marginBottom:"1.5rem"}}>— Confiance —</p>
            <h2 className="serif" style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:300,color:"#f0ece4",margin:"0 0 2rem",lineHeight:1.15,letterSpacing:"-0.01em"}}>
              Paiement sécurisé,<br />
              <span style={{fontStyle:"italic"}} className="gold-text">discrétion absolue</span>
            </h2>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"24px",marginTop:"3rem"}}>
              {[
                {n:"I",titre:"Stripe",desc:"Paiement chiffré de bout en bout, sans qu'aucune donnée bancaire ne transite par nos serveurs."},
                {n:"II",titre:"Sans engagement",desc:"Résiliable en un clic depuis votre tableau de bord, à tout moment, sans pénalité."},
                {n:"III",titre:"Confidentialité",desc:"Vos notes restent vos notes. Aucune donnée client n'entraîne nos modèles. Hébergement européen."},
              ].map((item,i)=>(
                <div key={i} className="fade-up" style={{textAlign:"left",padding:"24px",background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:"16px",transitionDelay:`${i*0.1}s`}}>
                  <div className="serif gold-text" style={{fontSize:"36px",lineHeight:1,marginBottom:"1rem",fontStyle:"italic",fontWeight:300}}>{item.n}</div>
                  <h3 className="serif" style={{fontSize:"20px",color:"#f0ece4",margin:"0 0 8px",fontWeight:300}}>{item.titre}</h3>
                  <p style={{fontSize:"13px",color:"rgba(232,228,220,0.5)",lineHeight:1.7,margin:0,fontWeight:300}}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider-fine" style={{maxWidth:"720px",margin:"0 auto"}} />

        {/* FAQ courte */}
        <section style={{maxWidth:"720px",margin:"0 auto",padding:"6rem 2rem",textAlign:"center"}}>
          <div className="fade-up">
            <p className="mono" style={{color:"#c9a84c",marginBottom:"1.5rem"}}>— Une question —</p>
            <h2 className="serif" style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:300,color:"#f0ece4",margin:"0 0 1.5rem",lineHeight:1.15}}>
              Notre conciergerie<br />
              <span style={{fontStyle:"italic"}} className="gold-text">à votre écoute</span>
            </h2>
            <p className="serif" style={{fontSize:"17px",color:"rgba(232,228,220,0.55)",margin:"0 0 2.5rem",fontStyle:"italic",fontWeight:300,lineHeight:1.6}}>
              Une interrogation sur les formules, une demande sur-mesure pour votre maison, un onboarding personnalisé ?
              Nous répondons sous 24 heures.
            </p>
            <a href="mailto:contact@immoflow.ai" className="btn-primary" style={{display:"inline-flex",width:"auto"}}>
              <span>Nous écrire</span>
              <span>→</span>
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{borderTop:"1px solid rgba(255,255,255,0.04)",padding:"4rem 2rem 3rem",background:"rgba(0,0,0,0.4)"}}>
          <div style={{maxWidth:"1280px",margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:"2rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
              <div style={{width:"32px",height:"32px",border:"1px solid rgba(201,168,76,0.4)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:"7px",height:"7px",borderRadius:"50%",background:"linear-gradient(135deg,#e8c87c,#a88838)"}} />
              </div>
              <p className="serif" style={{fontSize:"20px",letterSpacing:"0.18em",color:"#e8e4dc",margin:0,textTransform:"uppercase",fontWeight:300}}>
                ImmoFlow <span className="gold-text">AI</span>
              </p>
            </div>

            <div style={{display:"flex",gap:"2.5rem",flexWrap:"wrap",justifyContent:"center"}}>
              <a href="/" className="nav-link">Accueil</a>
              <a href="/app" className="nav-link">L'atelier</a>
              <a href="mailto:contact@immoflow.ai" className="nav-link">Contact</a>
            </div>

            <div className="divider-fine" style={{width:"120px"}} />

            <p className="serif" style={{fontSize:"15px",color:"rgba(232,228,220,0.4)",margin:0,fontStyle:"italic",textAlign:"center",fontWeight:300}}>
              Paiement sécurisé par Stripe · Sans engagement · Annulation en un clic
            </p>
            <p className="mono" style={{color:"rgba(232,228,220,0.25)",margin:0}}>
              © MMXXVI · ImmoFlow AI · Paris
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}