const protocolVersion = "2025-03-26";
const serverInfo = { name: "legacies-global-public-information", version: "1.0.0" };

const publicPages = [
  { title: "Home", url: "https://legacies.global/", summary: "Legacies Global and its focus on artisan design, culture and considered fashion." },
  { title: "About Legacies Global", url: "https://legacies.global/about", summary: "The platform's purpose, principles and editorial approach." },
  { title: "Legacies Across Borders", url: "https://legacies.global/across-borders", summary: "How the platform connects makers, design and context across locations." },
  { title: "Legacies Showcases", url: "https://legacies.global/showcases", summary: "A showcase hub; illustrative placeholders are not real partner profiles." },
  { title: "Catalogue", url: "https://legacies.global/catalogue", summary: "Curated fashion editions." },
  { title: "Onboarding", url: "https://legacies.global/onboarding", summary: "Partner criteria, review process and application." },
  { title: "Careers", url: "https://legacies.global/careers", summary: "Career and collaboration information." },
  { title: "Contact", url: "https://legacies.global/contact", summary: "General enquiries by email." },
];

const tools = [
  {
    name: "get_business_overview",
    description: "Return verified public information about Legacies Global. This tool is read-only and does not provide unpublished business details.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "list_public_pages",
    description: "List public, indexable Legacies Global website pages and short descriptions. Placeholder showcase profiles are not represented as real partners.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

function rpcError(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function rpcSuccess(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function toolResult(text, structuredContent) {
  return { content: [{ type: "text", text }], structuredContent, isError: false };
}

export default function handler(request, response) {
  response.set("Cache-Control", "no-store");
  response.set("MCP-Protocol-Version", protocolVersion);

  if (request.method !== "POST") {
    response.set("Allow", "POST");
    return response.status(405).json({ error: "Use POST for MCP JSON-RPC requests." });
  }

  const message = request.body;
  if (!message || typeof message !== "object" || Array.isArray(message)
    || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return response.status(400).json(rpcError(null, -32600, "Invalid JSON-RPC request."));
  }

  if (message.method === "notifications/initialized" || !Object.hasOwn(message, "id")) {
    return response.status(202).end();
  }

  const id = message.id;
  if (message.method === "initialize") {
    return response.json(rpcSuccess(id, {
      protocolVersion,
      capabilities: { tools: { listChanged: false } },
      serverInfo,
      instructions: "Tools return public, read-only information about Legacies Global. Use the site links for current page details.",
    }));
  }

  if (message.method === "ping") return response.json(rpcSuccess(id, {}));

  if (message.method === "tools/list") {
    return response.json(rpcSuccess(id, { tools }));
  }

  if (message.method === "tools/call") {
    const name = message.params?.name;
    const args = message.params?.arguments ?? {};
    if (args === null || typeof args !== "object" || Array.isArray(args) || Object.keys(args).length > 0) {
      return response.json(rpcError(id, -32602, "This read-only tool accepts no arguments."));
    }

    if (name === "get_business_overview") {
      const overview = {
        name: "Legacies Global",
        website: "https://legacies.global/",
        email: "legacies@legacies.global",
        focus: "Artisan design, cultural innovation, considered fashion editions and editorial collaboration.",
        phone: null,
        streetAddress: null,
        note: "No public telephone number or street address is published.",
      };
      return response.json(rpcSuccess(id, toolResult(
        "Legacies Global is a fashion platform connecting artisan designers and cultural innovators with audiences and opportunities across borders. Contact: legacies@legacies.global. No public phone number or street address is published.",
        overview,
      )));
    }

    if (name === "list_public_pages") {
      return response.json(rpcSuccess(id, toolResult(JSON.stringify(publicPages), { pages: publicPages })));
    }

    return response.json(rpcError(id, -32602, `Unknown tool: ${String(name)}`));
  }

  return response.json(rpcError(id, -32601, `Method not found: ${message.method}`));
}
