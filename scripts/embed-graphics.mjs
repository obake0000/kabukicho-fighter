// play.html / index.html 内の image-URL 定数を、grafic フォルダの PNG の base64 data URL に置換するワンショット build。
// - 既に `const X_URL = "data:..."` の形で埋まっていれば再置換 (re-embeddable)
// - mani-script.js の "DATA_URL_TRUNCATED" stub も置換
// 実行: node scripts/embed-graphics.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");           // claude-MANI
const repoRoot = path.resolve(root, "..");            // 歌舞伎町ファイター

const targets = [
  path.join(root, "index.html"),
  path.join(root, "mani-script.js"),
];

const sources = {
  TITLE_IMG_URL:     path.join(repoRoot, "grafic", "86020a83-33ff-44d8-a04c-5e071198647c.png"),
  STAGE_IMG_URL:     path.join(repoRoot, "grafic", "night-mart-stage-bg-768.png"),
  SUPPORT_SHEET_URL: path.join(repoRoot, "grafic", "9920263b-3ad1-4be5-9e09-fb89763e23e3.png"),
  YUUMA_SHEET_URL:   path.join(repoRoot, "grafic", "ChatGPT Image 2026年5月9日 03_15_01 (4).png"),
  ENEMY_SHEET_URL:    path.join(repoRoot, "grafic", "ホームレス.png"),
  ENEMY_HOST_URL:     path.join(repoRoot, "grafic", "ホスト.png"),
  ENEMY_RUNAWAY_URL:  path.join(repoRoot, "grafic", "家で.png"),
  ENEMY_YAKUZA_URL:   path.join(repoRoot, "grafic", "やくざ.png"),
  YUUMA_RECORD_URL:   path.join(repoRoot, "grafic", "yuuma-record-source.png"),
  PORTRAITS_URL:      path.join(repoRoot, "grafic", "portrait-icons.png"),
  KAO_YUUMA_URL:      path.join(repoRoot, "grafic", "kao-yuuma.jpg"),
  KAO_HOMELESS_URL:   path.join(repoRoot, "grafic", "kao-ho-muresu.jpg"),
  KAO_HOST_URL:       path.join(repoRoot, "grafic", "kao-hosuto.jpg"),
  KAO_IEDE_URL:       path.join(repoRoot, "grafic", "kao-iede.jpg"),
  KAO_YAKUZA_URL:     path.join(repoRoot, "grafic", "kao-yakuza.jpg"),
  PROLOGUE_1_URL:     path.join(repoRoot, "grafic", "ChatGPT Image 2026年5月9日 07_18_07 (1).png"),
  PROLOGUE_2_URL:     path.join(repoRoot, "grafic", "ChatGPT Image 2026年5月9日 07_18_07 (2).png"),
  PROLOGUE_3_URL:     path.join(repoRoot, "grafic", "ChatGPT Image 2026年5月9日 07_18_07 (3).png"),
  PROLOGUE_4_URL:     path.join(repoRoot, "grafic", "ChatGPT Image 2026年5月9日 07_18_08 (4).png"),
  PROLOGUE_5_URL:     path.join(repoRoot, "grafic", "ChatGPT Image 2026年5月9日 07_18_08 (5).png"),
  PROLOGUE_6_URL:     path.join(repoRoot, "grafic", "ChatGPT Image 2026年5月9日 07_18_08 (6).png"),
  ENDING_1_URL:       path.join(repoRoot, "grafic", "ChatGPT Image 2026年5月9日 07_18_08 (7).png"),
  ENDING_2_URL:       path.join(repoRoot, "grafic", "ChatGPT Image 2026年5月9日 07_18_08 (8).png"),
  ENDING_3_URL:       path.join(repoRoot, "grafic", "ChatGPT Image 2026年5月9日 07_18_08 (9).png"),
  ENDING_4_URL:       path.join(repoRoot, "grafic", "ChatGPT Image 2026年5月9日 07_18_08 (10).png"),
};

function dataUrlFor(file) {
  const buf = fs.readFileSync(file);
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function replaceConst(src, name, value) {
  const lit = JSON.stringify(value);
  // 既存定数行を置換
  const re = new RegExp(`const\\s+${name}\\s*=\\s*"[^"]*"\\s*;`);
  if (re.test(src)) {
    return { src: src.replace(re, `const ${name} = ${lit};`), action: "replaced" };
  }
  // 無ければ SUPPORT_SHEET_URL の直後に追加（順序を保つ）
  const insertAfter = /const\s+SUPPORT_SHEET_URL\s*=\s*"[^"]*"\s*;/;
  if (insertAfter.test(src)) {
    return {
      src: src.replace(insertAfter, (m) => `${m}\nconst ${name} = ${lit};`),
      action: "inserted",
    };
  }
  return { src, action: "skipped" };
}

for (const target of targets) {
  if (!fs.existsSync(target)) { console.warn(`! missing target: ${target}`); continue; }
  let src = fs.readFileSync(target, "utf8");
  let changes = 0;
  for (const [name, file] of Object.entries(sources)) {
    if (!fs.existsSync(file)) {
      console.warn(`! missing source: ${file}, skipping ${name}`);
      continue;
    }
    const url = dataUrlFor(file);
    const { src: next, action } = replaceConst(src, name, url);
    if (action !== "skipped") {
      src = next;
      changes++;
      const buf = fs.statSync(file);
      console.log(`  [${path.basename(target)}] ${name}: ${action} (${(buf.size / 1024).toFixed(0)} KB raw)`);
    } else {
      console.log(`  [${path.basename(target)}] ${name}: skipped (no anchor)`);
    }
  }
  fs.writeFileSync(target, src);
  const finalSize = fs.statSync(target).size;
  console.log(`  -> ${path.basename(target)}: ${(finalSize / 1024).toFixed(0)} KB total, ${changes} change(s)\n`);
}
