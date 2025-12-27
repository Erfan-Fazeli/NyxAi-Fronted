// Shared request signing utilities for NyxAi.
// Single source of truth for generating timestamp/nonce/body hash/signature.

function bytesToHex(uint8) {
	return Array.from(uint8)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function sha256Hex(bytes) {
	const buf = await crypto.subtle.digest("SHA-256", bytes);
	return bytesToHex(new Uint8Array(buf));
}

async function hmacSha256Hex(keyString, messageString) {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(keyString),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"]
	);

	const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(messageString));
	return bytesToHex(new Uint8Array(sigBuf));
}

/**
 * Creates HMAC auth headers for the backend.
 * Contract (must match backend `security.py`):
 * stringToSign = "{timestamp}:{nonce}:{sha256(body_bytes)}"
 */
export async function buildAuthHeaders({ apiKey, bodyBytes, nowSeconds }) {
	if (!apiKey) throw new Error("API_KEY missing");

	const timestamp = (nowSeconds ?? Math.floor(Date.now() / 1000)).toString();
	const nonce = crypto.randomUUID();
	const bodyHashHex = await sha256Hex(bodyBytes);
	const stringToSign = `${timestamp}:${nonce}:${bodyHashHex}`;
	const signatureHex = await hmacSha256Hex(apiKey, stringToSign);

	return {
		timestamp,
		nonce,
		bodyHashHex,
		stringToSign,
		signatureHex,
		headers: {
			"X-Timestamp": timestamp,
			"X-Nonce": nonce,
			"X-Signature": signatureHex
		}
	};
}
