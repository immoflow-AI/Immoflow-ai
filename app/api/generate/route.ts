import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── Limites par plan ─────────────────────────────────────────────────────────

const PLAN_LIMITS: Record<string, number> = {
  solo:     15,
  prestige: Infinity,
  agence:   Infinity,
  free:     2,
};

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

export interface RapportData {
  accroche_portails: string;
  pitch_agent: string;
}

export interface ImmoFlowResult {
  annonce_pro: AnnonceProData;
  storyboard_video: StoryboardScene[];
  post_reseaux: string;
  // Prestige+ exclusifs
  post_instagram?: string;
  post_linkedin?: string;
  post_facebook?: string;
  variante_b?: AnnonceProData;
  rapport?: RapportData;
}

// ─── System Prompt STANDARD (Plan Solo + Free) ───────────────────────────────

const SYSTEM_PROMPT_STANDARD = `Tu es un consultant senior en marketing immobilier de prestige pour l'une des meilleures agences parisiennes du marché du luxe. Depuis 20 ans, tu transformes des biens d'exception en récits inoubliables.

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
    { "plan": "...", "voix_off": "..." }
  ],
  "post_reseaux": "Post Instagram/Facebook. 5-7 lignes. Accroche émotionnelle, 2-3 points clés avec emojis, appel à l'action discret, 4-6 hashtags pertinents en fin de post."
}`;

// ─── System Prompt LUXE PRESTIGE ─────────────────────────────────────────────

const SYSTEM_PROMPT_LUXE = `Tu es le directeur artistique d'une maison de vente aux enchères de prestige — entre Sotheby's et Christie's — spécialisé dans l'immobilier d'exception mondiale. Tu as vendu des penthouses à Monaco, des villas à Cap-Ferret, des hôtels particuliers à Paris. Chaque bien que tu présentes devient un objet de désir absolu.

TON STYLE EST UNIQUE ET EXCLUSIF :
- Vocabulaire de haute couture appliqué à l'architecture : "couture", "sur-mesure", "pièce unique", "collector"
- Références culturelles et artistiques : compare les espaces à des œuvres d'art, cite des architectes, des matières rares
- Ton cinématographique dans le storyboard : tu penses comme un réalisateur de films de luxe (Luca Guadagnino, Wong Kar-wai)
- Chaque phrase doit créer une image mentale immédiate et désirable
- Tu identifies et valorises ce qui est UNIQUE dans chaque bien — jamais de généralités
- Tu parles à un acheteur qui possède déjà tout — tu dois lui vendre un sentiment, une identité, un statut

RÈGLES ABSOLUES :
- Réponds UNIQUEMENT avec un objet JSON valide
- Aucun texte avant ou après le JSON
- Aucune balise markdown, aucun \`\`\`json
- Respecte scrupuleusement la structure demandée

STRUCTURE JSON EXACTE À RETOURNER :
{
  "annonce_pro": {
    "titre": "Titre d'exception — poétique, mémorable, cinq étoiles (12-16 mots max)",
    "description": "4 à 5 phrases d'une richesse sensorielle absolue. Commence par une image forte et inattendue. Décris l'architecture comme une sculpture vivante. Évoque la lumière à différentes heures. Termine par une phrase qui crée un désir irrésistible d'appartenance.",
    "points_forts": [
      "Point fort 1 — formulé comme une ligne de catalogue de maison de vente aux enchères",
      "Point fort 2",
      "Point fort 3",
      "Point fort 4",
      "Point fort 5",
      "Point fort 6"
    ]
  },
  "storyboard_video": [
    {
      "plan": "Description cinématographique précise : angle, mouvement, lumière, durée suggérée, ambiance",
      "voix_off": "Narration de haute volée — 2-3 phrases, ton Sotheby's meets cinéma d'auteur"
    },
    { "plan": "...", "voix_off": "..." },
    { "plan": "...", "voix_off": "..." },
    { "plan": "...", "voix_off": "..." },
    { "plan": "...", "voix_off": "..." },
    { "plan": "...", "voix_off": "..." },
    { "plan": "...", "voix_off": "..." }
  ],
  "post_reseaux": "Post Instagram premium. 6-8 lignes. Commence par une question rhétorique ou une affirmation audacieuse. Storytelling émotionnel. Emojis rares et élégants. Appel à l'action exclusif ('Sur invitation uniquement', 'Visites privées'). 5-7 hashtags ultra-ciblés luxe international."
}`;

// ─── Prompt Prestige & Agence ────────────────────────────────────────────────

function buildPrestigePrompt(sceneCount: number, luxeStyle: boolean): string {
  const persona = luxeStyle
    ? `Tu es le directeur artistique d'une maison de vente aux enchères de prestige — entre Sotheby's et Christie's — spécialisé dans l'immobilier d'exception mondiale.

TON STYLE EST UNIQUE ET EXCLUSIF :
- Vocabulaire de haute couture : "couture", "sur-mesure", "pièce unique", "collector"
- Références culturelles et artistiques, matières rares, architectes iconiques
- Ton cinématographique (Luca Guadagnino, Wong Kar-wai)
- Tu parles à un acheteur qui possède déjà tout — vends un sentiment, une identité, un statut`
    : `Tu es un consultant senior en marketing immobilier de prestige pour l'une des meilleures agences parisiennes.

TON STYLE :
- Ton : élégant, évocateur, exclusif — jamais vendeur ou vulgaire
- Vocabulaire : raffiné, architectural, sensoriel (lumière, volumes, matières)
- Tu ne vends pas un bien, tu proposes un art de vivre`;

  const scenes = Array.from({ length: sceneCount }, (_, i) =>
    i === 0
      ? `    {\n      "plan": "${luxeStyle ? "Description cinématographique : angle, mouvement, lumière, ambiance" : "Description précise du plan caméra (angle, mouvement, sujet)"}",\n      "voix_off": "${luxeStyle ? "Narration de haute volée — 2-3 phrases, ton Sotheby's" : "Texte narratif pour ce plan (1-2 phrases)"}"\n    }`
      : `    { "plan": "...", "voix_off": "..." }`
  ).join(",\n");

  const pfDesc = luxeStyle
    ? '"Point fort — formulé comme une ligne de catalogue Sotheby\'s"'
    : '"Point fort — concis, factuel et désirable"';

  return `${persona}

RÈGLES ABSOLUES :
- Réponds UNIQUEMENT avec un objet JSON valide
- Aucun texte avant ou après le JSON
- Aucune balise markdown, aucun \`\`\`json
- Respecte scrupuleusement la structure demandée

STRUCTURE JSON EXACTE À RETOURNER :
{
  "annonce_pro": {
    "titre": "Titre ${luxeStyle ? "d'exception — poétique, mémorable (12-16 mots max)" : "accrocheur et précis (10-14 mots max)"}",
    "description": "${luxeStyle ? "4 à 5 phrases d'une richesse sensorielle absolue. Commence par une image forte et inattendue. Décris l'architecture comme une sculpture vivante. Termine par une phrase créant un désir d'appartenance." : "3 à 4 phrases. Commence par l'émotion, décris volumes et lumière, évoque l'environnement, termine par une promesse de vie."}",
    "points_forts": [
      ${pfDesc},
      "Point fort 2",
      "Point fort 3",
      "Point fort 4",
      "Point fort 5",
      "Point fort 6"
    ]
  },
  "storyboard_video": [
${scenes}
  ],
  "post_reseaux": "Post générique réseaux sociaux. 5-7 lignes, emojis, 4-6 hashtags.",
  "post_instagram": "Post Instagram optimisé : accroche visuelle forte, storytelling émotionnel 5-6 lignes, emojis élégants, appel à l'action exclusif ('Visites privées sur rendez-vous'), 5-7 hashtags luxe ciblés.",
  "post_linkedin": "Post LinkedIn professionnel : titre accrocheur sans emoji, ton expert et sobre, 4-5 paragraphes courts, angle investissement / rareté du bien, 3-4 hashtags sectoriels.",
  "post_facebook": "Post Facebook : ton chaleureux mais premium, description vivante de l'expérience de vie dans ce bien, invitation à une visite privée, 2-3 hashtags.",
  "variante_b": {
    "titre": "Titre alternatif — angle ou cible différents (investisseur, famille, expatrié, etc.)",
    "description": "Description alternative avec un angle narratif différent — histoire du lieu, dimension patrimoniale, ou art de vivre spécifique.",
    "points_forts": [
      "Point fort alternatif 1 — perspective complémentaire",
      "Point fort alternatif 2",
      "Point fort alternatif 3",
      "Point fort alternatif 4",
      "Point fort alternatif 5",
      "Point fort alternatif 6"
    ]
  },
  "rapport": {
    "accroche_portails": "Accroche 55-60 caractères max pour portails (SeLoger, LeBonCoin, etc.) — percutante, factuelle, désirable.",
    "pitch_agent": "Pitch oral 30 secondes (~75-90 mots) pour présenter le bien en rendez-vous : ton personnel, points distinctifs clés, invitation à voir."
  }
}`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { notes, mode, userId, plan } = await req.json();

    if (!notes || typeof notes !== "string" || notes.trim().length === 0) {
      return NextResponse.json(
        { error: "Le champ 'notes' est requis et ne peut pas être vide." },
        { status: 400 }
      );
    }

    // ── Vérification de la limite d'annonces ──
    if (userId) {
      const userPlan = plan || "free";
      const limit = PLAN_LIMITS[userPlan] ?? 2;

      if (limit !== Infinity) {
        // Clé Redis : reset chaque mois
        const month = new Date().toISOString().slice(0, 7); // "2026-05"
        const key = `usage:${userId}:${month}`;

        const current = await redis.get<number>(key) || 0;

        if (current >= limit) {
          return NextResponse.json(
            {
              error: `Limite atteinte. Votre plan ${userPlan} inclut ${limit} annonces/mois. Passez au plan supérieur pour continuer.`,
              limitReached: true,
            },
            { status: 403 }
          );
        }

        // Incrémenter le compteur
        await redis.incr(key);
        // Expire après 35 jours
        await redis.expire(key, 35 * 24 * 60 * 60);
      }
    }

    // ── Sélection du prompt ──
    const userPlan: string = plan || "free";
    const isPrestige = userPlan === "prestige" || userPlan === "agence";
    const sceneCount = userPlan === "agence" ? 8 : userPlan === "prestige" ? 6 : 3;

    let systemPrompt: string;
    if (isPrestige) {
      systemPrompt = buildPrestigePrompt(sceneCount, mode === "luxe");
    } else {
      systemPrompt = mode === "luxe" ? SYSTEM_PROMPT_LUXE : SYSTEM_PROMPT_STANDARD;
    }

    const client = new Groq();

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: mode === "luxe" ? 0.85 : 0.7,
      max_tokens: isPrestige ? 4000 : mode === "luxe" ? 2000 : 1500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Voici mes notes de visite brutes :\n\n${notes.trim()}\n\nGénère le pack marketing complet en JSON.`,
        },
      ],
    });

    const rawText = completion.choices[0]?.message?.content ?? "";

    if (!rawText) {
      return NextResponse.json(
        { error: "L'IA n'a retourné aucun contenu. Réessayez." },
        { status: 500 }
      );
    }

    const cleanJson = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let result: ImmoFlowResult;
    try {
      result = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json(
        { error: "L'IA a retourné une réponse invalide. Réessayez." },
        { status: 500 }
      );
    }

    if (!result.annonce_pro || !result.storyboard_video || !result.post_reseaux) {
      return NextResponse.json(
        { error: "La réponse de l'IA est incomplète. Réessayez." },
        { status: 500 }
      );
    }

    // ── Historique Redis ──
    if (userId) {
      const historyKey = `history:${userId}`;
      const entry = JSON.stringify({
        id: Date.now(),
        date: new Date().toISOString(),
        titre: result.annonce_pro?.titre ?? "",
        plan: userPlan,
      });
      await redis.lpush(historyKey, entry);
      await redis.ltrim(historyKey, 0, 29);
      await redis.expire(historyKey, 90 * 24 * 60 * 60);
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error: unknown) {
    console.error("Erreur API ImmoFlow/Groq:", error);

    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { status: number };
      if (apiError.status === 401) {
        return NextResponse.json({ error: "Clé API invalide." }, { status: 401 });
      }
      if (apiError.status === 429) {
        return NextResponse.json({ error: "Limite de requêtes atteinte. Patientez." }, { status: 429 });
      }
    }

    return NextResponse.json(
      { error: "Une erreur serveur est survenue. Réessayez." },
      { status: 500 }
    );
  }
}
