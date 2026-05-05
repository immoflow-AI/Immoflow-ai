import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnnonceProData {
  titre: string;
  description: string;
  points_forts: string[];
}

export interface StoryboardScene {
  plan: string;
  voix_off: string;
}

export interface ImmoFlowResult {
  annonce_pro: AnnonceProData;
  storyboard_video: StoryboardScene[];
  post_reseaux: string;
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es un consultant senior en marketing immobilier de prestige pour l'une des meilleures agences parisiennes du marché du luxe. Depuis 20 ans, tu transformes des biens d'exception en récits inoubliables.

TON STYLE :
- Ton : élégant, évocateur, exclusif — jamais vendeur ou vulgaire
- Vocabulaire : raffiné, architectural, sensoriel (lumière, volumes, matières)
- Tu ne vends pas un bien, tu proposes un art de vivre
- Tu t'adresses à une clientèle internationale fortunée et cultivée
- Chaque mot est pesé : rien de générique, tout est précis et distinctif

RÈGLES ABSOLUES :
- Réponds UNIQUEMENT avec un objet JSON valide
- Aucun texte avant ou après le JSON
- Aucune balise markdown, aucun \`\`\`json
- Respecte scrupuleusement la structure demandée

STRUCTURE JSON EXACTE À RETOURNER :
{
  "annonce_pro": {
    "titre": "Titre accrocheur, poétique et précis (10-14 mots max)",
    "description": "3 à 4 phrases. Commence par l'émotion, décris les volumes et la lumière, évoque le quartier ou l'environnement, termine par une promesse de vie. Ton lyrique mais ancré dans le concret.",
    "points_forts": [
      "Point fort 1 — concis, factuel et désirable",
      "Point fort 2",
      "Point fort 3",
      "Point fort 4",
      "Point fort 5"
    ]
  },
  "storyboard_video": [
    {
      "plan": "Description précise du plan caméra (angle, mouvement, sujet)",
      "voix_off": "Texte de la voix off pour ce plan (1-2 phrases, ton narratif)"
    },
    { "plan": "...", "voix_off": "..." },
    { "plan": "...", "voix_off": "..." },
    { "plan": "...", "voix_off": "..." },
    { "plan": "...", "voix_off": "..." },
    { "plan": "...", "voix_off": "..." }
  ],
  "post_reseaux": "Post Instagram/Facebook. 5-7 lignes. Accroche émotionnelle, 2-3 points clés avec emojis ✨🏛️🔑, appel à l'action discret, 4-6 hashtags pertinents en fin de post."
}`;

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json();

    if (!notes || typeof notes !== "string" || notes.trim().length === 0) {
      return NextResponse.json(
        { error: "Le champ 'notes' est requis et ne peut pas être vide." },
        { status: 400 }
      );
    }

    if (notes.trim().length < 10) {
      return NextResponse.json(
        { error: "Les notes sont trop courtes. Ajoutez plus de détails sur le bien." },
        { status: 400 }
      );
    }

    // Initialise le client Groq — lit automatiquement GROQ_API_KEY
    const client = new Groq();

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",   // Llama 3 70b — offre gratuite Groq
      temperature: 0.7,           // Un peu de créativité, mais reste cohérent
      max_tokens: 1500,
      response_format: { type: "json_object" }, // Force le mode JSON natif de Groq
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Voici mes notes de visite brutes :\n\n${notes.trim()}\n\nGénère le pack marketing complet en JSON.`,
        },
      ],
    });

    // Extraire le contenu texte
    const rawText = completion.choices[0]?.message?.content ?? "";

    if (!rawText) {
      return NextResponse.json(
        { error: "L'IA n'a retourné aucun contenu. Réessayez." },
        { status: 500 }
      );
    }

    // Nettoyer les éventuelles balises markdown résiduelles et parser
    const cleanJson = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    let result: ImmoFlowResult;
    try {
      result = JSON.parse(cleanJson);
    } catch {
      console.error("Erreur de parsing JSON. Réponse brute :", rawText);
      return NextResponse.json(
        { error: "L'IA a retourné une réponse invalide. Réessayez." },
        { status: 500 }
      );
    }

    // Valider la structure minimale
    if (!result.annonce_pro || !result.storyboard_video || !result.post_reseaux) {
      return NextResponse.json(
        { error: "La réponse de l'IA est incomplète. Réessayez." },
        { status: 500 }
      );
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error: unknown) {
    console.error("Erreur API ImmoFlow/Groq:", error);

    // Gestion des erreurs Groq spécifiques
    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { status: number; message?: string };

      if (apiError.status === 401) {
        return NextResponse.json(
          { error: "Clé API Groq invalide. Vérifiez votre fichier .env.local." },
          { status: 401 }
        );
      }
      if (apiError.status === 429) {
        return NextResponse.json(
          { error: "Limite de requêtes Groq atteinte. Patientez quelques secondes." },
          { status: 429 }
        );
      }
      if (apiError.status === 503) {
        return NextResponse.json(
          { error: "Le modèle Groq est temporairement indisponible. Réessayez." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Une erreur serveur est survenue. Réessayez." },
      { status: 500 }
    );
  }
}
