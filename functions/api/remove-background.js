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
  
  // Cloudflare Functions timeout after 30 seconds on free plan, 60s on paid
  const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB limit for proxy processing
  const MAX_RETRIES = 2; // Maximum retry attempts for transient failures
  const TIMEOUT_MS = 25000; // 25 second timeout per request
  
  // Helper function: Exponential backoff retry
  async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Success or non-retryable error
        if (response.ok || response.status < 500) {
          return response;
        }
        
        // Server error (5xx) - retry with backoff
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Max 5s delay
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        return response; // Final attempt failed
        
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Timeout or network error
        if (attempt < retries && error.name === 'AbortError') {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error; // Final attempt or non-retryable error
      }
    }
  }
  
  try {
    // Check Content-Length header to avoid reading large bodies
    const contentLength = request.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength) > MAX_SIZE_BYTES) {
      // Return redirect response for large files
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
    
    // Read the request body as ArrayBuffer
    const bodyBuffer = await request.arrayBuffer();
    const bodyUint8 = new Uint8Array(bodyBuffer);
    
    // Double-check actual size
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
    
    // Forward request to Railway Backend with retry mechanism
    try {
      const backendResponse = await fetchWithRetry(BACKEND_URL, {
        method: "POST",
        headers: newHeaders,
        body: bodyUint8
      });
      
      // Return the backend response to the client
      return backendResponse;
      
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        return new Response(JSON.stringify({
          error: "Request timeout",
          message: "Backend processing took too long after multiple retries. Try a smaller image or use direct endpoint.",
          direct_endpoint: BACKEND_URL,
          timeout: `${TIMEOUT_MS / 1000} seconds`,
          retries_attempted: MAX_RETRIES
        }), {
          status: 504, // Gateway Timeout
          headers: { "Content-Type": "application/json" }
        });
      }
      
      throw fetchError; // Re-throw other errors
    }
    
  } catch (err) {
    // Enhanced error handling
    let errorMessage = err.message || "Unknown error";
    let statusCode = 500;
    
    if (err.name === 'AbortError') {
      errorMessage = "Request timeout - backend took too long";
      statusCode = 504;
    } else if (err.message.includes('fetch') || err.message.includes('network')) {
      errorMessage = "Failed to connect to backend";
      statusCode = 502; // Bad Gateway
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      suggestion: "Try again in a few moments or use direct backend endpoint",
      direct_endpoint: BACKEND_URL,
      max_retries: MAX_RETRIES
    }), {
      status: statusCode,
      headers: { "Content-Type": "application/json" }
    });
  }
}