// ponytail: Vercel serverless proxy for Vertex AI Gemini — keeps service account server-side
const PROJECT = process.env.GCP_PROJECT_ID || "finhealth-vertex-ai";
const LOCATION = "us-central1";
const MODEL = "gemini-1.5-flash";
const VERTEX_URL = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;

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
  if (req.method !== "POST") return res.status(405).end();

  try {
    const token = await getAccessToken();
    const vRes = await fetch(VERTEX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(req.body),
    });
    const data = await vRes.json();
    if (!vRes.ok) return res.status(vRes.status).json(data);
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
