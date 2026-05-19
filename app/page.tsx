"use client";

import { useState } from "react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

 const handleSubmit = async () => {
    if (!email.trim() || !email.includes("@")) return;
    setSending(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      alert("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  return (
  <div style={{background:"#080808",minHeight:"100vh",fontFamily:"'Inter','Helvetica Neue',system-ui,sans-serif",color:"#e8e4dc",position:"relative",overflow:"hidden"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Inter:wght@300;400;500&display=swap');

      *{box-sizing:border-box}
      html{scroll-behavior:smooth}

      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      @keyframes grain{0%,100%{transform:translate(0,0)}10%{transform:translate(-5%,-10%)}30%{transform:translate(3%,-15%)}50%{transform:translate(12%,9%)}70%{transform:translate(9%,4%)}90%{transform:translate(-1%,7%)}}
      @keyframes drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-60px) scale(1.05)}}

      .grain{position:fixed;inset:-100%;pointer-events:none;z-index:1;opacity:0.06;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");animation:grain 8s steps(4) infinite}

      .mesh-1{position:absolute;top:-20%;left:-10%;width:60%;height:80%;background:radial-gradient(ellipse at center,rgba(201,168,76,0.12) 0%,rgba(201,168,76,0.04) 35%,transparent 70%);filter:blur(80px);pointer-events:none;animation:drift 20s ease-in-out infinite}
      .mesh-2{position:absolute;top:30%;right:-15%;width:55%;height:70%;background:radial-gradient(ellipse at center,rgba(180,140,60,0.08) 0%,rgba(140,100,40,0.03) 40%,transparent 70%);filter:blur(100px);pointer-events:none;animation:drift 25s ease-in-out infinite reverse}
      .mesh-3{position:absolute;bottom:-10%;left:20%;width:50%;height:60%;background:radial-gradient(ellipse at center,rgba(201,168,76,0.06) 0%,transparent 60%);filter:blur(90px);pointer-events:none}

      .fade-up{opacity:0;transform:translateY(24px);transition:opacity 1.1s cubic-bezier(0.16,1,0.3,1),transform 1.1s cubic-bezier(0.16,1,0.3,1)}
      .fade-up.in{opacity:1;transform:translateY(0)}
      .fade-up.d1{transition-delay:0.1s}
      .fade-up.d2{transition-delay:0.2s}
      .fade-up.d3{transition-delay:0.3s}
      .fade-up.d4{transition-delay:0.4s}

      .serif{font-family:'Cormorant Garamond',Georgia,serif;font-weight:300;letter-spacing:-0.02em}
      .mono{font-family:'Inter',sans-serif;font-weight:400;letter-spacing:0.32em;text-transform:uppercase;font-size:10px}

      .gold-text{background:linear-gradient(135deg,#e8c87c 0%,#c9a84c 30%,#a88838 50%,#c9a84c 70%,#e8c87c 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 8s linear infinite}

      .hairline{border:1px solid rgba(255,255,255,0.05)}
      .hairline-gold{border:1px solid rgba(201,168,76,0.18)}

      .btn-primary{background:transparent;border:1px solid rgba(201,168,76,0.4);color:#e8c87c;padding:16px 32px;font-family:'Inter',sans-serif;font-size:11px;font-weight:400;letter-spacing:0.32em;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:12px;position:relative;overflow:hidden;transition:all 0.6s cubic-bezier(0.16,1,0.3,1)}
      .btn-primary::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05));opacity:0;transition:opacity 0.6s cubic-bezier(0.16,1,0.3,1)}
      .btn-primary:hover{border-color:rgba(232,200,124,0.7);color:#f4d896;transform:translateY(-1px)}
      .btn-primary:hover::before{opacity:1}
      .btn-primary > span{position:relative;z-index:1}

      .btn-ghost{background:transparent;border:1px solid rgba(255,255,255,0.08);color:#a8a094;padding:16px 32px;font-family:'Inter',sans-serif;font-size:11px;font-weight:400;letter-spacing:0.32em;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:12px;transition:all 0.6s cubic-bezier(0.16,1,0.3,1)}
      .btn-ghost:hover{border-color:rgba(255,255,255,0.18);color:#e8e4dc;transform:translateY(-1px)}

      .nav-link{color:rgba(232,228,220,0.5);font-size:11px;letter-spacing:0.28em;text-transform:uppercase;text-decoration:none;font-weight:400;transition:color 0.4s cubic-bezier(0.16,1,0.3,1);position:relative}
      .nav-link:hover{color:#e8c87c}

      .bento{background:linear-gradient(180deg,rgba(255,255,255,0.018) 0%,rgba(255,255,255,0.005) 100%);border:1px solid rgba(255,255,255,0.05);border-radius:20px;padding:2.5rem;position:relative;overflow:hidden;transition:all 0.8s cubic-bezier(0.16,1,0.3,1)}
      .bento::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent);opacity:0;transition:opacity 0.8s cubic-bezier(0.16,1,0.3,1)}
      .bento:hover{border-color:rgba(201,168,76,0.15);transform:translateY(-2px);background:linear-gradient(180deg,rgba(201,168,76,0.025) 0%,rgba(255,255,255,0.005) 100%)}
      .bento:hover::before{opacity:1}

      .price-card{background:linear-gradient(180deg,rgba(255,255,255,0.015) 0%,rgba(0,0,0,0.2) 100%);border:1px solid rgba(255,255,255,0.05);border-radius:24px;padding:3rem 2.5rem;position:relative;transition:all 0.8s cubic-bezier(0.16,1,0.3,1);backdrop-filter:blur(10px)}
      .price-card:hover{border-color:rgba(255,255,255,0.1);transform:translateY(-4px)}

      .price-card-featured{background:linear-gradient(180deg,rgba(201,168,76,0.06) 0%,rgba(201,168,76,0.01) 100%);border:1px solid rgba(201,168,76,0.25);position:relative}
      .price-card-featured::after{content:"";position:absolute;inset:-1px;border-radius:24px;padding:1px;background:linear-gradient(180deg,rgba(232,200,124,0.4),rgba(201,168,76,0.05) 50%,transparent);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
      .price-card-featured:hover{border-color:rgba(201,168,76,0.4);transform:translateY(-4px)}

      input[type=email]{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:0;padding:18px 20px;font-size:14px;color:#e8e4dc;font-family:'Inter',sans-serif;outline:none;transition:all 0.6s cubic-bezier(0.16,1,0.3,1);width:100%;letter-spacing:0.04em}
      input[type=email]:focus{border-color:rgba(201,168,76,0.4);background:rgba(201,168,76,0.02)}
      input[type=email]::placeholder{color:rgba(232,228,220,0.25);letter-spacing:0.04em}

      .submit-btn{background:linear-gradient(135deg,#e8c87c 0%,#c9a84c 50%,#a88838 100%);border:none;color:#080808;padding:18px 20px;font-family:'Inter',sans-serif;font-size:11px;font-weight:500;letter-spacing:0.32em;text-transform:uppercase;cursor:pointer;transition:all 0.6s cubic-bezier(0.16,1,0.3,1);width:100%;position:relative;overflow:hidden}
      .submit-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 20px 60px -20px rgba(201,168,76,0.4)}
      .submit-btn:disabled{cursor:not-allowed}

      .marquee{display:flex;gap:4rem;animation:marquee 40s linear infinite;white-space:nowrap}
      @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

      .divider-fine{height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)}

      .check-mark{width:16px;height:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:3px;color:#c9a84c}

      @media(max-width:768px){
        .nav-desktop{display:none !important}
        .hero-title{font-size:clamp(40px,10vw,64px) !important}
        .features-grid{grid-template-columns:1fr !important}
        .price-grid{grid-template-columns:1fr !important}
        .bento-large{grid-column:span 1 !important;grid-row:span 1 !important}
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

    {/* IntersectionObserver script */}
    <script dangerouslySetInnerHTML={{__html:`
      if(typeof window!=='undefined'){
        const obs=new IntersectionObserver((entries)=>{
          entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target)}});
        },{threshold:0.12,rootMargin:'0px 0px -60px 0px'});
        const init=()=>document.querySelectorAll('.fade-up').forEach(el=>obs.observe(el));
        if(document.readyState!=='loading')init();else document.addEventListener('DOMContentLoaded',init);
      }
    `}} />

    <div style={{position:"relative",zIndex:2}}>

      {/* NAV */}
      <nav style={{padding:"1.75rem 3rem",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"rgba(8,8,8,0.72)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",zIndex:100,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
          <div style={{width:"28px",height:"28px",border:"1px solid rgba(201,168,76,0.4)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
            <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"linear-gradient(135deg,#e8c87c,#a88838)"}} />
          </div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",fontWeight:400,letterSpacing:"0.18em",color:"#e8e4dc",textTransform:"uppercase"}}>
            ImmoFlow <span className="gold-text">AI</span>
          </div>
        </div>
        <div className="nav-desktop" style={{display:"flex",alignItems:"center",gap:"3rem"}}>
          <a href="#fonctionnalites" className="nav-link">Fonctionnalités</a>
          <a href="#tarifs" className="nav-link">Tarifs</a>
          <a href="#contact" className="nav-link">Contact</a>
          <a href="/sign-in" className="nav-link">Connexion</a>
          <a href="/app" className="btn-primary" style={{padding:"12px 24px",fontSize:"10px"}}>
            <span>Essayer</span>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{maxWidth:"1280px",margin:"0 auto",padding:"9rem 3rem 7rem",textAlign:"center",position:"relative"}}>

        <div className="fade-up" style={{display:"inline-flex",alignItems:"center",gap:"10px",padding:"8px 16px",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"100px",marginBottom:"3rem",background:"rgba(201,168,76,0.03)"}}>
          <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#c9a84c",boxShadow:"0 0 12px rgba(201,168,76,0.6)"}} />
          <span className="mono" style={{color:"#c9a84c",letterSpacing:"0.32em"}}>Intelligence Marketing Immobilière</span>
        </div>

        <h1 className="fade-up d1 serif hero-title" style={{fontSize:"clamp(48px,8vw,104px)",lineHeight:0.95,margin:"0 0 2rem",color:"#f0ece4"}}>
          L'art de vendre<br />
          <span style={{fontStyle:"italic",fontWeight:300}}>les biens </span>
          <span className="gold-text" style={{fontStyle:"italic",fontWeight:300}}>d'exception</span>
        </h1>

        <p className="fade-up d2" style={{fontSize:"17px",color:"rgba(232,228,220,0.55)",lineHeight:1.7,maxWidth:"640px",margin:"0 auto 3.5rem",fontWeight:300,letterSpacing:"0.01em"}}>
          ImmoFlow AI transforme vos notes de visite en pack marketing complet — annonce ciselée, storyboard vidéo et publication sociale — avec le ton d'un consultant en immobilier de prestige.
        </p>

        <div className="fade-up d3" style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/app" className="btn-primary">
            <span>Générer mon annonce</span>
            <span style={{position:"relative",zIndex:1}}>→</span>
          </a>
          <a href="#fonctionnalites" className="btn-ghost">
            <span>Découvrir la méthode</span>
          </a>
        </div>

        <p className="fade-up d4 mono" style={{marginTop:"3rem",color:"rgba(232,228,220,0.3)"}}>
          Sans engagement · Résultat en 10 secondes · Confidentialité absolue
        </p>

        {/* Decorative numerals */}
        <div className="fade-up d4" style={{display:"flex",justifyContent:"center",gap:"4rem",marginTop:"6rem",flexWrap:"wrap"}}>
          {[
            {n:"38M€",l:"Valeur moyenne traitée"},
            {n:"10s",l:"Génération complète"},
            {n:"3",l:"Formats livrés"},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div className="serif gold-text" style={{fontSize:"42px",lineHeight:1,marginBottom:"8px",fontWeight:300}}>{s.n}</div>
              <div className="mono" style={{color:"rgba(232,228,220,0.4)"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUEE — Maisons inspirantes */}
      <section style={{padding:"2rem 0",borderTop:"1px solid rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.04)",overflow:"hidden",background:"rgba(0,0,0,0.3)"}}>
        <div className="marquee">
          {[...Array(2)].map((_,k)=>(
            <div key={k} style={{display:"flex",gap:"4rem",alignItems:"center"}}>
              {["Paris VIIIe","Monaco","Saint-Tropez","Cap-Ferrat","Megève","Cannes","Île de Ré","Courchevel","Mougins","Saint-Jean-Cap-Ferrat"].map((v,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:"4rem"}}>
                  <span className="serif" style={{fontSize:"24px",color:"rgba(232,228,220,0.25)",fontStyle:"italic",fontWeight:300,whiteSpace:"nowrap"}}>{v}</span>
                  <span style={{color:"rgba(201,168,76,0.3)",fontSize:"8px"}}>◆</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES — BENTO GRID */}
      <section id="fonctionnalites" style={{maxWidth:"1280px",margin:"0 auto",padding:"9rem 3rem"}}>

        <div className="fade-up" style={{textAlign:"center",marginBottom:"5rem"}}>
          <p className="mono" style={{color:"#c9a84c",marginBottom:"1.5rem"}}>— L'atelier —</p>
          <h2 className="serif" style={{fontSize:"clamp(36px,5vw,64px)",color:"#f0ece4",margin:0,lineHeight:1.05}}>
            Un pack marketing complet,<br />
            <span style={{fontStyle:"italic"}}>orchestré comme</span> <span className="gold-text" style={{fontStyle:"italic"}}>une collection</span>
          </h2>
        </div>

        <div className="features-grid" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gridAutoRows:"minmax(220px,auto)",gap:"16px"}}>

          {/* Large card — Annonce */}
          <div className="bento bento-large fade-up" style={{gridColumn:"span 4",gridRow:"span 2",display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:"380px"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"2rem"}}>
                <div style={{width:"44px",height:"44px",border:"1px solid rgba(201,168,76,0.3)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span className="serif" style={{color:"#c9a84c",fontSize:"20px",fontStyle:"italic"}}>A</span>
                </div>
                <p className="mono" style={{color:"rgba(232,228,220,0.4)"}}>01 / Rédaction</p>
              </div>
              <h3 className="serif" style={{fontSize:"36px",color:"#f0ece4",margin:"0 0 1rem",lineHeight:1.1,fontWeight:300}}>Annonce <span style={{fontStyle:"italic"}} className="gold-text">ciselée</span></h3>
              <p style={{fontSize:"15px",color:"rgba(232,228,220,0.55)",lineHeight:1.7,margin:0,maxWidth:"480px",fontWeight:300}}>
                Titre architectural, description émotionnelle et points forts — composés dans le registre éditorial des grandes maisons parisiennes de prestige.
              </p>
            </div>
            <div style={{marginTop:"2rem",padding:"1.5rem",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:"12px",fontFamily:"'Cormorant Garamond',serif",fontSize:"15px",color:"rgba(232,228,220,0.7)",fontStyle:"italic",lineHeight:1.6,fontWeight:300}}>
              "Hôtel particulier discret, lové entre cour et jardin, où l'art de vivre haussmannien rencontre une rénovation contemporaine d'une rare exigence…"
            </div>
          </div>

          {/* Storyboard */}
          <div className="bento fade-up d1" style={{gridColumn:"span 2",gridRow:"span 1"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"1.5rem"}}>
              <div style={{width:"36px",height:"36px",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:0,height:0,borderLeft:"8px solid #c9a84c",borderTop:"5px solid transparent",borderBottom:"5px solid transparent",marginLeft:"2px"}} />
              </div>
              <p className="mono" style={{color:"rgba(232,228,220,0.4)"}}>02</p>
            </div>
            <h3 className="serif" style={{fontSize:"24px",color:"#f0ece4",margin:"0 0 0.75rem",lineHeight:1.1,fontWeight:300}}>Storyboard <span style={{fontStyle:"italic"}}>vidéo</span></h3>
            <p style={{fontSize:"13px",color:"rgba(232,228,220,0.5)",lineHeight:1.65,margin:0,fontWeight:300}}>6 plans caméra et voix off livrés à votre vidéaste.</p>
          </div>

          {/* Social */}
          <div className="bento fade-up d2" style={{gridColumn:"span 2",gridRow:"span 1"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"1.5rem"}}>
              <div style={{width:"36px",height:"36px",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:"#c9a84c",fontSize:"14px"}}>◇</span>
              </div>
              <p className="mono" style={{color:"rgba(232,228,220,0.4)"}}>03</p>
            </div>
            <h3 className="serif" style={{fontSize:"24px",color:"#f0ece4",margin:"0 0 0.75rem",lineHeight:1.1,fontWeight:300}}>Post <span style={{fontStyle:"italic"}}>social</span></h3>
            <p style={{fontSize:"13px",color:"rgba(232,228,220,0.5)",lineHeight:1.65,margin:0,fontWeight:300}}>Instagram et Facebook, hashtags inclus. Prêt à publier.</p>
          </div>

          {/* PDF Export */}
          <div className="bento fade-up d3" style={{gridColumn:"span 3",gridRow:"span 1"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"1.5rem"}}>
              <div style={{width:"36px",height:"36px",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:"#c9a84c",fontSize:"14px"}}>↓</span>
              </div>
              <p className="mono" style={{color:"rgba(232,228,220,0.4)"}}>04 / Livraison</p>
            </div>
            <h3 className="serif" style={{fontSize:"24px",color:"#f0ece4",margin:"0 0 0.75rem",lineHeight:1.1,fontWeight:300}}>PDF <span style={{fontStyle:"italic"}} className="gold-text">d'orfèvre</span></h3>
            <p style={{fontSize:"13px",color:"rgba(232,228,220,0.5)",lineHeight:1.65,margin:0,fontWeight:300}}>Document élégant aux couleurs de votre maison, prêt à transmettre à votre acquéreur ou à votre vendeur.</p>
          </div>

          {/* Confidentialité */}
          <div className="bento fade-up d4" style={{gridColumn:"span 3",gridRow:"span 1"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"1.5rem"}}>
              <div style={{width:"36px",height:"36px",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:"#c9a84c",fontSize:"14px"}}>✦</span>
              </div>
              <p className="mono" style={{color:"rgba(232,228,220,0.4)"}}>05 / Garantie</p>
            </div>
            <h3 className="serif" style={{fontSize:"24px",color:"#f0ece4",margin:"0 0 0.75rem",lineHeight:1.1,fontWeight:300}}>Discrétion <span style={{fontStyle:"italic"}}>absolue</span></h3>
            <p style={{fontSize:"13px",color:"rgba(232,228,220,0.5)",lineHeight:1.65,margin:0,fontWeight:300}}>Vos notes restent vos notes. Aucune donnée client n'entraîne nos modèles. Hébergement européen.</p>
          </div>

        </div>
      </section>

      <div className="divider-fine" style={{maxWidth:"720px",margin:"0 auto"}} />

      {/* COMMENT ÇA MARCHE */}
      <section style={{maxWidth:"1080px",margin:"0 auto",padding:"9rem 3rem"}}>
        <div className="fade-up" style={{textAlign:"center",marginBottom:"5rem"}}>
          <p className="mono" style={{color:"#c9a84c",marginBottom:"1.5rem"}}>— La méthode —</p>
          <h2 className="serif" style={{fontSize:"clamp(36px,5vw,64px)",color:"#f0ece4",margin:0,lineHeight:1.05}}>
            Trois gestes,<br /><span style={{fontStyle:"italic"}} className="gold-text">dix secondes</span>
          </h2>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:"24px",overflow:"hidden"}}>
          {[
            {num:"I",titre:"Confiez vos notes",desc:"Notes manuscrites retranscrites, mots-clés, impressions de visite — tous formats acceptés."},
            {num:"II",titre:"L'IA compose",desc:"Notre modèle, entraîné sur le registre éditorial du luxe, orchestre votre pack en quelques instants."},
            {num:"III",titre:"Recevez l'œuvre",desc:"Annonce, storyboard, post et PDF. Tout est prêt à transmettre, publier ou imprimer."},
          ].map((step,i)=>(
            <div key={i} className="fade-up" style={{padding:"3rem 2.5rem",background:"rgba(8,8,8,0.6)",transitionDelay:`${i*0.1}s`,position:"relative"}}>
              <div className="serif gold-text" style={{fontSize:"56px",lineHeight:1,marginBottom:"1.5rem",fontStyle:"italic",fontWeight:300}}>{step.num}</div>
              <h3 className="serif" style={{fontSize:"22px",color:"#f0ece4",margin:"0 0 0.75rem",fontWeight:300}}>{step.titre}</h3>
              <p style={{fontSize:"14px",color:"rgba(232,228,220,0.5)",lineHeight:1.7,margin:0,fontWeight:300}}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-fine" style={{maxWidth:"720px",margin:"0 auto"}} />

      {/* TARIFS */}
      <section id="tarifs" style={{maxWidth:"1200px",margin:"0 auto",padding:"9rem 3rem"}}>
        <div className="fade-up" style={{textAlign:"center",marginBottom:"5rem"}}>
          <p className="mono" style={{color:"#c9a84c",marginBottom:"1.5rem"}}>— Honoraires —</p>
          <h2 className="serif" style={{fontSize:"clamp(36px,5vw,64px)",color:"#f0ece4",margin:0,lineHeight:1.05}}>
            Trois formules,<br /><span style={{fontStyle:"italic"}}>une </span><span style={{fontStyle:"italic"}} className="gold-text">même exigence</span>
          </h2>
        </div>

        <div className="price-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"20px",alignItems:"stretch"}}>

          {/* SOLO */}
          <div className="price-card fade-up">
            <p className="mono" style={{color:"rgba(232,228,220,0.4)",marginBottom:"2rem"}}>Solo</p>
            <div style={{marginBottom:"0.5rem"}}>
              <span className="serif" style={{fontSize:"56px",color:"#f0ece4",fontWeight:300,letterSpacing:"-0.03em"}}>39,99€</span>
              <span style={{fontSize:"13px",color:"rgba(232,228,220,0.4)",marginLeft:"8px"}}>/ mois</span>
            </div>
           <p style={{color:"rgba(232,228,220,0.45)",margin:"0 0 2.5rem",fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif",fontSize:"16px",fontWeight:300}}>L&apos;agent indépendant qui débute</p>

            <div style={{height:"1px",background:"rgba(255,255,255,0.05)",margin:"0 0 2rem"}} />

            <div style={{display:"flex",flexDirection:"column",gap:"14px",marginBottom:"2.5rem"}}>
              {["30 annonces par mois","Pack complet : Annonce, Storyboard, Post","Export PDF élégant","Support par courriel"].map((item,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"12px"}}>
                  <span className="check-mark">+</span>
                  <span style={{fontSize:"14px",color:"rgba(232,228,220,0.7)",fontWeight:300,lineHeight:1.5}}>{item}</span>
                </div>
              ))}
            </div>

            <a href="#contact" className="btn-ghost" style={{display:"flex",justifyContent:"center",width:"100%"}}>
              <span>Commencer</span>
            </a>
          </div>

          {/* PRESTIGE — Featured */}
          <div className="price-card price-card-featured fade-up d1">
            <div style={{position:"absolute",top:"-1px",left:"50%",transform:"translateX(-50%) translateY(-50%)",background:"#080808",padding:"6px 16px",border:"1px solid rgba(201,168,76,0.3)",borderRadius:"100px",whiteSpace:"nowrap"}}>
              <span className="mono gold-text" style={{letterSpacing:"0.32em"}}>Le plus choisi</span>
            </div>

            <p className="mono gold-text" style={{marginBottom:"2rem"}}>Prestige</p>
            <div style={{marginBottom:"0.5rem"}}>
              <span className="serif gold-text" style={{fontSize:"56px",fontWeight:300,letterSpacing:"-0.03em"}}>79,99€</span>
              <span style={{fontSize:"13px",color:"rgba(232,228,220,0.4)",marginLeft:"8px"}}>/ mois</span>
            </div>
            <p className="serif" style={{margin:"0 0 2.5rem",fontStyle:"italic",fontSize:"16px",color:"rgba(232,228,220,0.55)",fontWeight:300}}>L'agent en pleine activité</p>

            <div style={{height:"1px",background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)",margin:"0 0 2rem"}} />

            <div style={{display:"flex",flexDirection:"column",gap:"14px",marginBottom:"2.5rem"}}>
              {["Annonces illimitées","Pack complet livré en 10 secondes","Export PDF premium personnalisé","Historique complet de vos annonces","Support prioritaire dédié","Accès aux nouvelles fonctionnalités"].map((item,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"12px"}}>
                  <span className="check-mark" style={{color:"#e8c87c"}}>+</span>
                  <span style={{fontSize:"14px",color:"rgba(232,228,220,0.85)",fontWeight:300,lineHeight:1.5}}>{item}</span>
                </div>
              ))}
            </div>

            <a href="#contact" className="btn-primary" style={{display:"flex",justifyContent:"center",width:"100%",borderColor:"rgba(201,168,76,0.6)"}}>
              <span>Choisir Prestige</span>
              <span style={{position:"relative",zIndex:1}}>→</span>
            </a>
          </div>

          {/* AGENCE */}
          <div className="price-card fade-up d2">
            <p className="mono" style={{color:"rgba(232,228,220,0.4)",marginBottom:"2rem"}}>Agence</p>
            <div style={{marginBottom:"0.5rem"}}>
              <span className="serif" style={{fontSize:"56px",color:"#f0ece4",fontWeight:300,letterSpacing:"-0.03em"}}>199€</span>
              <span style={{fontSize:"13px",color:"rgba(232,228,220,0.4)",marginLeft:"8px"}}>/ mois</span>
            </div>
            <p className="serif" style={{margin:"0 0 2.5rem",fontStyle:"italic",fontSize:"16px",color:"rgba(232,228,220,0.55)",fontWeight:300}}>La maison toute entière</p>

            <div style={{height:"1px",background:"rgba(255,255,255,0.05)",margin:"0 0 2rem"}} />

            <div style={{display:"flex",flexDirection:"column",gap:"14px",marginBottom:"2.5rem"}}>
              {["Jusqu'à 10 collaborateurs","Tout le plan Prestige inclus","Logo de votre maison sur les PDF","Onboarding personnalisé sur place","Account manager dédié","Facturation centralisée"].map((item,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"12px"}}>
                  <span className="check-mark">+</span>
                  <span style={{fontSize:"14px",color:"rgba(232,228,220,0.7)",fontWeight:300,lineHeight:1.5}}>{item}</span>
                </div>
              ))}
            </div>

            <a href="#contact" className="btn-ghost" style={{display:"flex",justifyContent:"center",width:"100%"}}>
              <span>Nous contacter</span>
            </a>
          </div>

        </div>

        <p className="fade-up mono" style={{textAlign:"center",marginTop:"3rem",color:"rgba(232,228,220,0.3)"}}>
          Tous les tarifs s'entendent hors taxes · Engagement mensuel · Résiliation à tout moment
        </p>
      </section>

      <div className="divider-fine" style={{maxWidth:"720px",margin:"0 auto"}} />

      {/* TESTIMONIAL / QUOTE */}
      <section style={{maxWidth:"880px",margin:"0 auto",padding:"9rem 3rem",textAlign:"center"}}>
        <div className="fade-up">
          <div style={{fontSize:"60px",color:"rgba(201,168,76,0.3)",lineHeight:1,marginBottom:"1.5rem",fontFamily:"'Cormorant Garamond',serif"}}>"</div>
          <p className="serif" style={{fontSize:"clamp(24px,3.5vw,40px)",color:"#f0ece4",lineHeight:1.35,margin:"0 0 2.5rem",fontStyle:"italic",fontWeight:300}}>
            Le ton est exactement celui que nous transmettons à nos rédacteurs depuis vingt ans. Le gain de temps est considérable, le résultat est <span className="gold-text">d'une justesse rare</span>.
          </p>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
            <p className="mono" style={{color:"#e8c87c"}}>— Anonyme —</p>
            <p style={{fontSize:"13px",color:"rgba(232,228,220,0.4)",margin:0,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontWeight:300}}>Directrice associée · Agence de la rive gauche</p>
          </div>
        </div>
      </section>

      <div className="divider-fine" style={{maxWidth:"720px",margin:"0 auto"}} />

      {/* WAITLIST / CONTACT */}
      <section id="contact" style={{maxWidth:"640px",margin:"0 auto",padding:"9rem 3rem",textAlign:"center"}}>
        <div className="fade-up">
          <p className="mono" style={{color:"#c9a84c",marginBottom:"1.5rem"}}>— Accès anticipé —</p>
          <h2 className="serif" style={{fontSize:"clamp(36px,5vw,56px)",color:"#f0ece4",margin:"0 0 1.5rem",lineHeight:1.05}}>
            Rejoignez le <span style={{fontStyle:"italic"}} className="gold-text">premier cercle</span>
          </h2>
          <p style={{fontSize:"16px",color:"rgba(232,228,220,0.55)",lineHeight:1.75,margin:"0 0 3rem",fontWeight:300}}>
            Soyez parmi les premiers agents à accéder à ImmoFlow AI. Nos invités fondateurs reçoivent une offre de lancement exclusive et un accompagnement personnel.
          </p>
        </div>

        {!sent ? (
          <div className="fade-up d1" style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="votre.adresse@email.com"
              onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={sending||!email.includes("@")}
              className="submit-btn"
              style={{opacity:sending||!email.includes("@")?0.35:1}}
            >
              {sending?"Envoi en cours…":"Demander mon invitation"}
            </button>
            <p className="mono" style={{color:"rgba(232,228,220,0.3)",marginTop:"8px"}}>Aucun spam · Désabonnement en un clic</p>
          </div>
        ) : (
          <div className="fade-up" style={{background:"linear-gradient(180deg,rgba(201,168,76,0.06),rgba(201,168,76,0.01))",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"20px",padding:"3rem 2rem"}}>
            <div style={{width:"56px",height:"56px",borderRadius:"50%",border:"1px solid rgba(201,168,76,0.4)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.5rem"}}>
              <span className="serif gold-text" style={{fontSize:"28px",fontStyle:"italic",fontWeight:300}}>✦</span>
            </div>
            <h3 className="serif" style={{fontSize:"28px",color:"#f0ece4",fontWeight:300,margin:"0 0 1rem"}}>Votre place est réservée</h3>
            <p style={{fontSize:"14px",color:"rgba(232,228,220,0.55)",margin:0,lineHeight:1.7,fontWeight:300}}>Nous vous contacterons personnellement dans les prochains jours avec votre accès prioritaire et votre offre de lancement.</p>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:"1px solid rgba(255,255,255,0.04)",padding:"4rem 3rem 3rem",background:"rgba(0,0,0,0.4)"}}>
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
            <a href="#fonctionnalites" className="nav-link">Fonctionnalités</a>
            <a href="#tarifs" className="nav-link">Tarifs</a>
            <a href="#contact" className="nav-link">Contact</a>
            <a href="/sign-in" className="nav-link">Connexion</a>
          </div>

          <div className="divider-fine" style={{width:"120px"}} />

          <p className="serif" style={{fontSize:"15px",color:"rgba(232,228,220,0.4)",margin:0,fontStyle:"italic",textAlign:"center",fontWeight:300}}>
            Le marketing immobilier de prestige, à l'ère de l'intelligence.
          </p>
          <p className="mono" style={{color:"rgba(232,228,220,0.25)",margin:0}}>© MMXXVI · ImmoFlow AI · Paris</p>
        </div>
      </footer>

    </div>
  </div>
);
}
