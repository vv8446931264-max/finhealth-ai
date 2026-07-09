// ponytail: Vercel serverless proxy for Vertex AI Gemini — keeps service account server-side
const PROJECT = process.env.GCP_PROJECT_ID || "finhealth-vertex-ai";
const LOCATION = "us-central1";
const MODEL = "gemini-2.5-flash";
const VERTEX_URL = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;
const ALLOWED_ORIGIN = "https://finhealth-ai-rho.vercel.app";

// ponytail: in-memory rate limit — per IP, 20 req/min, resets each minute
const rateMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const window = 60_000;
  const limit = 20;
  const entry = rateMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > window) { rateMap.set(ip, { count: 1, start: now }); return false; }
  if (entry.count >= limit) return true;
  entry.count++;
  rateMap.set(ip, entry);
  return false;
}

async function getAccessToken() {
  const keyB64 = process.env.GCP_SERVICE_ACCOUNT_KEY;
  if (!keyB64) throw new Error("GCP_SERVICE_ACCOUNT_KEY not set");
  const key = JSON.parse(Buffer.from(keyB64, "base64").toString());

  // JWT for service account
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const claim = Buffer.from(JSON.stringify({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })).toString("base64url");

  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${claim}`);
  const sig = sign.sign(key.private_key, "base64url");
  const jwt = `${header}.${claim}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || "Token fetch failed");
  return data.access_token;
}

export default async function handler(req, res) {
  // CORS — only allow our own domain
  const origin = req.headers.origin || "";
  if (origin && origin !== ALLOWED_ORIGIN) return res.status(403).json({ error: "Forbidden" });
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST");

  if (req.method !== "POST") return res.status(405).end();

  // Rate limit by IP
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || "unknown";
  if (isRateLimited(ip)) return res.status(429).json({ error: "Too many requests" });

  // Basic input validation — must have contents array
  if (!Array.isArray(req.body?.contents) || req.body.contents.length === 0)
    return res.status(400).json({ error: "Invalid request" });

  try {
    const token = await getAccessToken();
    const vRes = await fetch(VERTEX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ contents: req.body.contents }),
    });
    const data = await vRes.json();
    if (!vRes.ok) return res.status(vRes.status).json({ error: "Upstream error" });
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: "Internal error" });
  }
}
