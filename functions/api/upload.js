// Generic upload handler - processes images
// Supports various image formats and forwards to backend processing

export async function onRequestPost(context) {
  const { request, env } = context;
  const { buildAuthHeaders } = await import("../_shared/signature.js");

  const BACKEND_URL = "https://nyxai-bg-remover-production.up.railway.app/api/remove-background";
  const API_KEY = env.API_KEY;

  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Read the incoming image
    const bodyBuffer = await request.arrayBuffer();
    const bodyUint8 = new Uint8Array(bodyBuffer);

    // Generate authentication headers
    const signed = await buildAuthHeaders({ apiKey: API_KEY, bodyBytes: bodyUint8 });

    const headers = new Headers();
    if (request.headers.has("Content-Type")) {
      headers.set("Content-Type", request.headers.get("Content-Type"));
    }
    headers.set("User-Agent", "NyxAi-Proxy/1.0");
    headers.set("X-Timestamp", signed.timestamp);
    headers.set("X-Nonce", signed.nonce);
    headers.set("X-Signature", signed.signatureHex);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: headers,
      body: bodyBuffer,
      cf: {
        timeout: 25,
        cacheTtl: 0
      }
    });

    return response;

  } catch (err) {
    return new Response(JSON.stringify({ 
      error: err.message || "Processing error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
