"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { useUser, useClerk } from "@clerk/nextjs";

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

interface RapportData {
  accroche_portails: string;
  pitch_agent: string;
}

interface ImmoFlowResult {
  annonce_pro: AnnonceProData;
  storyboard_video: StoryboardScene[];
  post_reseaux: string;
  post_instagram?: string;
  post_linkedin?: string;
  post_facebook?: string;
  variante_b?: AnnonceProData;
  rapport?: RapportData;
}

type Status = "idle" | "loading" | "success" | "error";
type TabId = "annonce" | "storyboard" | "reseaux" | "instagram" | "linkedin" | "facebook" | "variante" | "rapport" | "historique";

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
  const W = 210, H = 297, M = 18, CW = W - M * 2;

  const BLACK: [number, number, number] = [8, 8, 8];
  const TEXT: [number, number, number] = [26, 26, 26];
  const TEXT_BODY: [number, number, number] = [51, 51, 51];
  const GOLD: [number, number, number] = [201, 168, 76];
  const GREY: [number, number, number] = [107, 107, 107];
  const FOOTER_GREY: [number, number, number] = [155, 155, 155];
  const SOFT: [number, number, number] = [249, 248, 246];

  const ptToMm = (pt: number) => pt * 0.3528;
  const LW_HEADER_RULE = ptToMm(0.3);
  const LW_HAIRLINE = ptToMm(0.2);
  const W_SOCIAL_BAR = ptToMm(2);
  const BULLET_SIZE = ptToMm(4);

  const setFill = (c: [number, number, number]) => doc.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c: [number, number, number]) => doc.setDrawColor(c[0], c[1], c[2]);
  const setText = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);

  const clean = (text: string): string => {
    if (!text) return "";
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
      .replace(/[^\x00-\x7EÀ-ɏ—–…«»“”‘’]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  const HEADER_BAND = 22;

  const drawHeader = () => {
    setFill(BLACK);
    doc.rect(0, 0, W, HEADER_BAND, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    setText(GOLD);
    doc.text("IMMOFLOW AI", W / 2, HEADER_BAND / 2 + 1.6, { align: "center", charSpace: 2 });
    setDraw(GOLD);
    doc.setLineWidth(LW_HEADER_RULE);
    doc.line(0, HEADER_BAND + 0.6, W, HEADER_BAND + 0.6);
  };

  const drawFooter = (page: number, total: number) => {
    const fy = H - 10;
    setDraw(GOLD);
    doc.setLineWidth(LW_HAIRLINE);
    doc.line(M, H - 14, W - M, H - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    setText(FOOTER_GREY);
    doc.text("Genere par ImmoFlow AI", M, fy);
    doc.text(`Page ${page} / ${total}`, W - M, fy, { align: "right" });
  };

  const TOP_Y = 28, BOTTOM_Y = H - 18;
  let y = TOP_Y;

  const newPage = () => { doc.addPage(); drawHeader(); y = TOP_Y; };
  const ensure = (needed: number) => { if (y + needed > BOTTOM_Y) newPage(); };

  const drawJustifiedLine = (line: string, x: number, ly: number, width: number) => {
    const words = line.split(" ").filter(w => w.length > 0);
    if (words.length <= 1) { doc.text(line, x, ly); return; }
    const wordsW = words.reduce((s, w) => s + doc.getTextWidth(w), 0);
    const gap = (width - wordsW) / (words.length - 1);
    if (gap < 0 || gap > 6) { doc.text(line, x, ly); return; }
    let cx = x;
    for (let i = 0; i < words.length; i++) {
      doc.text(words[i], cx, ly);
      cx += doc.getTextWidth(words[i]) + gap;
    }
  };

  const startSection = (label: string, isFirst = false) => {
    if (!isFirst) {
      y += 8;
      if (y + 16 > BOTTOM_Y) newPage();
      setDraw(GOLD);
      doc.setLineWidth(LW_HAIRLINE);
      doc.line(0, y, W, y);
    }
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    setText(GOLD);
    doc.text(label.toUpperCase(), M, y, { charSpace: 1.4 });
    y += 4;
  };

  drawHeader();
  y = TOP_Y;

  // ── ANNONCE ──
  startSection("Annonce professionnelle", true);
  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  setText(TEXT);
  const titreLines = doc.splitTextToSize(clean(result.annonce_pro.titre), CW);
  const titreLH = 7.5;
  for (const line of titreLines) { ensure(titreLH); doc.text(line, M, y); y += titreLH; }
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setText(TEXT_BODY);
  const descParas = clean(result.annonce_pro.description).split(/\n\s*\n/);
  const bodyLH = 5.5;
  for (let p = 0; p < descParas.length; p++) {
    const lines = doc.splitTextToSize(descParas[p], CW);
    for (let i = 0; i < lines.length; i++) {
      ensure(bodyLH);
      const isLast = i === lines.length - 1;
      if (isLast) doc.text(lines[i], M, y);
      else drawJustifiedLine(lines[i], M, y, CW);
      y += bodyLH;
    }
    if (p < descParas.length - 1) y += 2.5;
  }

  // ── POINTS FORTS ──
  startSection("Points forts");
  y += 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setText(TEXT);
  const bulletLH = 5.8, bulletIndent = 5;
  for (const pf of (result.annonce_pro.points_forts || [])) {
    const pfText = clean(pf);
    if (!pfText) continue;
    const pfLines = doc.splitTextToSize(pfText, CW - bulletIndent);
    ensure(pfLines.length * bulletLH);
    setFill(GOLD);
    doc.rect(M, y - 2.6, BULLET_SIZE, BULLET_SIZE, "F");
    setText(TEXT);
    for (let i = 0; i < pfLines.length; i++) {
      if (i > 0) ensure(bulletLH);
      doc.text(pfLines[i], M + bulletIndent, y);
      y += bulletLH;
    }
    y += 1;
  }

  // ── STORYBOARD ──
  startSection("Storyboard video");
  y += 3;
  const colW = CW / 2, dividerX = M + colW;
  const cellPadX = 4, cellPadY = 4, cellLH = 4.8;
  for (let s = 0; s < (result.storyboard_video || []).length; s++) {
    const scene = result.storyboard_video[s];
    const planTxt = clean(scene.plan);
    const voixTxt = clean(scene.voix_off);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const leftLines = doc.splitTextToSize(planTxt, colW - cellPadX * 2);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    const rightLines = doc.splitTextToSize(voixTxt, colW - cellPadX * 2);
    const rowLines = Math.max(leftLines.length, rightLines.length);
    const rowH = rowLines * cellLH + cellPadY * 2;
    if (y + rowH > BOTTOM_Y && rowH < BOTTOM_Y - TOP_Y) {
      newPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      setText(GOLD);
      doc.text("STORYBOARD VIDEO (suite)", M, y + 4, { charSpace: 1.4 });
      y += 10;
    }
    if (s % 2 === 0) { setFill(SOFT); doc.rect(M, y, CW, rowH, "F"); }
    setDraw(GOLD);
    doc.setLineWidth(LW_HAIRLINE);
    doc.line(dividerX, y, dividerX, y + rowH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setText(GOLD);
    for (let i = 0; i < leftLines.length; i++) {
      doc.text(leftLines[i], M + cellPadX, y + cellPadY + 3 + i * cellLH);
    }
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    setText(GREY);
    for (let i = 0; i < rightLines.length; i++) {
      doc.text(rightLines[i], dividerX + cellPadX, y + cellPadY + 3 + i * cellLH);
    }
    y += rowH;
  }

  // ── POST RÉSEAUX ──
  startSection("Post reseaux sociaux");
  y += 3;
  const socialPadX = 8, socialPadY = 8, socialLH = 5.5;
  const socialInnerX = M + socialPadX;
  const socialInnerW = CW - socialPadX * 2 - W_SOCIAL_BAR;
  const socialLines = doc.splitTextToSize(clean(result.post_reseaux || ""), socialInnerW);
  let remaining = [...socialLines];
  while (remaining.length > 0) {
    const avail = BOTTOM_Y - y;
    const linesFit = Math.max(1, Math.floor((avail - socialPadY * 2) / socialLH));
    if (avail < socialPadY * 2 + socialLH) { newPage(); continue; }
    const chunk = remaining.slice(0, linesFit);
    remaining = remaining.slice(linesFit);
    const blockH = chunk.length * socialLH + socialPadY * 2;
    setFill(SOFT); doc.rect(M, y, CW, blockH, "F");
    setFill(GOLD); doc.rect(M, y, W_SOCIAL_BAR, blockH, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setText(TEXT);
    for (let i = 0; i < chunk.length; i++) {
      doc.text(chunk[i], socialInnerX, y + socialPadY + 3.5 + i * socialLH);
    }
    y += blockH;
    if (remaining.length > 0) newPage();
  }

  const totalPages = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) { doc.setPage(p); drawFooter(p, totalPages); }

  const filename = `immoflow-${clean(result.annonce_pro.titre)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .substring(0, 40)
    .replace(/^-|-$/g, "")}.pdf`;
  doc.save(filename || "immoflow-annonce.pdf");
}

// ─── Export PDF Prestige & Agence ────────────────────────────────────────────

function generatePDF(
  result: ImmoFlowResult,
  plan: "prestige" | "agence",
  agencyName?: string,
  agencyLogoBase64?: string
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, H = 297, M = 20, CW = W - M * 2;

  const BG_PAGE:   [number,number,number] = [253, 252, 250];
  const BG_HEADER: [number,number,number] = [8, 8, 8];
  const GOLD:      [number,number,number] = [201, 168, 76];
  const TEXT:      [number,number,number] = [28, 28, 28];
  const TEXT_DIM:  [number,number,number] = [90, 90, 90];
  const SUBTLE:    [number,number,number] = [136, 136, 136];
  const SOFT:      [number,number,number] = [245, 242, 237];
  const SOCIAL_FG: [number,number,number] = [232, 228, 220];

  const ptToMm = (pt: number) => pt * 0.3528;
  const LW_GOLD_BAND = ptToMm(0.5);
  const LW_HAIR      = ptToMm(0.15);
  const LW_RULE_03   = ptToMm(0.3);
  const LW_RULE_01   = ptToMm(0.1);
  const W_BORDER_3PT = ptToMm(3);
  const DBL_RULE_GAP = 0.6;

  const setFill = (c: [number,number,number]) => doc.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c: [number,number,number]) => doc.setDrawColor(c[0], c[1], c[2]);
  const setText = (c: [number,number,number]) => doc.setTextColor(c[0], c[1], c[2]);

  const clean = (text: string): string => {
    if (!text) return "";
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
      .replace(/[^\x00-\x7EÀ-ɏ—–…«»“”‘’]/g, "")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  };
  const cleanMulti = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
      .replace(/[\u{2600}-\u{27FF}]/gu, "")
      .replace(/[\u{FE00}-\u{FEFF}]/gu, "")
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
      .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
      .replace(/[^\n\x00-\x7EÀ-ɏ—–…«»“”‘’]/g, "")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  };

  const paintPage = () => { setFill(BG_PAGE); doc.rect(0, 0, W, H, "F"); };

  const HEADER_BAND = 30;
  const TOP_Y = HEADER_BAND + 6;

  const drawHeader = () => {
    setFill(BG_HEADER); doc.rect(0, 0, W, HEADER_BAND, "F");
    setDraw(GOLD); doc.setLineWidth(LW_GOLD_BAND);
    doc.line(0, 0.4, W, 0.4);
    doc.line(0, HEADER_BAND - 0.4, W, HEADER_BAND - 0.4);

    doc.setFont("helvetica", "bold"); doc.setFontSize(15); setText(GOLD);
    doc.text("IMMOFLOW AI", M, 12, { charSpace: 2.4 });

    doc.setFont("helvetica", "normal"); doc.setFontSize(6); setText(SUBTLE);
    doc.text("MARKETING DE PRESTIGE  ·  DOCUMENT CONFIDENTIEL", M, 19, { charSpace: 1.4 });

    if (plan === "agence") {
      const lw = 40, lh = 16;
      const lx = W - M - lw;
      const ly = (HEADER_BAND - lh) / 2;
      setDraw(GOLD); doc.setLineWidth(0.1);
      doc.rect(lx, ly, lw, lh, "S");
      let rendered = false;
      if (agencyLogoBase64) {
        try {
          const fmt = agencyLogoBase64.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
          doc.addImage(agencyLogoBase64, fmt, lx + 1, ly + 1, lw - 2, lh - 2, undefined, "FAST");
          rendered = true;
        } catch { rendered = false; }
      }
      if (!rendered) {
        doc.setFont("helvetica", "italic"); doc.setFontSize(8); setText(SUBTLE);
        doc.text("VOTRE AGENCE", lx + lw / 2, ly + lh / 2 + 1, { align: "center" });
      }
    }
  };

  const drawDoubleRule = (cy: number) => {
    setDraw(GOLD); doc.setLineWidth(LW_HAIR);
    doc.line(M, cy, W - M, cy);
    doc.line(M, cy + DBL_RULE_GAP, W - M, cy + DBL_RULE_GAP);
  };

  const drawFooter = (page: number, total: number) => {
    const ruleY = H - 14;
    const fy = H - 9;
    setDraw(GOLD); doc.setLineWidth(LW_HAIR);
    doc.line(M, ruleY, W - M, ruleY);
    doc.line(M, ruleY + DBL_RULE_GAP, W - M, ruleY + DBL_RULE_GAP);

    doc.setFont("helvetica", "normal"); doc.setFontSize(7); setText(SUBTLE);
    doc.text("Genere par ImmoFlow AI  ·  Marketing de Prestige", M, fy);

    setFill(GOLD); doc.circle(W / 2, fy - 1.2, 1.2, "F");

    if (plan === "agence" && agencyName) {
      doc.setFont("helvetica", "italic"); doc.setFontSize(7); setText(SUBTLE);
      doc.text(agencyName, W / 2 + 5, fy);
    }

    doc.setFont("helvetica", "normal"); doc.setFontSize(7); setText(SUBTLE);
    doc.text(`Page ${page} / ${total}`, W - M, fy, { align: "right" });
  };

  const BOTTOM_Y = H - 20;
  let y = TOP_Y;

  const newPage = () => { doc.addPage(); paintPage(); drawHeader(); y = TOP_Y; };
  const ensure = (n: number) => { if (y + n > BOTTOM_Y) newPage(); };

  const drawJustifiedLine = (line: string, x: number, ly: number, width: number) => {
    const words = line.split(" ").filter(w => w.length > 0);
    if (words.length <= 1) { doc.text(line, x, ly); return; }
    const wordsW = words.reduce((s, w) => s + doc.getTextWidth(w), 0);
    const gap = (width - wordsW) / (words.length - 1);
    if (gap < 0 || gap > 6) { doc.text(line, x, ly); return; }
    let cx = x;
    for (const word of words) { doc.text(word, cx, ly); cx += doc.getTextWidth(word) + gap; }
  };

  const drawSectionLabel = (label: string) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); setText(GOLD);
    doc.text(label.toUpperCase(), M, y, { charSpace: 1.9 });
    y += 6;
  };

  paintPage(); drawHeader(); y = TOP_Y;

  // ── ANNONCE ──
  drawSectionLabel("Annonce professionnelle");
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); setText(TEXT);
  const titreLines = doc.splitTextToSize(clean(result.annonce_pro.titre), CW);
  const titreLH = 8.6;
  for (const line of titreLines) { ensure(titreLH); doc.text(line, M, y); y += titreLH; }
  y += 3;

  const descFull = clean(result.annonce_pro.description);
  let accroche = "", bodyText = descFull;
  const m1 = descFull.match(/^([^.!?]{20,}[.!?])\s+([\s\S]+)$/);
  if (m1) { accroche = m1[1]; bodyText = m1[2]; }
  if (accroche) {
    doc.setFont("helvetica", "italic"); doc.setFontSize(12); setText(GOLD);
    const acc = doc.splitTextToSize(accroche, CW);
    const accLH = 6;
    for (const l of acc) { ensure(accLH); doc.text(l, M, y); y += accLH; }
    y += 4;
  } else { y += 1; }

  ensure(8); drawDoubleRule(y); y += 8;

  doc.setFont("helvetica", "normal"); doc.setFontSize(10); setText(TEXT);
  const descParas = bodyText.split(/\n\s*\n/);
  const bodyLH = 5.8;
  for (let p = 0; p < descParas.length; p++) {
    const ls = doc.splitTextToSize(descParas[p], CW);
    for (let i = 0; i < ls.length; i++) {
      ensure(bodyLH);
      if (i === ls.length - 1) doc.text(ls[i], M, y);
      else drawJustifiedLine(ls[i], M, y, CW);
      y += bodyLH;
    }
    if (p < descParas.length - 1) y += 2.5;
  }

  // ── POINTS FORTS ──
  y += 8; ensure(22); drawDoubleRule(y); y += 10;
  drawSectionLabel("Points forts");

  const cardPadX = 8, cardPadY = 8;
  const cardInnerW = CW - cardPadX * 2 - W_BORDER_3PT;
  const cardInnerX = M + W_BORDER_3PT + cardPadX;
  const bulletGap = 5, bulletLH = 5.8;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  const pfBlocks: string[][] = [];
  for (const pf of (result.annonce_pro.points_forts || [])) {
    const txt = clean(pf); if (!txt) continue;
    pfBlocks.push(doc.splitTextToSize(txt, cardInnerW - bulletGap));
  }

  let pfIdx = 0;
  while (pfIdx < pfBlocks.length) {
    const avail = BOTTOM_Y - y;
    const innerAvail = avail - cardPadY * 2;
    let used = 0, inCard = 0;
    while (pfIdx + inCard < pfBlocks.length) {
      const b = pfBlocks[pfIdx + inCard];
      const bH = b.length * bulletLH + 2;
      if (used + bH > innerAvail && inCard > 0) break;
      used += bH; inCard++;
    }
    if (inCard === 0) { newPage(); continue; }
    const cardH = used + cardPadY * 2;
    setFill(SOFT); doc.rect(M, y, CW, cardH, "F");
    setFill(GOLD); doc.rect(M, y, W_BORDER_3PT, cardH, "F");
    let cy = y + cardPadY + 3.5;
    for (let i = 0; i < inCard; i++) {
      const block = pfBlocks[pfIdx + i];
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); setText(GOLD);
      doc.text("›", M + W_BORDER_3PT + cardPadX, cy);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); setText(TEXT);
      for (let k = 0; k < block.length; k++) {
        doc.text(block[k], cardInnerX + bulletGap, cy);
        cy += bulletLH;
      }
      cy += 2;
    }
    y += cardH; pfIdx += inCard;
    if (pfIdx < pfBlocks.length) newPage();
  }

  // ── STORYBOARD ──
  y += 8; ensure(22); drawDoubleRule(y); y += 10;
  drawSectionLabel("Storyboard video");

  const col1W = CW * 0.55, col2W = CW * 0.45;
  const tHeaderH = 9, cellPadX = 3.5, cellPadY = 3.5, cellLH = 4.8;
  const drawTableHeader = () => {
    ensure(tHeaderH + 12);
    setFill(BG_HEADER); doc.rect(M, y, CW, tHeaderH, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); setText(GOLD);
    doc.text("CE QU'IL FAUT FILMER", M + cellPadX, y + tHeaderH / 2 + 1.6, { charSpace: 1.6 });
    doc.text("VOIX OFF", M + col1W + cellPadX, y + tHeaderH / 2 + 1.6, { charSpace: 1.6 });
    setDraw(GOLD); doc.setLineWidth(LW_RULE_03);
    doc.line(M, y + tHeaderH, M + CW, y + tHeaderH);
    y += tHeaderH;
  };
  drawTableHeader();

  for (let s = 0; s < (result.storyboard_video || []).length; s++) {
    const scene = result.storyboard_video[s];
    const planTxt = clean(scene.plan), voixTxt = clean(scene.voix_off);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    const leftLines = doc.splitTextToSize(planTxt, col1W - cellPadX * 2);
    doc.setFont("helvetica", "italic"); doc.setFontSize(9);
    const rightLines = doc.splitTextToSize(voixTxt, col2W - cellPadX * 2);
    const rowLines = Math.max(leftLines.length, rightLines.length);
    const rowH = Math.max(rowLines * cellLH + cellPadY * 2, 12);
    if (y + rowH > BOTTOM_Y) { newPage(); drawTableHeader(); }
    if (s % 2 === 0) setFill(SOFT); else setFill(BG_PAGE);
    doc.rect(M, y, CW, rowH, "F");
    setDraw(GOLD); doc.setLineWidth(LW_RULE_01);
    doc.line(M, y, M + CW, y);
    doc.line(M, y + rowH, M + CW, y + rowH);
    doc.line(M, y, M, y + rowH);
    doc.line(M + CW, y, M + CW, y + rowH);
    doc.line(M + col1W, y, M + col1W, y + rowH);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); setText(TEXT);
    for (let i = 0; i < leftLines.length; i++) {
      doc.text(leftLines[i], M + cellPadX, y + cellPadY + 3 + i * cellLH);
    }
    doc.setFont("helvetica", "italic"); doc.setFontSize(9); setText(TEXT_DIM);
    for (let i = 0; i < rightLines.length; i++) {
      doc.text(rightLines[i], M + col1W + cellPadX, y + cellPadY + 3 + i * cellLH);
    }
    y += rowH;
  }

  // ── POST RÉSEAUX ──
  y += 8; ensure(22); drawDoubleRule(y); y += 10;
  drawSectionLabel("Post reseaux sociaux");

  const socialRaw = cleanMulti(result.post_reseaux || "");
  const padX = 10, padY = 10;
  const innerW = CW - padX * 2;
  const socialLH = 6, socialSize = 10, hashSize = 9;
  type Token = { text: string; hash: boolean; w: number };
  const layoutLines: Token[][] = [];
  const paragraphs = socialRaw.split(/\n/);
  for (let pi = 0; pi < paragraphs.length; pi++) {
    const para = paragraphs[pi].trim();
    if (!para) { layoutLines.push([]); continue; }
    const words = para.split(/\s+/).filter(w => w.length > 0);
    let current: Token[] = [], currentW = 0;
    for (const word of words) {
      const hash = word.startsWith("#");
      if (hash) { doc.setFont("helvetica","bold"); doc.setFontSize(hashSize); }
      else { doc.setFont("helvetica","normal"); doc.setFontSize(socialSize); }
      const wW = doc.getTextWidth(word);
      doc.setFont("helvetica","normal"); doc.setFontSize(socialSize);
      const sW = doc.getTextWidth(" ");
      const lead = current.length > 0 ? sW : 0;
      if (currentW + lead + wW > innerW && current.length > 0) {
        layoutLines.push(current); current = []; currentW = 0;
      }
      if (current.length > 0) { current.push({ text: " ", hash: false, w: sW }); currentW += sW; }
      current.push({ text: word, hash, w: wW }); currentW += wW;
    }
    if (current.length > 0) layoutLines.push(current);
  }

  let lineIdx = 0;
  while (lineIdx < layoutLines.length) {
    const avail = BOTTOM_Y - y;
    const innerAvail = avail - padY * 2;
    if (innerAvail < socialLH) { newPage(); continue; }
    const linesFit = Math.max(1, Math.floor(innerAvail / socialLH));
    const take = Math.min(linesFit, layoutLines.length - lineIdx);
    const blockH = take * socialLH + padY * 2;
    setFill(BG_HEADER); doc.roundedRect(M, y, CW, blockH, 2, 2, "F");
    setDraw(GOLD); doc.setLineWidth(LW_RULE_03);
    doc.line(M + 2, y, M + CW - 2, y);
    doc.line(M + 2, y + blockH, M + CW - 2, y + blockH);
    let ly = y + padY + 4;
    for (let i = 0; i < take; i++) {
      const tokens = layoutLines[lineIdx + i];
      let cx = M + padX;
      for (const tok of tokens) {
        if (tok.text === " ") { cx += tok.w; continue; }
        if (tok.hash) { doc.setFont("helvetica","bold"); doc.setFontSize(hashSize); setText(GOLD); }
        else { doc.setFont("helvetica","normal"); doc.setFontSize(socialSize); setText(SOCIAL_FG); }
        doc.text(tok.text, cx, ly);
        cx += tok.w;
      }
      ly += socialLH;
    }
    y += blockH; lineIdx += take;
    if (lineIdx < layoutLines.length) newPage();
  }

  const totalPages = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) { doc.setPage(p); drawFooter(p, totalPages); }

  const slug = clean(result.annonce_pro.titre).toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 40).replace(/^-|-$/g, "");
  doc.save(`immoflow-${plan}-${slug || "annonce"}.pdf`);
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

function IconInstagram() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function IconLinkedin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function IconRapport() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
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

function PostPlatformPanel({ text, platform }: { text: string; platform: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  const colors: Record<string, string> = {
    Instagram: "#e1306c",
    LinkedIn: "#0077b5",
    Facebook: "#1877f2",
  };
  const color = colors[platform] ?? "#c9a84c";
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}>
        <div style={{width:"8px",height:"8px",borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}80`}} />
        <span className="mono" style={{color:"rgba(232,228,220,0.45)",fontSize:"9px"}}>{platform.toUpperCase()}</span>
      </div>
      <div style={{position:"relative",background:"linear-gradient(180deg,rgba(255,255,255,0.02) 0%,rgba(0,0,0,0.2) 100%)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"16px",padding:"32px",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"60%",height:"1px",background:`linear-gradient(90deg,transparent,${color}50,transparent)`}} />
        <pre style={{whiteSpace:"pre-wrap",fontFamily:"'Inter',sans-serif",fontWeight:300,fontSize:"15px",color:"rgba(232,228,220,0.85)",lineHeight:1.85,margin:0}}>{text}</pre>
      </div>
      <button onClick={handleCopy} className="btn-ghost" style={{alignSelf:"flex-start",padding:"12px 24px",fontSize:"10px",color:copied?"#e8c87c":undefined,borderColor:copied?"rgba(201,168,76,0.3)":undefined}}>
        {copied ? <IconCheck /> : <IconCopy />}
        <span>{copied ? "Texte copié" : "Copier le texte"}</span>
      </button>
    </div>
  );
}

function VariantePanel({ data }: { data: AnnonceProData }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"28px"}}>
      <div style={{padding:"10px 16px",background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"8px",display:"inline-flex",alignItems:"center",gap:"8px",alignSelf:"flex-start"}}>
        <span className="mono" style={{color:"#c9a84c",fontSize:"9px"}}>Variante B — Angle alternatif</span>
      </div>
      <div>
        <p className="mono" style={{color:"#c9a84c",marginBottom:"1rem"}}>— Titre alternatif —</p>
        <h2 className="serif" style={{fontSize:"clamp(24px,3.5vw,34px)",fontWeight:300,color:"#f0ece4",lineHeight:1.15,margin:0,letterSpacing:"-0.01em"}}>{data.titre}</h2>
      </div>
      <div style={{height:"1px",background:"linear-gradient(90deg,rgba(201,168,76,0.25),transparent)"}} />
      <p className="serif" style={{fontSize:"17px",color:"rgba(232,228,220,0.78)",lineHeight:1.75,margin:0,fontWeight:300,fontStyle:"italic"}}>{data.description}</p>
      <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:"24px",display:"flex",flexDirection:"column",gap:"14px"}}>
        <p className="mono" style={{color:"rgba(232,228,220,0.4)",margin:"0 0 8px"}}>Points forts alternatifs</p>
        {data.points_forts.map((pt, i) => (
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"14px"}}>
            <div className="serif gold-text" style={{fontSize:"14px",fontStyle:"italic",fontWeight:300,minWidth:"24px",lineHeight:1.5}}>{String.fromCharCode(8544 + i)}</div>
            <span style={{fontSize:"14px",color:"rgba(232,228,220,0.75)",lineHeight:1.65,fontWeight:300}}>{pt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RapportPanel({ data }: { data: RapportData }) {
  const [copiedPortail, setCopiedPortail] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const charCount = data.accroche_portails?.length ?? 0;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"32px"}}>
      <div>
        <p className="mono" style={{color:"#c9a84c",marginBottom:"16px"}}>Accroche portails immobiliers</p>
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"12px",padding:"24px",position:"relative"}}>
          <p style={{fontSize:"18px",color:"#f0ece4",lineHeight:1.5,margin:"0 0 16px",fontWeight:300}}>{data.accroche_portails}</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span className="mono" style={{color:charCount > 60 ? "#c0624a" : "rgba(232,228,220,0.3)",fontSize:"9px"}}>{charCount} / 60 caractères</span>
            <button onClick={() => { navigator.clipboard.writeText(data.accroche_portails); setCopiedPortail(true); setTimeout(() => setCopiedPortail(false), 2200); }} className="btn-ghost" style={{padding:"8px 16px",fontSize:"9px",color:copiedPortail?"#e8c87c":undefined}}>
              {copiedPortail ? <IconCheck /> : <IconCopy />}
              <span>{copiedPortail ? "Copié" : "Copier"}</span>
            </button>
          </div>
        </div>
      </div>
      <div style={{height:"1px",background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.15),transparent)"}} />
      <div>
        <p className="mono" style={{color:"#c9a84c",marginBottom:"16px"}}>Pitch agent — 30 secondes</p>
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"12px",padding:"24px"}}>
          <p className="serif" style={{fontSize:"16px",color:"rgba(232,228,220,0.85)",lineHeight:1.8,margin:"0 0 20px",fontStyle:"italic",fontWeight:300}}>{data.pitch_agent}</p>
          <button onClick={() => { navigator.clipboard.writeText(data.pitch_agent); setCopiedPitch(true); setTimeout(() => setCopiedPitch(false), 2200); }} className="btn-ghost" style={{padding:"8px 16px",fontSize:"9px",color:copiedPitch?"#e8c87c":undefined}}>
            {copiedPitch ? <IconCheck /> : <IconCopy />}
            <span>{copiedPitch ? "Copié" : "Copier"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoriquePanel({ entries, loading }: { entries: {id: number; date: string; titre: string; plan: string}[]; loading: boolean }) {
  const planColors: Record<string, string> = { agence: "#c9a84c", prestige: "#a0a0a0", solo: "#4a4a4a", free: "#3a3a3a" };
  if (loading) return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"200px"}}>
      <IconLoader />
    </div>
  );
  if (entries.length === 0) return (
    <div style={{textAlign:"center",padding:"60px 20px"}}>
      <p className="serif" style={{color:"rgba(232,228,220,0.35)",fontSize:"17px",fontStyle:"italic",fontWeight:300}}>Aucune génération pour le moment</p>
    </div>
  );
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"0",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"16px",overflow:"hidden"}}>
      {entries.map((e, i) => (
        <div key={e.id} style={{display:"flex",alignItems:"center",gap:"16px",padding:"16px 20px",borderBottom:i<entries.length-1?"1px solid rgba(255,255,255,0.04)":"none",background:"rgba(255,255,255,0.01)"}}>
          <div className="serif gold-text" style={{fontSize:"16px",fontStyle:"italic",minWidth:"24px"}}>{String.fromCharCode(8544 + i)}</div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:"14px",color:"rgba(232,228,220,0.85)",margin:"0 0 4px",fontWeight:300,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.titre || "—"}</p>
            <p className="mono" style={{color:"rgba(232,228,220,0.3)",margin:0,fontSize:"9px"}}>{new Date(e.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"})}</p>
          </div>
          <div style={{padding:"4px 10px",borderRadius:"100px",background:planColors[e.plan]+"22",border:`1px solid ${planColors[e.plan]}40`}}>
            <span className="mono" style={{color:planColors[e.plan],fontSize:"8px"}}>{e.plan}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── App principale ───────────────────────────────────────────────────────────

export default function ImmoFlowApp() {
  const [notes, setNotes]         = useState("");
  const [luxeMode, setLuxeMode]   = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const [status, setStatus]       = useState<Status>("idle");
  const [result, setResult]       = useState<ImmoFlowResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("annonce");
  const [history, setHistory]     = useState<{id: number; date: string; titre: string; plan: string}[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const userPlan = String(user?.publicMetadata?.plan ?? "solo").toLowerCase();
  const isPrestige = userPlan === "prestige" || userPlan === "agence";

  useEffect(() => {
    document.querySelectorAll(".fade-up").forEach(el => el.classList.add("in"));
  }, []);

  useEffect(() => {
    if (activeTab !== "historique" || !user?.id) return;
    setHistoryLoading(true);
    fetch(`/api/history?userId=${user.id}`)
      .then(r => r.json())
      .then(d => setHistory(d.entries ?? []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [activeTab, user?.id]);

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

  const tabs: {id: TabId; label: string; icon: () => React.ReactElement}[] = [
    {id:"annonce",    label:"Annonce",     icon: IconFileText},
    {id:"storyboard", label:"Storyboard",  icon: IconFilm},
    ...(isPrestige ? [
      {id:"instagram" as TabId, label:"Instagram", icon: IconInstagram},
      {id:"linkedin"  as TabId, label:"LinkedIn",  icon: IconLinkedin},
      {id:"facebook"  as TabId, label:"Facebook",  icon: IconFacebook},
      {id:"variante"  as TabId, label:"Variante B",icon: IconCopy},
      {id:"rapport"   as TabId, label:"Rapport",   icon: IconRapport},
    ] : [
      {id:"reseaux"   as TabId, label:"Réseaux",   icon: IconShare},
    ]),
    {id:"historique" as TabId, label:"Historique", icon: IconClock},
  ];

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
            <button onClick={() => signOut({ redirectUrl: "/" })} className="nav-link" style={{background:"none",border:"none",cursor:"pointer",padding:0}}>Déconnexion</button>
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
              <div className={`luxe-card ${luxeMode && isPrestige ? 'active' : ''}`} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"20px",opacity:isPrestige?1:0.55}}>
                <div style={{display:"flex",alignItems:"center",gap:"16px",flex:1,minWidth:0}}>
                  <div style={{width:"40px",height:"40px",border:"1px solid rgba(201,168,76,0.25)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:luxeMode&&isPrestige?"rgba(201,168,76,0.08)":"transparent",transition:"all 0.6s cubic-bezier(0.16,1,0.3,1)"}}>
                    <span className="serif" style={{color:"#c9a84c",fontSize:"18px",fontStyle:"italic"}}>✦</span>
                  </div>
                  <div style={{minWidth:0}}>
                    <p className="serif" style={{fontSize:"18px",color:"#f0ece4",margin:"0 0 2px",fontStyle:"italic",fontWeight:300}}>
                      Analyse de Style Luxe
                    </p>
                    <p className="mono" style={{color:"rgba(232,228,220,0.4)",margin:0}}>
                      {isPrestige ? "Prompt exclusif · Plan Prestige" : "Réservé au plan Prestige — verrouillé"}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => { if (isPrestige) setLuxeMode(!luxeMode); }}
                  className={`toggle-switch ${luxeMode && isPrestige ? 'on' : ''}`}
                  style={{cursor: isPrestige ? "pointer" : "not-allowed"}}
                >
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
              <div style={{display:"flex",flexWrap:"wrap",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.015)",borderRadius:"16px 16px 0 0",overflow:"hidden"}}>
                {tabs.map(({id, label, icon: Icon}) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`tab-button ${activeTab === id ? 'active' : ''}`}
                    style={{flex:"1 1 auto",minWidth:"80px"}}
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
                {activeTab === "instagram"  && <PostPlatformPanel text={result.post_instagram ?? result.post_reseaux} platform="Instagram" />}
                {activeTab === "linkedin"   && <PostPlatformPanel text={result.post_linkedin  ?? result.post_reseaux} platform="LinkedIn" />}
                {activeTab === "facebook"   && <PostPlatformPanel text={result.post_facebook  ?? result.post_reseaux} platform="Facebook" />}
                {activeTab === "variante"   && result.variante_b && <VariantePanel data={result.variante_b} />}
                {activeTab === "rapport"    && result.rapport    && <RapportPanel  data={result.rapport} />}
                {activeTab === "historique" && <HistoriquePanel entries={history} loading={historyLoading} />}
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
                  onClick={() => {
                    const p = String(user?.publicMetadata?.plan ?? "solo").toLowerCase();
                    if (p === "prestige") generatePDF(result, "prestige");
                    else if (p === "agence") generatePDF(result, "agence", user?.publicMetadata?.agencyName as string | undefined, user?.publicMetadata?.agencyLogo as string | undefined);
                    else exportPDF(result);
                  }}
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
