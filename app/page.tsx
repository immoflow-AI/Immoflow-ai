"use client";

import { useState } from "react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes("@")) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setSending(false);
  };

  return (
    <div style={{background:"#0d0b09",minHeight:"100vh",fontFamily:"system-ui,sans-serif",color:"#e0d8cc"}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.7s ease forwards}
        .btn-gold{background:#c9a84c;border:none;border-radius:8px;color:#0d0b09;font-family:inherit;font-weight:500;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:opacity 0.2s}
        .btn-gold:hover{opacity:0.88}
        .btn-outline{background:none;border:0.5px solid #c9a84c44;border-radius:8px;color:#c9a84c;font-family:inherit;font-weight:400;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all 0.2s}
        .btn-outline:hover{border-color:#c9a84c;background:#c9a84c11}
        .card{background:#141210;border:0.5px solid #2a2520;border-radius:12px;padding:2rem}
        .card-gold{background:#141210;border:1px solid #c9a84c55;border-radius:12px;padding:2rem;position:relative}
        input[type=email]{background:#0d0b09;border:0.5px solid #2a2520;border-radius:8px;padding:13px 16px;font-size:13px;color:#c0b49e;font-family:inherit;outline:none;transition:border 0.2s;width:100%;box-sizing:border-box}
        input[type=email]:focus{border-color:#c9a84c55}
        input[type=email]::placeholder{color:#4a4030}
        .divider{width:50px;height:1px;background:linear-gradient(90deg,transparent,#c9a84c55,transparent);margin:0 auto}
        .feature-icon{width:40px;height:40px;border-radius:10px;background:#1e1a14;border:0.5px solid #2a2520;display:flex;align-items:center;justify-content:center;margin-bottom:1rem;flex-shrink:0}
        .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:10px;letter-spacing:2px;text-transform:uppercase;background:#c9a84c22;color:#c9a84c;border:0.5px solid #c9a84c44}
        .check{width:18px;height:18px;border-radius:50%;background:#c9a84c22;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
        nav-link{color:#7a6a50;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;cursor:pointer}
      `}</style>

      {/* NAV */}
      <nav style={{borderBottom:"0.5px solid #1e1a14",padding:"1.25rem 2rem",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#0d0b09",zIndex:100}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:"16px",letterSpacing:"3px",color:"#c9a84c",textTransform:"uppercase"}}>ImmoFlow AI</div>
        <div style={{display:"flex",alignItems:"center",gap:"2rem"}}>
          <a href="#fonctionnalites" style={{color:"#5a5040",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",textDecoration:"none"}}>Fonctionnalités</a>
          <a href="#tarifs" style={{color:"#5a5040",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",textDecoration:"none"}}>Tarifs</a>
          <a href="#contact" style={{color:"#5a5040",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",textDecoration:"none"}}>Contact</a>
          <a href="/app" style={{padding:"8px 18px",fontSize:"10px",letterSpacing:"2px"}} className="btn-gold">Essayer</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{maxWidth:"780px",margin:"0 auto",padding:"6rem 2rem 5rem",textAlign:"center"}} className="fade-up">
        <div className="badge" style={{marginBottom:"1.5rem"}}>Nouveau · Marketing IA pour l'immobilier</div>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(28px,5vw,52px)",fontWeight:400,color:"#e8dcc8",lineHeight:1.2,margin:"0 0 1.5rem",letterSpacing:"1px"}}>
          Vos notes de visite.<br />
          <span style={{color:"#c9a84c"}}>Un pack marketing complet.</span>
        </h1>
        <p style={{fontSize:"15px",color:"#7a6a58",lineHeight:1.85,maxWidth:"520px",margin:"0 auto 2.5rem"}}>
          ImmoFlow AI transforme vos notes brutes en annonce professionnelle, storyboard vidéo et post réseaux sociaux — en quelques secondes, avec le ton d'un agent immobilier de luxe parisien.
        </p>
        <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/app" style={{padding:"14px 32px",fontSize:"12px",letterSpacing:"2.5px",display:"inline-block",textDecoration:"none"}} className="btn-gold">
            Générer mon annonce gratuite
          </a>
          <a href="#fonctionnalites" style={{padding:"14px 32px",fontSize:"12px",letterSpacing:"2px",display:"inline-block",textDecoration:"none"}} className="btn-outline">
            Voir comment ça marche
          </a>
        </div>
        <p style={{marginTop:"1.5rem",fontSize:"11px",color:"#3a3028",letterSpacing:"1px"}}>
          Aucune carte bancaire · Résultat en 10 secondes
        </p>
      </section>

      {/* DIVIDER */}
      <div className="divider" />

      {/* FEATURES */}
      <section id="fonctionnalites" style={{maxWidth:"900px",margin:"0 auto",padding:"5rem 2rem"}}>
        <div style={{textAlign:"center",marginBottom:"3.5rem"}}>
          <p style={{fontSize:"10px",letterSpacing:"4px",color:"#4a4030",textTransform:"uppercase",margin:"0 0 10px"}}>Ce que vous obtenez</p>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"28px",fontWeight:400,color:"#e8dcc8",margin:0}}>Un pack marketing complet en 3 formats</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"16px"}}>

          {[
            {
              icon: "✦",
              titre: "Annonce Professionnelle",
              desc: "Titre accrocheur, description émotionnelle et points forts — rédigés avec le ton d'une agence de prestige parisienne.",
            },
            {
              icon: "▶",
              titre: "Storyboard Vidéo",
              desc: "6 plans caméra détaillés avec voix off prête à l'emploi. Donnez ce tableau à votre vidéaste et laissez-le faire le reste.",
            },
            {
              icon: "◈",
              titre: "Post Réseaux Sociaux",
              desc: "Un texte punchy et émojis pour Instagram et Facebook, avec hashtags inclus. Copiez-collez, publiez.",
            },
            {
              icon: "↓",
              titre: "Export PDF",
              desc: "Générez un PDF élégant aux couleurs ImmoFlow AI, prêt à envoyer à votre client ou à imprimer.",
            },
          ].map((f, i) => (
            <div key={i} className="card" style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              <div className="feature-icon">
                <span style={{color:"#c9a84c",fontSize:"18px"}}>{f.icon}</span>
              </div>
              <h3 style={{fontFamily:"Georgia,serif",fontSize:"16px",fontWeight:400,color:"#c9a84c",margin:0}}>{f.titre}</h3>
              <p style={{fontSize:"13px",color:"#7a6a58",lineHeight:1.7,margin:0}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* COMMENT CA MARCHE */}
      <section style={{maxWidth:"700px",margin:"0 auto",padding:"5rem 2rem"}}>
        <div style={{textAlign:"center",marginBottom:"3rem"}}>
          <p style={{fontSize:"10px",letterSpacing:"4px",color:"#4a4030",textTransform:"uppercase",margin:"0 0 10px"}}>Simple comme bonjour</p>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"28px",fontWeight:400,color:"#e8dcc8",margin:0}}>3 étapes, 10 secondes</h2>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"0"}}>
          {[
            {num:"01", titre:"Collez vos notes", desc:"Notes brutes, mots-clés, impressions de visite — n'importe quel format."},
            {num:"02", titre:"L'IA rédige", desc:"Notre consultant IA de luxe transforme vos notes en contenu premium."},
            {num:"03", titre:"Copiez ou exportez", desc:"Récupérez votre annonce, storyboard et post. Exportez en PDF en un clic."},
          ].map((step, i) => (
            <div key={i} style={{display:"flex",gap:"20px",padding:"1.5rem 0",borderBottom:i<2?"0.5px solid #1e1a14":"none"}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:"32px",color:"#2a2218",fontWeight:400,minWidth:"48px",lineHeight:1}}>{step.num}</div>
              <div>
                <h3 style={{fontSize:"15px",fontWeight:500,color:"#c9a84c",margin:"0 0 6px",fontFamily:"Georgia,serif"}}>{step.titre}</h3>
                <p style={{fontSize:"13px",color:"#7a6a58",lineHeight:1.7,margin:0}}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* TARIFS */}
      <section id="tarifs" style={{maxWidth:"900px",margin:"0 auto",padding:"5rem 2rem"}}>
        <div style={{textAlign:"center",marginBottom:"3.5rem"}}>
          <p style={{fontSize:"10px",letterSpacing:"4px",color:"#4a4030",textTransform:"uppercase",margin:"0 0 10px"}}>Tarifs</p>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"28px",fontWeight:400,color:"#e8dcc8",margin:0}}>Choisissez votre formule</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"16px",alignItems:"start"}}>

          {/* Starter */}
          <div className="card">
            <p style={{fontSize:"10px",letterSpacing:"3px",color:"#5a5040",textTransform:"uppercase",margin:"0 0 12px"}}>Starter</p>
            <div style={{display:"flex",alignItems:"baseline",gap:"4px",margin:"0 0 6px"}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:"36px",color:"#e8dcc8",fontWeight:400}}>29€</span>
              <span style={{fontSize:"12px",color:"#5a5040"}}>/mois</span>
            </div>
            <p style={{fontSize:"12px",color:"#5a5040",margin:"0 0 1.5rem"}}>Idéal pour démarrer</p>
            <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"1.5rem"}}>
              {["30 annonces / mois","Annonce + Storyboard + Post","Export PDF","Support email"].map((item,i) => (
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"10px"}}>
                  <div className="check"><span style={{color:"#c9a84c",fontSize:"10px"}}>✓</span></div>
                  <span style={{fontSize:"13px",color:"#9a8e80"}}>{item}</span>
                </div>
              ))}
            </div>
            <a href="#contact" style={{display:"block",textAlign:"center",padding:"12px",fontSize:"10px",letterSpacing:"2px",textDecoration:"none"}} className="btn-outline">Commencer</a>
          </div>

          {/* Pro — recommandé */}
          <div className="card-gold">
            <div style={{position:"absolute",top:"-12px",left:"50%",transform:"translateX(-50%)",background:"#c9a84c",color:"#0d0b09",fontSize:"9px",letterSpacing:"2px",padding:"4px 14px",borderRadius:"20px",textTransform:"uppercase",fontWeight:500,whiteSpace:"nowrap"}}>
              Le plus populaire
            </div>
            <p style={{fontSize:"10px",letterSpacing:"3px",color:"#c9a84c",textTransform:"uppercase",margin:"0 0 12px"}}>Pro</p>
            <div style={{display:"flex",alignItems:"baseline",gap:"4px",margin:"0 0 6px"}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:"36px",color:"#c9a84c",fontWeight:400}}>49€</span>
              <span style={{fontSize:"12px",color:"#5a5040"}}>/mois</span>
            </div>
            <p style={{fontSize:"12px",color:"#5a5040",margin:"0 0 1.5rem"}}>Pour les agents actifs</p>
            <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"1.5rem"}}>
              {["Annonces illimitées","Annonce + Storyboard + Post","Export PDF premium","Historique des annonces","Support prioritaire"].map((item,i) => (
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"10px"}}>
                  <div className="check"><span style={{color:"#c9a84c",fontSize:"10px"}}>✓</span></div>
                  <span style={{fontSize:"13px",color:"#9a8e80"}}>{item}</span>
                </div>
              ))}
            </div>
            <a href="#contact" style={{display:"block",textAlign:"center",padding:"12px",fontSize:"10px",letterSpacing:"2px",textDecoration:"none"}} className="btn-gold">Commencer</a>
          </div>

          {/* Agence */}
          <div className="card">
            <p style={{fontSize:"10px",letterSpacing:"3px",color:"#5a5040",textTransform:"uppercase",margin:"0 0 12px"}}>Agence</p>
            <div style={{display:"flex",alignItems:"baseline",gap:"4px",margin:"0 0 6px"}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:"36px",color:"#e8dcc8",fontWeight:400}}>149€</span>
              <span style={{fontSize:"12px",color:"#5a5040"}}>/mois</span>
            </div>
            <p style={{fontSize:"12px",color:"#5a5040",margin:"0 0 1.5rem"}}>Pour toute votre équipe</p>
            <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"1.5rem"}}>
              {["Jusqu'à 10 utilisateurs","Annonces illimitées","Tout le plan Pro inclus","Logo de votre agence sur les PDF","Onboarding personnalisé"].map((item,i) => (
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"10px"}}>
                  <div className="check"><span style={{color:"#c9a84c",fontSize:"10px"}}>✓</span></div>
                  <span style={{fontSize:"13px",color:"#9a8e80"}}>{item}</span>
                </div>
              ))}
            </div>
            <a href="#contact" style={{display:"block",textAlign:"center",padding:"12px",fontSize:"10px",letterSpacing:"2px",textDecoration:"none"}} className="btn-outline">Nous contacter</a>
          </div>

        </div>
      </section>

      <div className="divider" />

      {/* CONTACT / LISTE D'ATTENTE */}
      <section id="contact" style={{maxWidth:"520px",margin:"0 auto",padding:"5rem 2rem",textAlign:"center"}}>
        <p style={{fontSize:"10px",letterSpacing:"4px",color:"#4a4030",textTransform:"uppercase",margin:"0 0 10px"}}>Accès anticipé</p>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:"28px",fontWeight:400,color:"#e8dcc8",margin:"0 0 12px"}}>Rejoignez la liste d'attente</h2>
        <p style={{fontSize:"13px",color:"#7a6a58",lineHeight:1.75,margin:"0 0 2rem"}}>
          Soyez parmi les premiers agents à accéder à ImmoFlow AI. Nous vous contacterons en priorité avec une offre de lancement exclusive.
        </p>

        {!sent ? (
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={sending || !email.includes("@")}
              className="btn-gold"
              style={{padding:"14px",fontSize:"11px",letterSpacing:"2.5px",opacity:sending||!email.includes("@")?0.4:1}}
            >
              {sending ? "Envoi en cours..." : "Rejoindre la liste d'attente"}
            </button>
            <p style={{fontSize:"11px",color:"#3a3028",margin:0}}>Aucun spam · Désabonnement en 1 clic</p>
          </div>
        ) : (
          <div style={{background:"#141210",border:"0.5px solid #c9a84c44",borderRadius:"12px",padding:"2rem"}}>
            <div style={{fontSize:"32px",marginBottom:"12px"}}>✦</div>
            <h3 style={{fontFamily:"Georgia,serif",fontSize:"20px",color:"#c9a84c",fontWeight:400,margin:"0 0 8px"}}>Vous êtes sur la liste !</h3>
            <p style={{fontSize:"13px",color:"#7a6a58",margin:0,lineHeight:1.7}}>Nous vous contacterons très prochainement avec votre accès prioritaire et votre offre de lancement.</p>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:"0.5px solid #1e1a14",padding:"2rem",textAlign:"center"}}>
        <p style={{fontFamily:"Georgia,serif",fontSize:"14px",letterSpacing:"3px",color:"#c9a84c",textTransform:"uppercase",margin:"0 0 8px"}}>ImmoFlow AI</p>
        <p style={{fontSize:"11px",color:"#3a3028",margin:0,letterSpacing:"1px"}}>Marketing de Prestige · Propulsé par l'IA</p>
      </footer>

    </div>
  );
}
