import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

function loadLocalEnv() {
  try {
    const text = readFileSync(path.join(ROOT, ".env"), "utf8");
    text.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const separator = trimmed.indexOf("=");
      if (separator <= 0) return;
      const key = trimmed.slice(0, separator).trim();
      if (!/^[A-Z_][A-Z0-9_]*$/i.test(key) || process.env[key] !== undefined) return;
      const rawValue = trimmed.slice(separator + 1).trim();
      process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
    });
  } catch {
    // .env is optional; shell environment variables still work.
  }
}

loadLocalEnv();

const PORT = Number(process.env.PORT || 8080);
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5";
const QWEN_IMAGE_ENDPOINT = process.env.QWEN_IMAGE_ENDPOINT || "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
const DOUBAO_IMAGE_ENDPOINT = process.env.DOUBAO_IMAGE_ENDPOINT || "https://ark.cn-beijing.volces.com/api/v3/images/generations";
const DOUBAO_REFERENCE_FIELD = process.env.DOUBAO_REFERENCE_FIELD || "image";
const MAX_JSON_BYTES = 18 * 1024 * 1024;

const STYLE_REFERENCE_ASSETS = {
  cat: [
    "assets/art/v3/cats/tabby-sit.png",
    "assets/art/v3/cats/sleepy-sit.png",
  ],
  bead: [
    "assets/art/v3/bracelets/bodhi-root-pure-0.png",
    "assets/art/v3/bracelets/xingyue-default-0.png",
  ],
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".ico": "image/x-icon",
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function sendCorsPreflight(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  });
  res.end();
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_JSON_BYTES) {
        reject(new Error("上传内容太大，请压缩图片后再试。"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(new Error("请求格式不是有效 JSON。"));
      }
    });
    req.on("error", reject);
  });
}

function parseImageDataUrl(dataUrl, fallbackMime = "image/png") {
  const match = /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i.exec(String(dataUrl || ""));
  if (!match) throw new Error("请上传 PNG、JPG 或 WebP 图片。");
  const mimeType = match[1].replace("image/jpg", "image/jpeg") || fallbackMime;
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length) throw new Error("图片内容为空。");
  return { buffer, mimeType };
}

function safeSlug(value, fallback) {
  const ascii = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const hash = createHash("sha1").update(String(value || fallback)).digest("hex").slice(0, 8);
  return `${ascii || fallback}-${hash}`;
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function resolveModel(model) {
  const requested = String(model || "").trim();
  if (!requested || requested === "local-pixel") return { provider: "local", model: "local-pixel" };
  if (requested.startsWith("openai:")) return { provider: "openai", model: requested.slice("openai:".length).trim() || OPENAI_IMAGE_MODEL };
  if (requested.startsWith("qwen:")) return { provider: "qwen", model: requested.slice("qwen:".length).trim() || "qwen-image-2.0-pro" };
  if (requested.startsWith("doubao:")) return { provider: "doubao", model: requested.slice("doubao:".length).trim() || "doubao-seedream-4.0" };
  return { provider: "openai", model: requested };
}

async function fileToDataUrl(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  const data = await readFile(filePath);
  const mimeType = MIME_TYPES[path.extname(filePath).toLowerCase()]?.split(";")[0] || "image/png";
  return `data:${mimeType};base64,${data.toString("base64")}`;
}

async function styleReferenceDataUrls(kind, maxCount = 2) {
  const refs = STYLE_REFERENCE_ASSETS[kind] ?? [];
  const dataUrls = [];
  for (const ref of refs.slice(0, maxCount)) {
    try {
      dataUrls.push(await fileToDataUrl(ref));
    } catch {
      // Missing optional style references should not block generation.
    }
  }
  return dataUrls;
}

async function imageFromRemoteOrDataUrl(value) {
  if (!value) throw new Error("生图服务没有返回图片。");
  if (/^data:image\/[a-z+.-]+;base64,/i.test(value)) {
    return Buffer.from(value.split(",")[1], "base64");
  }
  if (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 200) {
    return Buffer.from(value, "base64");
  }
  const response = await fetch(value);
  if (!response.ok) throw new Error(`下载生成图片失败 (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

async function fetchProvider(providerName, url, options) {
  try {
    return await fetch(url, options);
  } catch (error) {
    throw new Error(`${providerName} 接口请求失败：${error.message || "网络不可达"}。请确认本机网络能访问该服务，且代理/防火墙允许 Node.js 出站。`);
  }
}

function localPixelSvg({ kind, name, note, imageDataUrl }) {
  const title = escapeXml(name || (kind === "cat" ? "AI cat" : "AI bracelet"));
  const desc = escapeXml(note || "Local free pixel-style transformation from uploaded reference.");
  const href = escapeXml(imageDataUrl);
  const clip = kind === "cat"
    ? `<clipPath id="spriteClip"><path d="M210 795 C150 685 170 520 270 405 L205 210 L390 316 C454 292 560 292 624 316 L810 210 L745 405 C845 520 865 685 804 795 C714 910 300 910 210 795 Z"/></clipPath>`
    : `<mask id="braceletMask"><rect width="1024" height="1024" fill="black"/><circle cx="512" cy="512" r="320" fill="none" stroke="white" stroke-width="150" stroke-linecap="round"/><circle cx="512" cy="512" r="188" fill="black"/></mask>`;
  const shapeAttrs = kind === "cat" ? `clip-path="url(#spriteClip)"` : `mask="url(#braceletMask)"`;
  const accent = kind === "cat"
    ? `<path d="M210 795 C150 685 170 520 270 405 L205 210 L390 316 C454 292 560 292 624 316 L810 210 L745 405 C845 520 865 685 804 795 C714 910 300 910 210 795 Z" fill="none" stroke="#5a2a14" stroke-width="22" stroke-linejoin="round" opacity=".95"/>`
    : `<circle cx="512" cy="512" r="320" fill="none" stroke="#5a2a14" stroke-width="18" opacity=".95"/><circle cx="512" cy="512" r="188" fill="none" stroke="#5a2a14" stroke-width="12" opacity=".9"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <title>${title}</title>
  <desc>${desc}</desc>
  <defs>
    ${clip}
    <filter id="posterPixel" color-interpolation-filters="sRGB">
      <feComponentTransfer>
        <feFuncR type="discrete" tableValues="0 .16 .32 .48 .64 .8 1"/>
        <feFuncG type="discrete" tableValues="0 .16 .32 .48 .64 .8 1"/>
        <feFuncB type="discrete" tableValues="0 .16 .32 .48 .64 .8 1"/>
      </feComponentTransfer>
      <feDropShadow dx="0" dy="18" stdDeviation="0" flood-color="#522912" flood-opacity=".18"/>
    </filter>
  </defs>
  <g style="image-rendering: pixelated">
    <image href="${href}" x="112" y="112" width="800" height="800" preserveAspectRatio="xMidYMid slice" filter="url(#posterPixel)" ${shapeAttrs}/>
    ${accent}
  </g>
</svg>`;
}

function designPrompt(kind, name, note) {
  if (kind === "cat") {
    return [
      "Create one clean transparent-background pixel art sprite for a cozy Chinese wenwan bead-shop idle game.",
      "Use the uploaded real cat photo as the visual reference. Preserve the cat's distinctive fur colors, face markings, eye impression, and silhouette.",
      "Use the additional style-reference sprites only for game art style: chunky pixel-art proportions, warm palette, dark brown outline, transparent background, centered composition.",
      "Full body, cute but recognizable, centered on a square canvas, 3/4 sitting pose, crisp pixel-art edges, no text, no border, no props covering the cat.",
      `Character name: ${name}.`,
      note ? `Design notes from player: ${note}.` : "",
    ].filter(Boolean).join(" ");
  }

  return [
    "Create one clean transparent-background pixel art sprite for a collectible wenwan bracelet in a cozy Chinese bead-shop idle game.",
    "Use the uploaded real bracelet or bead photo as the material reference. Preserve bead color, texture, shape, string style, and any distinctive pattern.",
    "Use the additional style-reference sprites only for game art style: chunky pixel-art proportions, warm palette, dark brown outline, transparent background, centered composition.",
    "Show a complete circular bracelet centered on a square canvas, crisp pixel-art edges, no text, no border, no hand, no table background.",
    `Bracelet name: ${name}.`,
    note ? `Design notes from player: ${note}.` : "",
  ].filter(Boolean).join(" ");
}

async function createOpenAIImage({ kind, name, note, imageDataUrl, imageName, mimeType, model, styleReferences = [], apiKey }) {
  const resolvedApiKey = String(apiKey || "").trim() || process.env.OPENAI_API_KEY;
  if (!resolvedApiKey) {
    throw new Error("缺少 OPENAI_API_KEY，请先在启动服务前配置环境变量。");
  }

  const source = parseImageDataUrl(imageDataUrl, mimeType);
  const form = new FormData();
  form.append("model", model || OPENAI_IMAGE_MODEL);
  form.append("prompt", designPrompt(kind, name, note));
  form.append("image", new Blob([source.buffer], { type: source.mimeType }), imageName || `${kind}-reference.png`);
  styleReferences.forEach((reference, index) => {
    const parsed = parseImageDataUrl(reference);
    form.append("image", new Blob([parsed.buffer], { type: parsed.mimeType }), `${kind}-style-${index + 1}.png`);
  });
  form.append("size", "1024x1024");
  form.append("quality", "medium");
  form.append("background", "transparent");
  form.append("output_format", "png");

  const response = await fetchProvider("OpenAI", "https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resolvedApiKey}`,
    },
    body: form,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = result?.error?.message || `OpenAI 图片生成失败 (${response.status})`;
    throw new Error(message);
  }

  const b64 = result?.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI 没有返回可保存的图片。");
  return Buffer.from(b64, "base64");
}

async function createQwenImage({ kind, name, note, imageDataUrl, model, styleReferences = [], apiKey }) {
  const resolvedApiKey = String(apiKey || "").trim() || process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY;
  if (!resolvedApiKey) throw new Error("缺少 DASHSCOPE_API_KEY 或 QWEN_API_KEY。");

  const images = [imageDataUrl, ...styleReferences].slice(0, 3);
  const response = await fetchProvider("千问", QWEN_IMAGE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resolvedApiKey}`,
      "Content-Type": "application/json",
      "X-DashScope-Sync": "true",
    },
    body: JSON.stringify({
      model,
      input: {
        messages: [
          {
            role: "user",
            content: [
              ...images.map((image) => ({ image })),
              { text: designPrompt(kind, name, note) },
            ],
          },
        ],
      },
      parameters: {
        size: "1024*1024",
        n: 1,
        watermark: false,
      },
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result?.message || result?.error?.message || `千问图片生成失败 (${response.status})`);
  }

  const content = result?.output?.choices?.[0]?.message?.content ?? result?.output?.message?.content ?? [];
  const item = Array.isArray(content) ? content.find((entry) => entry.image || entry.url || entry.b64_json) : content;
  return imageFromRemoteOrDataUrl(item?.image || item?.url || item?.b64_json || result?.output?.url || result?.output?.image);
}

async function createDoubaoImage({ kind, name, note, imageDataUrl, model, styleReferences = [], apiKey }) {
  const resolvedApiKey = String(apiKey || "").trim() || process.env.DOUBAO_API_KEY || process.env.ARK_API_KEY || process.env.VOLCENGINE_API_KEY;
  if (!resolvedApiKey) throw new Error("缺少 DOUBAO_API_KEY、ARK_API_KEY 或 VOLCENGINE_API_KEY。");

  const response = await fetchProvider("豆包/火山方舟", DOUBAO_IMAGE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resolvedApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: designPrompt(kind, name, note),
      [DOUBAO_REFERENCE_FIELD]: [imageDataUrl, ...styleReferences],
      size: "1024x1024",
      response_format: "b64_json",
      watermark: false,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result?.error?.message || result?.message || `豆包图片生成失败 (${response.status})`);
  }

  const item = result?.data?.[0] ?? result?.result?.data?.[0] ?? {};
  return imageFromRemoteOrDataUrl(item.b64_json || item.url || item.image || result?.b64_json || result?.url);
}

async function handleAiDesign(req, res) {
  try {
    const payload = await readJsonBody(req);
    const kind = payload.kind === "bead" ? "bead" : "cat";
    const name = String(payload.name || "").trim().slice(0, 18);
    const note = String(payload.note || "").trim().slice(0, 160);
    const apiKey = String(payload.apiKey || "").trim();
    const selected = resolveModel(payload.model);
    if (!name) throw new Error("请填写名字。");
    const styleReferences = await styleReferenceDataUrls(kind, selected.provider === "qwen" ? 2 : 3);

    const folder = kind === "cat" ? "cats" : "beads";
    const dir = path.join(ROOT, "assets", "ai", folder);
    await mkdir(dir, { recursive: true });
    const extension = selected.provider === "local" ? "svg" : "png";
    const filename = `${Date.now()}-${safeSlug(name, kind)}.${extension}`;
    const diskPath = path.join(dir, filename);

    if (selected.provider === "local") {
      parseImageDataUrl(payload.imageDataUrl, payload.mimeType);
      const svg = localPixelSvg({ kind, name, note, imageDataUrl: payload.imageDataUrl });
      await writeFile(diskPath, svg, "utf8");
    } else if (selected.provider === "openai") {
      const image = await createOpenAIImage({
        kind,
        name,
        note,
        imageDataUrl: payload.imageDataUrl,
        imageName: payload.imageName,
        mimeType: payload.mimeType,
        model: selected.model,
        styleReferences,
        apiKey,
      });
      await writeFile(diskPath, image);
    } else if (selected.provider === "qwen") {
      const image = await createQwenImage({
        kind,
        name,
        note,
        imageDataUrl: payload.imageDataUrl,
        model: selected.model,
        styleReferences,
        apiKey,
      });
      await writeFile(diskPath, image);
    } else if (selected.provider === "doubao") {
      const image = await createDoubaoImage({
        kind,
        name,
        note,
        imageDataUrl: payload.imageDataUrl,
        model: selected.model,
        styleReferences,
        apiKey,
      });
      await writeFile(diskPath, image);
    } else {
      throw new Error(`暂不支持的模型提供方：${selected.provider}`);
    }

    const assetPath = `assets/ai/${folder}/${filename}`;
    sendJson(res, 200, { kind, name, assetPath, model: selected.model, provider: selected.provider });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "AI 生成失败" });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const diskPath = path.normalize(path.join(ROOT, requested));
  if (!diskPath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const info = await stat(diskPath);
    const filePath = info.isDirectory() ? path.join(diskPath, "index.html") : diskPath;
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": filePath.includes(`${path.sep}assets${path.sep}ai${path.sep}`) ? "no-cache" : "public, max-age=60",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

createServer((req, res) => {
  if (req.method === "OPTIONS" && req.url?.startsWith("/api/ai-design")) {
    sendCorsPreflight(res);
    return;
  }
  if (req.method === "POST" && req.url?.startsWith("/api/ai-design")) {
    handleAiDesign(req, res);
    return;
  }
  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }
  res.writeHead(405, { Allow: "GET, HEAD, POST" });
  res.end("Method not allowed");
}).listen(PORT, () => {
  console.log(`Cat Bodhi AI server running at http://localhost:${PORT}`);
  console.log(`Image model: ${OPENAI_IMAGE_MODEL}`);
});
