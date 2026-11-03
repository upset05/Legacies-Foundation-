const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MINIMUM_FORM_AGE_MS = 3000;
const submissionCounts = new Map();

function respond(response, status, payload) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.status(status).json(payload);
}

function parseBody(request) {
  if (Buffer.isBuffer(request.body)) return JSON.parse(request.body.toString("utf8"));
  if (typeof request.body === "string") {
    if (request.headers["content-type"]?.includes("application/x-www-form-urlencoded")) {
      return Object.fromEntries(new URLSearchParams(request.body));
    }
    return JSON.parse(request.body);
  }
  return request.body && typeof request.body === "object" ? request.body : {};
}

function requiredText(body, name, maximum) {
  if (typeof body[name] !== "string") return null;
  const value = body[name].trim();
  return value.length > 0 && value.length <= maximum ? value : null;
}

function validWebAddress(value, optional = false) {
  if (optional && !value) return true;
  if (typeof value !== "string" || value.length > 2000) return false;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function allowSubmission(ip, now) {
  const current = submissionCounts.get(ip);
  if (current && now - current.startedAt < RATE_LIMIT_WINDOW_MS && current.count >= RATE_LIMIT_MAX) return false;
  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    submissionCounts.set(ip, { startedAt: now, count: 1 });
  } else {
    submissionCounts.set(ip, { ...current, count: current.count + 1 });
  }
  if (submissionCounts.size > 5000) {
    for (const [key, value] of submissionCounts) {
      if (now - value.startedAt >= RATE_LIMIT_WINDOW_MS) submissionCounts.delete(key);
    }
  }
  return true;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return respond(response, 405, { ok: false, error: "Use POST to submit an application." });
  }

  let body;
  try {
    body = parseBody(request);
  } catch {
    return respond(response, 400, { ok: false, error: "The application form could not be read. Please check the fields and try again." });
  }

  if (typeof body.companyWebsite === "string" && body.companyWebsite.trim()) {
    return respond(response, 400, { ok: false, error: "The application could not be accepted." });
  }

  const startedAt = Number(body.startedAt);
  const now = Date.now();
  if (!Number.isFinite(startedAt) || now - startedAt < MINIMUM_FORM_AGE_MS || now - startedAt > 2 * 60 * 60 * 1000) {
    return respond(response, 400, { ok: false, error: "Please review the form and submit it again." });
  }

  const fullName = requiredText(body, "fullName", 120);
  const email = requiredText(body, "email", 254);
  const country = requiredText(body, "country", 100);
  const city = requiredText(body, "city", 120);
  const studioName = requiredText(body, "studioName", 160);
  const craft = requiredText(body, "craft", 40);
  const portfolio = requiredText(body, "portfolio", 2000);
  const bio = requiredText(body, "bio", 800);
  const whyLegacies = requiredText(body, "whyLegacies", 800);
  const samples = typeof body.samples === "string" ? body.samples.trim() : "";
  const allowedCrafts = new Set([
    "Clothing and ready-to-wear",
    "Tailoring and bespoke garments",
    "Knitwear",
    "Traditional and heritage garments",
    "Leather goods",
    "Footwear",
    "Handwoven textiles",
    "Embroidery and surface embellishment",
    "Natural dyeing and textile printing",
    "Spinning, fibre and yarn",
    "Quilting and patchwork",
    "Bags and small accessories",
    "Jewellery and metalwork",
    "Beadwork and adornment",
    "Scarves and soft accessories",
    "Ceramics and clay",
    "Basketry and plant fibre",
    "Woodcraft and carving",
    "Homeware and functional objects",
    "Art, illustration and wearable art",
    "Other craft practice",
  ]);

  if (!fullName || !email || !country || !city || !studioName || !craft || !portfolio || !bio || !whyLegacies
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !allowedCrafts.has(craft)
    || !validWebAddress(portfolio)
    || !validWebAddress(samples, true)
    || ![true, "true", "on"].includes(body.consent)) {
    return respond(response, 400, { ok: false, error: "Please check that all required fields are complete and valid." });
  }

  const forwardedIp = request.headers["x-real-ip"] || request.headers["x-forwarded-for"]?.split(",")[0]?.trim();
  const ip = typeof forwardedIp === "string" && forwardedIp.length <= 100 ? forwardedIp : "unknown";
  if (!allowSubmission(ip, now)) {
    return respond(response, 429, { ok: false, error: "Too many applications were submitted from this connection. Please try again later." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM;
  if (!apiKey || !sender) {
    return respond(response, 503, { ok: false, error: "Application delivery is not configured yet. Please email legacies@legacies.global." });
  }

  const message = [
    "New Legacies Global partner application",
    "",
    `Full name: ${fullName}`,
    `Email: ${email}`,
    `Location: ${city}, ${country}`,
    `Brand or studio: ${studioName}`,
    `Craft or category: ${craft}`,
    `Portfolio: ${portfolio}`,
    `Short bio: ${bio}`,
    `Why Legacies: ${whyLegacies}`,
    `Samples: ${samples || "Not provided"}`,
  ].join("\n");

  let emailResponse;
  try {
    emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: ["legacies@legacies.global"],
        reply_to: email,
        subject: "New artisan and designer partner application",
        text: message,
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return respond(response, 502, { ok: false, error: "We could not deliver your application just now. Please email legacies@legacies.global." });
  }

  if (!emailResponse.ok) {
    return respond(response, 502, { ok: false, error: "We could not deliver your application just now. Please email legacies@legacies.global." });
  }
  return respond(response, 200, { ok: true });
}
