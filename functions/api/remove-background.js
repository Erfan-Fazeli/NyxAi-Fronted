export async function onRequestGet() {
  return new Response(JSON.stringify({
    endpoint: "/api/remove-background",
    method: "POST",
    content_type: "multipart/form-data",
    required_fields: {
      "image": "Image file (jpg, png, webp, etc.)"
    },
    description: "AI-powered background removal service",
    note: "This endpoint is only accessible from the frontend UI. Direct external access is restricted."
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

  const { buildAuthHeaders } = await import("../_shared/signature.js");
  
  // ---------------------------------------------------------
  // SECURITY: UI-Only Access Enforcement
  // ---------------------------------------------------------
  const origin = request.headers.get("Origin");
  const referer = request.headers.get("Referer");
  const secFetchSite = request.headers.get("Sec-Fetch-Site");
  
  const allowedDomains = ["nyxagent.dev", "localhost", "127.0.0.1"];
  
  // 1. Origin Check (Strict)
  const isAllowedOrigin = origin && allowedDomains.some(d => origin.includes(d));
  
  // 2. Referer Check (Fallback)
  const isAllowedReferer = referer && allowedDomains.some(d => referer.includes(d));
  
  // 3. Sec-Fetch-Site Check (Modern Browsers)
  // 'same-origin' means request comes from same site.
  const isSameSite = secFetchSite === "same-origin" || secFetchSite === "same-site";

  // Logic: Must be from allowed origin OR allowed referer.
  // If Sec-Fetch-Site is present, it MUST be same-origin/same-site.
  const isAuthorized = (isAllowedOrigin || isAllowedReferer) && (secFetchSite ? isSameSite : true);

  // Bypass for internal debug header
  const isDebug = request.headers.get("X-Debug-Simple") === "true";

  if (!isAuthorized && !isDebug) {
    return new Response(JSON.stringify({ 
      error: "Forbidden",
      message: "Access denied. This API is only accessible via the official UI."
    }), {
      status: 403,
      headers: { 
        "Content-Type": "application/json"
      }
    });
  }
  
  if (isDebug) {
    return new Response(JSON.stringify({
      status: "alive",
      env_api_key_exists: !!env.API_KEY,
      origin: origin,
      referer: referer
    }), { headers: { "Content-Type": "application/json" } });
  }
  
  const BACKEND_URL = "https://nyxai-bg-remover-production.up.railway.app/api/remove-background";
  const API_KEY = env.API_KEY;
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "Server configuration error: API_KEY missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  const MAX_SIZE_BYTES = 2 * 1024 * 1024;
  const MAX_RETRIES = 0; 
  const TIMEOUT_MS = 90000;
  
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
    
  const t0 = Date.now();
  const bodyBuffer = await request.arrayBuffer();
  const t1 = Date.now();
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
    
	// Helper to generate signed headers (single, shared implementation)
	async function getSignedHeaders() {
    const signed = await buildAuthHeaders({ apiKey: API_KEY, bodyBytes: bodyUint8 });

    // Construct CLEAN headers (minimize CF/header surprises)
		const headers = new Headers();
		if (request.headers.has("Content-Type")) {
			headers.set("Content-Type", request.headers.get("Content-Type"));
		}
    // IMPORTANT: do NOT manually set Content-Length on edge runtimes.
    // Let fetch/runtime compute it to avoid mismatch/streaming edge cases.
		headers.set("User-Agent", "NyxAi");

		headers.set("X-Timestamp", signed.timestamp);
		headers.set("X-Nonce", signed.nonce);
		headers.set("X-Signature", signed.signatureHex);

		return { headers, signed };
	}

    // Debug mode
    if (request.headers.get("X-Debug") === "true") {
      const { headers: debugHeaders, signed } = await getSignedHeaders();
		const headersObj = {};
		debugHeaders.forEach((v, k) => headersObj[k] = v);
      return new Response(JSON.stringify({
        debug: true,
        headers: headersObj,
			sign: {
				body_sha256: signed.bodyHashHex,
				string_to_sign: signed.stringToSign
			},
        bodySize: bodyUint8.length,
			timings_ms: {
				read_body: t1 - t0
			}
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Custom retry logic with fresh headers
    async function fetchWithFreshHeaders(url, retries = MAX_RETRIES) {
      for (let attempt = 0; attempt <= retries; attempt++) {
        let timeoutId = null;
        try {
          const controller = new AbortController();
          timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
          
          // Generate FRESH headers (new nonce) for each attempt
      const { headers: signedHeaders } = await getSignedHeaders();
          
          const response = await fetch(url, {
            method: "POST",
            headers: signedHeaders,
      // Send the original ArrayBuffer; avoids some runtime/body coercion edge cases.
            body: bodyBuffer,
            signal: controller.signal,
      // Cloudflare-specific controls (safe to include; ignored in non-CF runtimes)
      cf: {
        // seconds
        timeout: Math.ceil(TIMEOUT_MS / 1000),
        cacheTtl: 0
      }
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
      
      // Add CORS and connection headers to response
      const responseHeaders = new Headers(backendResponse.headers);
      responseHeaders.set('Access-Control-Allow-Origin', origin || '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
      responseHeaders.set('Connection', 'keep-alive');
      
      return new Response(backendResponse.body, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: responseHeaders
      });
      
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