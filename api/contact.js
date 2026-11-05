const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const submissionCounts = new Map();
const categories = new Set([
  "General question",
  "Designer partnership",
  "Editorial or press",
  "Collections and catalogue",
  "Website support",
  "Other enquiry",
]);

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
    return respond(response, 405, { ok: false, error: "Use POST to send an enquiry." });
  }

  let body;
  try {
    body = parseBody(request);
  } catch {
    return respond(response, 400, { ok: false, error: "Your enquiry could not be read. Please try again." });
  }

  if (typeof body.companyWebsite === "string" && body.companyWebsite.trim()) {
    return respond(response, 400, { ok: false, error: "Your enquiry could not be accepted." });
  }

  const name = requiredText(body, "name", 120);
  const email = requiredText(body, "email", 254);
  const category = requiredText(body, "category", 80);
  const message = requiredText(body, "message", 3000);
  if (!name || !email || !category || !message
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !categories.has(category)) {
    return respond(response, 400, { ok: false, error: "Please complete each field with valid information." });
  }

  const ip = request.socket?.remoteAddress || request.connection?.remoteAddress || "unknown";
  if (!allowSubmission(ip, Date.now())) {
    return respond(response, 429, { ok: false, error: "Too many enquiries were sent from this connection. Please try again later." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM;
  if (!apiKey || !sender) {
    return respond(response, 503, { ok: false, error: "Enquiry delivery is not configured yet. Please email legacies@legacies.global." });
  }

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
        subject: `Website enquiry: ${category}`,
        text: [
          "New Legacies Global website enquiry",
          "",
          `Name: ${name}`,
          `Email: ${email}`,
          `Category: ${category}`,
          "",
          "Message:",
          message,
        ].join("\n"),
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return respond(response, 502, { ok: false, error: "We could not send your enquiry just now. Please email legacies@legacies.global." });
  }

  if (!emailResponse.ok) {
    return respond(response, 502, { ok: false, error: "We could not send your enquiry just now. Please email legacies@legacies.global." });
  }
  return respond(response, 200, { ok: true });
}
