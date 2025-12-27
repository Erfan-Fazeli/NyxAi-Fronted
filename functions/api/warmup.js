// Simple health check endpoint to warm up Railway backend
export async function onRequestGet() {
  const BACKEND_URL = "https://nyxai-bg-remover-production.up.railway.app";
  
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'GET',
      cf: { timeout: 10, cacheTtl: 0 }
    });
    
    return new Response(JSON.stringify({
      status: 'ok',
      backend: response.ok ? 'ready' : 'starting',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      status: 'error',
      message: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
