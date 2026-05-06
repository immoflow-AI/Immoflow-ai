import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email invalide." },
        { status: 400 }
      );
    }

    // Email de notification à vous (l'admin)
    await resend.emails.send({
      from: "ImmoFlow AI <onboarding@resend.dev>",
      to: "gabincoulon@icloud.com", // 👈 Remplacez par votre email
      subject: "✦ Nouvelle inscription — Liste d'attente ImmoFlow AI",
      html: `
        <div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;padding:2rem;background:#0d0b09;color:#e0d8cc;border-radius:12px;">
          <h1 style="color:#c9a84c;font-size:20px;font-weight:400;letter-spacing:2px;text-transform:uppercase;margin:0 0 1rem;">ImmoFlow AI</h1>
          <p style="color:#9a8e80;font-size:13px;margin:0 0 1.5rem;">Nouvelle inscription sur la liste d'attente :</p>
          <div style="background:#141210;border:0.5px solid #2a2520;border-radius:8px;padding:1rem 1.25rem;margin-bottom:1.5rem;">
            <p style="color:#c9a84c;font-size:16px;margin:0;">📧 ${email}</p>
          </div>
          <p style="color:#4a4030;font-size:11px;letter-spacing:1px;">Généré par ImmoFlow AI · Marketing de Prestige</p>
        </div>
      `,
    });

    // Email de confirmation à l'utilisateur
    await resend.emails.send({
      from: "ImmoFlow AI <onboarding@resend.dev>",
      to: email,
      subject: "✦ Bienvenue sur la liste d'attente ImmoFlow AI",
      html: `
        <div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;padding:2rem;background:#0d0b09;color:#e0d8cc;border-radius:12px;">
          <h1 style="color:#c9a84c;font-size:20px;font-weight:400;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">ImmoFlow AI</h1>
          <p style="color:#4a4030;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 2rem;">Marketing de Prestige</p>

          <h2 style="font-size:22px;font-weight:400;color:#e8dcc8;margin:0 0 1rem;">Vous êtes sur la liste ✦</h2>
          <p style="color:#9a8e80;font-size:14px;line-height:1.8;margin:0 0 1.5rem;">
            Merci pour votre intérêt. Vous faites partie des premiers agents à rejoindre ImmoFlow AI.
            Nous vous contacterons très prochainement avec votre accès prioritaire et une offre de lancement exclusive.
          </p>

          <div style="background:#141210;border:0.5px solid #c9a84c44;border-radius:8px;padding:1.25rem;margin-bottom:1.5rem;">
            <p style="color:#c9a84c;font-size:13px;font-weight:400;margin:0 0 8px;">En attendant, essayez gratuitement :</p>
            <a href="https://immoflow-ai.vercel.app/app" style="color:#c9a84c;font-size:13px;">→ Générer mon annonce gratuite</a>
          </div>

          <p style="color:#3a3028;font-size:11px;letter-spacing:1px;margin:0;">ImmoFlow AI · Marketing de Prestige · Propulsé par l'IA</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Erreur Resend:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi. Réessayez." },
      { status: 500 }
    );
  }
}
