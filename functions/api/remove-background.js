export async function onRequestGet() {
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
  
  const BACKEND_URL = "https://nyxai-bg-remover-production.up.railway.app/api/remove-background";
  const API_KEY = env.API_KEY;
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "Server configuration error: API_KEY missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  const MAX_SIZE_BYTES = 2 * 1024 * 1024;
  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 25000;
  
  try {
    const contentLength = request.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength) > MAX_SIZE_BYTES) {
      return new Response(JSON.stringify({
        error: "File too large for proxy",
        message: "Please use direct backend endpoint for files > 2MB",
        direct_endpoint: BACKEND_URL,
        max_proxy_size: "2MB",
        your_size: `${(parseInt(contentLength) / 1024 / 1024).toFixed(2)}MB`
      }), {
        status: 413, // Payload Too Large
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const bodyBuffer = await request.arrayBuffer();
    const bodyUint8 = new Uint8Array(bodyBuffer);
    
    if (bodyUint8.length > MAX_SIZE_BYTES) {
      return new Response(JSON.stringify({
        error: "File too large for proxy",
        message: "Please use direct backend endpoint for files > 2MB",
        direct_endpoint: BACKEND_URL
      }), {
        status: 413,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Helper to generate signed headers
    async function getSignedHeaders() {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonce = crypto.randomUUID();
      
      const bodyHashBuffer = await crypto.subtle.digest("SHA-256", bodyUint8);
      const bodyHashArray = Array.from(new Uint8Array(bodyHashBuffer));
      const bodyHashHex = bodyHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const stringToSign = `${timestamp}:${nonce}:${bodyHashHex}`;
      
      const encoder = new TextEncoder();
      const keyData = encoder.encode(API_KEY);
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
      
      const headers = new Headers(request.headers);
      headers.delete("Host");
      headers.delete("Content-Length");
      headers.delete("X-API-Key");
      
      headers.set("Content-Length", bodyUint8.length.toString());
      headers.set("X-Timestamp", timestamp);
      headers.set("X-Nonce", nonce);
      headers.set("X-Signature", signatureHex);
      
      return headers;
    }

    // Custom retry logic with fresh headers
    async function fetchWithFreshHeaders(url, retries = MAX_RETRIES) {
      for (let attempt = 0; attempt <= retries; attempt++) {
        let timeoutId = null;
        try {
          const controller = new AbortController();
          timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
          
          // Generate FRESH headers (new nonce) for each attempt
          const signedHeaders = await getSignedHeaders();
          
          const response = await fetch(url, {
            method: "POST",
            headers: signedHeaders,
            body: bodyUint8,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok || response.status < 500) {
            return response;
          }
          
          if (attempt < retries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          return response;
          
        } catch (error) {
          if (timeoutId !== null) {
            clearTimeout(timeoutId);
          }
          
          if (attempt < retries && error.name === 'AbortError') {
            const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          throw error;
        }
      }
    }
    
    try {
      const backendResponse = await fetchWithFreshHeaders(BACKEND_URL);
      return backendResponse;
      
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        return new Response(JSON.stringify({
          error: "Request timeout",
          message: "Backend processing took too long. Try a smaller image or use direct endpoint.",
          direct_endpoint: BACKEND_URL,
          timeout: `${TIMEOUT_MS / 1000} seconds`
        }), {
          status: 504,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      throw fetchError;
    }
    
  } catch (err) {
    let errorMessage = err.message || "Unknown error";
    let statusCode = 500;
    
    if (err.name === 'AbortError') {
      errorMessage = "Request timeout";
      statusCode = 504;
    } else if (err.message.includes('fetch') || err.message.includes('network')) {
      errorMessage = "Failed to connect to backend";
      statusCode = 502;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      direct_endpoint: BACKEND_URL
    }), {
      status: statusCode,
      headers: { "Content-Type": "application/json" }
    });
  }
}