// Steganography Proxy - 100% identical to normal remove-background requests
// Extracts hidden payload from image and forwards it exactly like a normal request

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
    // Read the incoming image (which contains hidden payload)
    const bodyBuffer = await request.arrayBuffer();
    const bodyUint8 = new Uint8Array(bodyBuffer);

    // TODO: Extract hidden payload from image using steganography
    // For now, we forward the image as-is (like a normal remove-bg request)
    // The extraction logic will be added based on your steganography method
    
    // Example placeholder for extraction:
    // const hiddenPayload = await extractHiddenData(bodyUint8);
    // Then reconstruct a multipart body with the hidden data as 'image' field
    
    // Generate authentication headers
    const signed = await buildAuthHeaders({ apiKey: API_KEY, bodyBytes: bodyUint8 });

    // Build headers EXACTLY like a normal remove-background request
    const headers = new Headers();
    if (request.headers.has("Content-Type")) {
      headers.set("Content-Type", request.headers.get("Content-Type"));
    }
    headers.set("User-Agent", "NyxAi-Proxy/1.0");
    headers.set("X-Timestamp", signed.timestamp);
    headers.set("X-Nonce", signed.nonce);
    headers.set("X-Signature", signed.signatureHex);

    // Forward to backend - IDENTICAL to normal request
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: headers,
      body: bodyBuffer,
      cf: {
        timeout: 25,
        cacheTtl: 0
      }
    });

    // Return response as-is
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
