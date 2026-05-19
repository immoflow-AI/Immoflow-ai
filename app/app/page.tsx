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
  const H = 297;
  const margin = 22;
  const maxW = W - margin * 2;

  // ─── Palette ──────────────────────────────────────────────────────────────
  const BG     = [8, 8, 8] as const;          // #080808 fond profond
  const IVORY  = [240, 236, 228] as const;    // #f0ece4 texte principal
  const IVORY_DIM = [180, 175, 165] as const; // texte secondaire
  const IVORY_MUTED = [120, 115, 105] as const;
  const GOLD   = [201, 168, 76] as const;     // #c9a84c doré
  const GOLD_LIGHT = [232, 200, 124] as const;
  const GOLD_DIM = [140, 115, 55] as const;
  const HAIRLINE = [40, 38, 34] as const;     // bordures fines

  // ─── Helpers ──────────────────────────────────────────────────────────────

  // Couvre toute la page avec le fond sombre
  const paintBackground = () => {
    doc.setFillColor(BG[0], BG[1], BG[2]);
    doc.rect(0, 0, W, H, "F");
  };

  // Nettoie les caractères non supportés par jsPDF (emojis, glyphes spéciaux)
  const clean = (text: string): string => {
    return text
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
      .replace(/[\u{2600}-\u{27FF}]/gu, "")
      .replace(/[\u{FE00}-\u{FEFF}]/gu, "")
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
      .replace(/[\u{2190}-\u{21FF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "")
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
      .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
      .replace(/[^\x00-\x7E\u00C0-\u024F\u2014\u2013\u2026\u00AB\u00BB\u201C\u201D\u2018\u2019]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  // Chiffres romains pour numérotation élégante
  const roman = (n: number): string => {
    const numerals: [number, string][] = [
      [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
    ];
    let r = "";
    for (const [v, s] of numerals) {
      while (n >= v) { r += s; n -= v; }
    }
    return r;
  };

  // Date du jour formatée à la française
  const dateFr = (): string => {
    const mois = ["JANVIER","FEVRIER","MARS","AVRIL","MAI","JUIN","JUILLET","AOUT","SEPTEMBRE","OCTOBRE","NOVEMBRE","DECEMBRE"];
    const d = new Date();
    return `${String(d.getDate()).padStart(2,"0")} ${mois[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Référence unique courte basée sur le timestamp
  const ref = `MMXXVI . ${String(Math.floor(Date.now() / 1000) % 1000).padStart(3, "0")}`;

  // Logo : cercle doré contour + lettrage
  const drawLogo = (cx: number, cy: number, scale: number = 1) => {
    const r = 5 * scale;
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.25 * scale);
    doc.circle(cx, cy, r, "S");
    // Point central doré dégradé simulé par deux cercles
    doc.setFillColor(GOLD_LIGHT[0], GOLD_LIGHT[1], GOLD_LIGHT[2]);
    doc.circle(cx, cy, 1.2 * scale, "F");
  };

  // Ligne dorée dégradée simulée par segments d'opacité croissante
  const drawGoldDivider = (cy: number, width: number = 60) => {
    const cx = W / 2;
    const halfW = width / 2;
    const segments = 20;
    const segW = width / segments;
    doc.setLineWidth(0.2);
    for (let i = 0; i < segments; i++) {
      // Opacité en cloche (transparent → opaque → transparent)
      const t = i / (segments - 1);
      const opacity = Math.sin(t * Math.PI);
      const r = Math.round(GOLD[0] * opacity + BG[0] * (1 - opacity));
      const g = Math.round(GOLD[1] * opacity + BG[1] * (1 - opacity));
      const b = Math.round(GOLD[2] * opacity + BG[2] * (1 - opacity));
      doc.setDrawColor(r, g, b);
      const x1 = cx - halfW + i * segW;
      const x2 = x1 + segW;
      doc.line(x1, cy, x2, cy);
    }
  };

  // Footer minimaliste sur chaque page
  const drawFooter = (pageNum: number, totalPages: number) => {
    const footerY = H - 14;
    // Ligne fine de séparation
    doc.setDrawColor(HAIRLINE[0], HAIRLINE[1], HAIRLINE[2]);
    doc.setLineWidth(0.15);
    doc.line(margin, footerY - 4, W - margin, footerY - 4);

    // Mini-logo à gauche
    drawLogo(margin + 2.5, footerY, 0.5);

    // Nom à gauche
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.setTextColor(IVORY_MUTED[0], IVORY_MUTED[1], IVORY_MUTED[2]);
    doc.text("ImmoFlow AI", margin + 8, footerY + 1);

    // Référence au centre
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(IVORY_MUTED[0], IVORY_MUTED[1], IVORY_MUTED[2]);
    doc.text(ref, W / 2, footerY + 1, { align: "center", charSpace: 1.5 });

    // Numéro de page en chiffres romains à droite
    doc.setFont("times", "italic");
    doc.setFontSize(9);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.text(roman(pageNum), W - margin, footerY + 1, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(IVORY_MUTED[0], IVORY_MUTED[1], IVORY_MUTED[2]);
    doc.text(`Page ${pageNum} de ${totalPages}`, W - margin, footerY + 4.5, { align: "right" });
  };

  // Ouvre une nouvelle page avec le fond noir prêt
  const newPage = () => {
    doc.addPage();
    paintBackground();
  };

  // Écrit du texte avec saut de page automatique
  const writeWithBreak = (
    lines: string[],
    x: number,
    y: number,
    lineHeight: number,
    headerCallback?: () => number
  ): number => {
    for (const line of lines) {
      if (y + lineHeight > H - 26) {
        newPage();
        y = headerCallback ? headerCallback() : margin + 10;
      }
      doc.text(line, x, y);
      y += lineHeight;
    }
    return y;
  };

  // En-tête de section : label mono uppercase doré
  const drawSectionLabel = (label: string, y: number): number => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.text(label.toUpperCase(), margin, y, { charSpace: 2.5 });

    // Ligne fine sous le label
    doc.setDrawColor(GOLD_DIM[0], GOLD_DIM[1], GOLD_DIM[2]);
    doc.setLineWidth(0.1);
    doc.line(margin, y + 3, margin + 30, y + 3);

    return y + 12;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COUVERTURE
  // ═══════════════════════════════════════════════════════════════════════════

  paintBackground();

  // Cadre fin doré à 8mm du bord (touche éditoriale luxe)
  doc.setDrawColor(GOLD_DIM[0], GOLD_DIM[1], GOLD_DIM[2]);
  doc.setLineWidth(0.15);
  doc.rect(8, 8, W - 16, H - 16, "S");

  // — Top : logo + lettrage
  const topY = 32;
  drawLogo(W / 2, topY, 1.4);

  doc.setFont("times", "normal");
  doc.setFontSize(15);
  doc.setTextColor(IVORY[0], IVORY[1], IVORY[2]);
  doc.text("IMMOFLOW", W / 2, topY + 14, { align: "center", charSpace: 4 });

  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("AI", W / 2 + 28, topY + 14, { align: "left", charSpace: 4 });

  // Mini-tagline sous le logo
  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.setTextColor(IVORY_MUTED[0], IVORY_MUTED[1], IVORY_MUTED[2]);
  doc.text("Marketing immobilier de prestige", W / 2, topY + 21, { align: "center", charSpace: 1 });

  // — Label "Annonce" en haut central
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("—  L ' A N N O N C E  —", W / 2, 95, { align: "center", charSpace: 3 });

  // — Titre principal de l'annonce, très grand, italique
  const titreClean = clean(result.annonce_pro.titre);
  doc.setFont("times", "italic");
  doc.setFontSize(32);
  doc.setTextColor(IVORY[0], IVORY[1], IVORY[2]);

  const titreLines = doc.splitTextToSize(titreClean, maxW - 10);
  // Limiter à 4 lignes max sur la couverture, le reste sera repris page 2
  const titreCover = titreLines.slice(0, 4);
  const titreLineH = 13;
  const titreBlockH = titreCover.length * titreLineH;
  const titreStartY = (H / 2) - (titreBlockH / 2) + 4;

  titreCover.forEach((line: string, i: number) => {
    doc.text(line, W / 2, titreStartY + i * titreLineH, { align: "center" });
  });

  // — Divider doré sous le titre
  drawGoldDivider(titreStartY + titreBlockH + 8, 50);

  // — Sous-titre : extrait de la description (1 ou 2 lignes)
  const descClean = clean(result.annonce_pro.description);
  const firstSentence = descClean.split(/[.!?](\s|$)/)[0] + ".";
  const extrait = firstSentence.length > 180
    ? firstSentence.substring(0, 177) + "..."
    : firstSentence;

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(IVORY_DIM[0], IVORY_DIM[1], IVORY_DIM[2]);
  const extraitLines = doc.splitTextToSize(extrait, maxW - 30);
  let extraitY = titreStartY + titreBlockH + 18;
  extraitLines.slice(0, 3).forEach((line: string) => {
    doc.text(line, W / 2, extraitY, { align: "center" });
    extraitY += 6;
  });

  // — Bloc bas : référence + date
  const bottomY = H - 36;

  doc.setDrawColor(GOLD_DIM[0], GOLD_DIM[1], GOLD_DIM[2]);
  doc.setLineWidth(0.15);
  doc.line(W / 2 - 25, bottomY - 8, W / 2 + 25, bottomY - 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(IVORY_MUTED[0], IVORY_MUTED[1], IVORY_MUTED[2]);
  doc.text("REFERENCE", W / 2 - 30, bottomY - 2, { align: "center", charSpace: 2 });
  doc.text("EDITION", W / 2 + 30, bottomY - 2, { align: "center", charSpace: 2 });

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text(ref, W / 2 - 30, bottomY + 4, { align: "center" });

  doc.setTextColor(IVORY[0], IVORY[1], IVORY[2]);
  doc.text(dateFr(), W / 2 + 30, bottomY + 4, { align: "center" });

  // Petit ornement central entre les deux blocs
  doc.setFont("times", "italic");
  doc.setFontSize(14);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text(".", W / 2, bottomY + 3, { align: "center" });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — L'ANNONCE
  // ═══════════════════════════════════════════════════════════════════════════

  newPage();
  let y = 32;

  // Header de page : label de section
  y = drawSectionLabel("I  .  L'Annonce", y);

  // Titre de l'annonce (réaffiché sur la page 2 pour ancrer le contexte)
  doc.setFont("times", "italic");
  doc.setFontSize(20);
  doc.setTextColor(IVORY[0], IVORY[1], IVORY[2]);
  const titreP2Lines = doc.splitTextToSize(titreClean, maxW);
  titreP2Lines.forEach((line: string) => {
    if (y + 9 > H - 26) { newPage(); y = margin + 10; }
    doc.text(line, margin, y);
    y += 9;
  });

  y += 4;

  // Petit divider sous le titre
  doc.setDrawColor(GOLD_DIM[0], GOLD_DIM[1], GOLD_DIM[2]);
  doc.setLineWidth(0.2);
  doc.line(margin, y, margin + 30, y);
  y += 10;

  // — Description avec lettrine
  // La première lettre de la description en très grande capitale dorée
  const firstChar = descClean.charAt(0);
  const restOfDesc = descClean.substring(1);

  // Dessin de la lettrine
  doc.setFont("times", "italic");
  doc.setFontSize(48);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text(firstChar, margin, y + 14);

  // Texte qui s'enroule autour de la lettrine (les 4 premières lignes décalées)
  const lettrineW = 18; // largeur visuelle de la lettrine
  const descWrapMaxW = maxW - lettrineW;

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(IVORY[0], IVORY[1], IVORY[2]);

  const descLinesWrap = doc.splitTextToSize(restOfDesc, descWrapMaxW);
  const lineH = 6;
  const linesAroundLettrine = Math.min(4, descLinesWrap.length);

  // Lignes décalées (autour de la lettrine)
  let yDesc = y + 6;
  for (let i = 0; i < linesAroundLettrine; i++) {
    doc.text(descLinesWrap[i], margin + lettrineW, yDesc);
    yDesc += lineH;
  }

  // Lignes restantes pleine largeur, en repartant à la marge
  if (descLinesWrap.length > linesAroundLettrine) {
    const remaining = doc.splitTextToSize(
      descLinesWrap.slice(linesAroundLettrine).join(" "),
      maxW
    );
    yDesc += 1;
    yDesc = writeWithBreak(remaining, margin, yDesc, lineH, () => {
      let yh = 32;
      yh = drawSectionLabel("I  .  L'Annonce (suite)", yh);
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(IVORY[0], IVORY[1], IVORY[2]);
      return yh;
    });
  }

  y = yDesc + 12;

  // — Points forts
  if (y > H - 80) {
    newPage();
    y = 32;
    y = drawSectionLabel("I  .  L'Annonce (suite)", y);
  }

  // Section label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("POINTS FORTS", margin, y, { charSpace: 2.5 });

  doc.setDrawColor(GOLD_DIM[0], GOLD_DIM[1], GOLD_DIM[2]);
  doc.setLineWidth(0.15);
  doc.line(margin + 30, y - 1, W - margin, y - 1);

  y += 10;

  // Liste des points forts numérotés en romain doré
  result.annonce_pro.points_forts.forEach((pt, i) => {
    const ptClean = clean(pt);
    const ptLines = doc.splitTextToSize(ptClean, maxW - 14);
    const blockH = ptLines.length * lineH + 8;

    if (y + blockH > H - 26) {
      newPage();
      y = 32;
      y = drawSectionLabel("I  .  L'Annonce (suite)", y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.text("POINTS FORTS (SUITE)", margin, y, { charSpace: 2.5 });
      y += 10;
    }

    // Numéro romain doré italique
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.text(roman(i + 1), margin, y);

    // Texte du point fort
    doc.setFont("times", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(IVORY_DIM[0], IVORY_DIM[1], IVORY_DIM[2]);
    ptLines.forEach((line: string, li: number) => {
      doc.text(line, margin + 12, y + li * lineH);
    });

    y += ptLines.length * lineH + 5;

    // Séparateur fin entre points forts (sauf après le dernier)
    if (i < result.annonce_pro.points_forts.length - 1) {
      doc.setDrawColor(HAIRLINE[0], HAIRLINE[1], HAIRLINE[2]);
      doc.setLineWidth(0.1);
      doc.line(margin + 12, y - 1, W - margin - 30, y - 1);
      y += 3;
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — STORYBOARD VIDÉO
  // ═══════════════════════════════════════════════════════════════════════════

  newPage();
  y = 32;
  y = drawSectionLabel("II  .  Storyboard Video", y);

  // Sous-titre éditorial
  doc.setFont("times", "italic");
  doc.setFontSize(18);
  doc.setTextColor(IVORY[0], IVORY[1], IVORY[2]);
  doc.text("Six tableaux", margin, y);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("pour votre videaste", margin + 32, y);

  y += 10;

  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(IVORY_MUTED[0], IVORY_MUTED[1], IVORY_MUTED[2]);
  doc.text("Chaque plan est composé pour s'enchainer naturellement. La voix off accompagne l'image.", margin, y, { maxWidth: maxW });

  y += 14;

  // En-têtes du tableau
  const col1X = margin + 14;     // colonne "Plan camera"
  const col1W = (maxW - 14) * 0.42;
  const col2X = col1X + col1W + 6;
  const col2W = maxW - 14 - col1W - 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("N", margin, y, { charSpace: 2.5 });
  doc.text("PLAN CAMERA", col1X, y, { charSpace: 2.5 });
  doc.text("VOIX OFF", col2X, y, { charSpace: 2.5 });

  y += 3;
  doc.setDrawColor(GOLD_DIM[0], GOLD_DIM[1], GOLD_DIM[2]);
  doc.setLineWidth(0.2);
  doc.line(margin, y, W - margin, y);
  y += 7;

  // Lignes du storyboard
  result.storyboard_video.forEach((scene, i) => {
    const planLines = doc.splitTextToSize(clean(scene.plan), col1W - 2);
    const voixLines = doc.splitTextToSize(clean(scene.voix_off), col2W - 2);
    const rowLineH = 5;
    const rowH = Math.max(planLines.length, voixLines.length) * rowLineH + 8;

    if (y + rowH > H - 26) {
      newPage();
      y = 32;
      y = drawSectionLabel("II  .  Storyboard (suite)", y);

      // Réafficher les en-têtes
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.text("N", margin, y, { charSpace: 2.5 });
      doc.text("PLAN CAMERA", col1X, y, { charSpace: 2.5 });
      doc.text("VOIX OFF", col2X, y, { charSpace: 2.5 });
      y += 3;
      doc.setDrawColor(GOLD_DIM[0], GOLD_DIM[1], GOLD_DIM[2]);
      doc.setLineWidth(0.2);
      doc.line(margin, y, W - margin, y);
      y += 7;
    }

    // Numéro romain en grand italique doré
    doc.setFont("times", "italic");
    doc.setFontSize(14);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.text(roman(i + 1), margin, y + 2);

    // Plan caméra (texte clair)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(IVORY[0], IVORY[1], IVORY[2]);
    planLines.forEach((line: string, li: number) => {
      doc.text(line, col1X, y + li * rowLineH);
    });

    // Voix off (italique ivoire foncé)
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(IVORY_DIM[0], IVORY_DIM[1], IVORY_DIM[2]);
    voixLines.forEach((line: string, li: number) => {
      doc.text(line, col2X, y + li * rowLineH);
    });

    y += Math.max(planLines.length, voixLines.length) * rowLineH + 4;

    // Séparateur fin entre scènes
    if (i < result.storyboard_video.length - 1) {
      doc.setDrawColor(HAIRLINE[0], HAIRLINE[1], HAIRLINE[2]);
      doc.setLineWidth(0.1);
      doc.line(margin + 14, y, W - margin, y);
      y += 5;
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 4 — POST RÉSEAUX & CONTACT
  // ═══════════════════════════════════════════════════════════════════════════

  newPage();
  y = 32;
  y = drawSectionLabel("III  .  Reseaux Sociaux", y);

  doc.setFont("times", "italic");
  doc.setFontSize(18);
  doc.setTextColor(IVORY[0], IVORY[1], IVORY[2]);
  doc.text("Pret a", margin, y);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("publier", margin + 18, y);

  y += 10;

  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(IVORY_MUTED[0], IVORY_MUTED[1], IVORY_MUTED[2]);
  doc.text("Copiez-collez ce texte sur Instagram, Facebook ou LinkedIn.", margin, y);

  y += 12;

  // — Encadré du post
  const postClean = clean(result.post_reseaux);
  const postPadding = 8;
  const postContentW = maxW - postPadding * 2;
  const postLines = doc.splitTextToSize(postClean, postContentW);
  const postLineH = 5.5;
  const postBoxH = postLines.length * postLineH + postPadding * 2 + 10;

  // Si pas assez de place, nouvelle page
  if (y + postBoxH + 70 > H - 26) {
    newPage();
    y = 32;
    y = drawSectionLabel("III  .  Reseaux Sociaux", y);
  }

  // Cadre doré fin autour du post
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, maxW, postBoxH, "S");

  // Cadre intérieur très fin (touche luxe)
  doc.setDrawColor(GOLD_DIM[0], GOLD_DIM[1], GOLD_DIM[2]);
  doc.setLineWidth(0.1);
  doc.rect(margin + 2, y + 2, maxW - 4, postBoxH - 4, "S");

  // Ornement en haut au centre du cadre
  doc.setFillColor(BG[0], BG[1], BG[2]);
  doc.rect(W / 2 - 8, y - 2, 16, 4, "F");
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text(".", W / 2, y + 1, { align: "center" });

  // Texte du post
  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(IVORY[0], IVORY[1], IVORY[2]);

  let postY = y + postPadding + 6;
  postLines.forEach((line: string) => {
    // Si une ligne sort de la box, on l'ignore (cas extrême — splitTextToSize gère normalement)
    if (postY < y + postBoxH - postPadding) {
      doc.text(line, margin + postPadding, postY);
      postY += postLineH;
    }
  });

  y += postBoxH + 18;

  // ─── BLOC CONTACT DE L'AGENT ──────────────────────────────────────────────

  if (y + 60 > H - 26) {
    newPage();
    y = 32;
  }

  // Section label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("CONTACT DE L'AGENT", margin, y, { charSpace: 2.5 });

  doc.setDrawColor(GOLD_DIM[0], GOLD_DIM[1], GOLD_DIM[2]);
  doc.setLineWidth(0.15);
  doc.line(margin + 48, y - 1, W - margin, y - 1);

  y += 8;

  // Sous-titre italique
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(IVORY_MUTED[0], IVORY_MUTED[1], IVORY_MUTED[2]);
  doc.text("A compléter avant transmission au client.", margin, y);

  y += 12;

  // Champs vides à remplir manuellement
  const fields: [string, string][] = [
    ["NOM DE L'AGENT", ""],
    ["AGENCE", ""],
    ["TELEPHONE", ""],
    ["COURRIEL", ""],
  ];

  const fieldsPerRow = 2;
  const fieldW = (maxW - 12) / fieldsPerRow;
  const fieldH = 18;

  fields.forEach((field, idx) => {
    const col = idx % fieldsPerRow;
    const row = Math.floor(idx / fieldsPerRow);
    const fx = margin + col * (fieldW + 12);
    const fy = y + row * (fieldH + 6);

    // Label du champ
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(IVORY_MUTED[0], IVORY_MUTED[1], IVORY_MUTED[2]);
    doc.text(field[0], fx, fy, { charSpace: 2 });

    // Ligne de saisie dorée fine
    doc.setDrawColor(GOLD_DIM[0], GOLD_DIM[1], GOLD_DIM[2]);
    doc.setLineWidth(0.25);
    doc.line(fx, fy + 8, fx + fieldW, fy + 8);

    // Petit point décoratif à gauche de la ligne
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.circle(fx - 1.5, fy + 8, 0.6, "F");
  });

  y += Math.ceil(fields.length / fieldsPerRow) * (fieldH + 6) + 4;

  // Mention finale
  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.setTextColor(IVORY_MUTED[0], IVORY_MUTED[1], IVORY_MUTED[2]);
  doc.text(
    "Document genere par ImmoFlow AI . Marketing immobilier de prestige.",
    W / 2, y + 8,
    { align: "center" }
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOTER SUR TOUTES LES PAGES (sauf la couverture qui a son propre layout)
  // ═══════════════════════════════════════════════════════════════════════════

  const totalPages = (doc as jsPDF & { internal: { getNumberOfPages: () => number } })
    .internal.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    if (p === 1) {
      // La couverture a déjà son bloc "Édition / Référence" — pas de footer redondant
      continue;
    }
    drawFooter(p, totalPages);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAUVEGARDE
  // ═══════════════════════════════════════════════════════════════════════════

  const filename = `immoflow-${clean(result.annonce_pro.titre)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .substring(0, 40)
    .replace(/^-|-$/g, "")}.pdf`;

  doc.save(filename || "immoflow-annonce.pdf");
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
        .mono{font-family:'Inter',sans-serif;font-weight:400;letter-spacing:0.36em;text-transform:uppercase;font-size:10px}

        .gold-text{background:linear-gradient(135deg,#f4d896 0%,#c9a84c 30%,#8b6914 50%,#c9a84c 70%,#f4d896 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 7s linear infinite}

        .nav-link{color:rgba(232,228,220,0.5);font-size:11px;letter-spacing:0.28em;text-transform:uppercase;text-decoration:none;font-weight:400;transition:color 0.4s cubic-bezier(0.16,1,0.3,1)}
        .nav-link:hover{color:#e8c87c}

        .btn-primary{background:transparent;border:1px solid rgba(201,168,76,0.4);color:#e8c87c;padding:14px 28px;font-family:'Inter',sans-serif;font-size:11px;font-weight:400;letter-spacing:0.32em;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:10px;position:relative;overflow:hidden;transition:all 0.6s cubic-bezier(0.16,1,0.3,1)}
        .btn-primary::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05));opacity:0;transition:opacity 0.6s cubic-bezier(0.16,1,0.3,1)}
        .btn-primary:hover:not(:disabled){border-color:rgba(232,200,124,0.7);color:#f4d896;transform:translateY(-1px);box-shadow:0 0 24px rgba(201,168,76,0.2)}
        .btn-primary:hover:not(:disabled)::before{opacity:1}
        .btn-primary > *{position:relative;z-index:1}
        .btn-primary:disabled{cursor:not-allowed;opacity:0.4}

        .btn-ghost{background:transparent;border:1px solid rgba(255,255,255,0.08);color:rgba(232,228,220,0.7);padding:12px 24px;font-family:'Inter',sans-serif;font-size:10px;font-weight:400;letter-spacing:0.32em;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:10px;transition:all 0.6s cubic-bezier(0.16,1,0.3,1)}
        .btn-ghost:hover{border-color:rgba(201,168,76,0.22);color:#e8e4dc;transform:translateY(-1px)}

        .textarea-wrap{position:relative}
        .textarea-wrap .floating-label{color:rgba(232,228,220,0.4);transition:color 0.5s cubic-bezier(0.16,1,0.3,1)}
        .textarea-wrap:focus-within .floating-label{color:#c9a84c}
        textarea{background:rgba(255,255,255,0.025);border:1px solid rgba(201,168,76,0.12);border-radius:4px;padding:24px;font-size:15px;color:#e8e4dc;font-family:'Inter',sans-serif;font-weight:300;outline:none;transition:all 0.6s cubic-bezier(0.16,1,0.3,1);width:100%;line-height:1.75;resize:vertical;letter-spacing:0.01em}
        textarea:focus{border-color:rgba(201,168,76,0.45);background:rgba(201,168,76,0.025);box-shadow:0 0 0 4px rgba(201,168,76,0.06)}
        textarea::placeholder{color:rgba(232,228,220,0.25);font-style:italic;font-family:'Cormorant Garamond',serif;font-size:17px}

        .submit-luxe{background:linear-gradient(135deg,#f4d896 0%,#e8c87c 30%,#c9a84c 60%,#a88838 100%);background-size:180% 180%;border:none;color:#080808;padding:20px;font-family:'Inter',sans-serif;font-size:11px;font-weight:500;letter-spacing:0.36em;text-transform:uppercase;cursor:pointer;transition:all 0.6s cubic-bezier(0.16,1,0.3,1);width:100%;display:flex;align-items:center;justify-content:center;gap:10px;border-radius:4px;position:relative;overflow:hidden;box-shadow:0 14px 40px -18px rgba(232,200,124,0.4),inset 0 1px 0 rgba(255,255,255,0.28)}
        .submit-luxe:hover:not(:disabled){transform:translateY(-1px);background-position:100% 0;box-shadow:0 28px 72px -22px rgba(232,200,124,0.6),inset 0 1px 0 rgba(255,255,255,0.4)}
        .submit-luxe:disabled{cursor:not-allowed;background:rgba(255,255,255,0.04);color:rgba(232,228,220,0.3)}

        .divider-fine{height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)}

        .tab-button{flex:1;display:flex;align-items:center;justify-content:center;gap:10px;padding:18px 12px;background:transparent;border:none;color:rgba(232,228,220,0.35);font-size:10px;letter-spacing:0.32em;text-transform:uppercase;cursor:pointer;font-family:'Inter',sans-serif;font-weight:400;transition:all 0.6s cubic-bezier(0.16,1,0.3,1);position:relative}
        .tab-button:hover{color:rgba(232,228,220,0.6)}
        .tab-button.active{color:#e8c87c}
        .tab-button.active::after{content:"";position:absolute;bottom:-1px;left:18%;right:18%;height:2px;background:linear-gradient(90deg,transparent,#e8c87c,#c9a84c,#e8c87c,transparent);box-shadow:0 0 12px rgba(232,200,124,0.4)}

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

              <div className="textarea-wrap" style={{position:"relative"}}>
                <div style={{position:"absolute",top:"-12px",left:"24px",background:"#080808",padding:"0 12px",zIndex:2}}>
                  <span className="mono floating-label">Notes de visite</span>
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
