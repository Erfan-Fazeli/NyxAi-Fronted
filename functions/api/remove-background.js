export async function onRequestGet(context) {
  // Handle GET requests with API information
  return new Response(JSON.stringify({
    endpoint: "/api/remove-background",
    method: "POST",
    content_type: "multipart/form-data",
    required_headers: {
      "X-Timestamp": "Unix timestamp (seconds)",
      "X-Nonce": "Unique nonce (UUID recommended)",
      "X-Signature": "HMAC-SHA256 signature"
    },
    signature_algorithm: "HMAC-SHA256(api_key, '{timestamp}:{nonce}:{body_sha256}')",
    description: "AI-powered background removal service (proxied via Cloudflare)",
    backend: "Railway (https://nyxai-bg-remover-production.up.railway.app)"
  }, null, 2), {
    status: 200,
    headers: { 
      "Content-Type": "application/json",
      "X-Service": "NyxAi-Proxy"
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // Target Backend URL (Railway)
  const BACKEND_URL = "https://nyxai-bg-remover-production.up.railway.app/api/remove-background";
  
  // Normal API Key (Should be set in Cloudflare Pages Settings -> Environment Variables)
  // Fallback to hardcoded key for immediate testing if env var is missing
  const NORMAL_API_KEY = env.API_KEY || "nyx1q2w3e4r5t6y7u8i9o0p"; 
  
  try {
    // Read the request body as ArrayBuffer
    const bodyBuffer = await request.arrayBuffer();
    const bodyUint8 = new Uint8Array(bodyBuffer);
    
    // Check if the request is already signed (e.g. from Proxy Client)
    // UPDATE: For full stealth, we ignore client signatures and ALWAYS sign with the server key.
    // This ensures all traffic looks identical (signed by Cloudflare).
    // The backend will distinguish Proxy vs Normal based on image content (Steganography).
    
    // Prepare headers for the backend request
    // We copy existing headers but need to be careful with some (like Host)
    let newHeaders = new Headers(request.headers);
    
    // Remove headers that might cause issues or are managed by the fetch call
    newHeaders.delete("Host");
    newHeaders.delete("Content-Length"); 
    
    // Always sign the request (Steganographic Auth Mode)
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomUUID();
    
    // 1. Calculate SHA-256 Hash of the Body
    const bodyHashBuffer = await crypto.subtle.digest("SHA-256", bodyUint8);
    const bodyHashArray = Array.from(new Uint8Array(bodyHashBuffer));
    const bodyHashHex = bodyHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 2. Create String to Sign
    const stringToSign = `${timestamp}:${nonce}:${bodyHashHex}`;
    
    // 3. Calculate HMAC-SHA256 Signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(NORMAL_API_KEY);
    const key = await crypto.subtle.importKey(
      "raw", 
      keyData, 
      { name: "HMAC", hash: "SHA-256" }, 
      false, 
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC", 
      key, 
      encoder.encode(stringToSign)
    );
    
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 4. Add Security Headers
    newHeaders.set("X-Timestamp", timestamp);
    newHeaders.set("X-Nonce", nonce);
    newHeaders.set("X-Signature", signatureHex);
    
    // Remove legacy header if present
    newHeaders.delete("X-API-Key");

    
    // Forward request to Railway Backend
    const backendResponse = await fetch(BACKEND_URL, {
      method: "POST",
      headers: newHeaders,
      body: bodyUint8
    });
    
    // Return the backend response to the client
    // We create a new response to ensure we can modify headers if needed (e.g. CORS)
    // But usually passing it through is fine.
    return backendResponse;
    
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}